import express from 'express';
import path from 'path';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { db, getPublicUser, hashPassword, comparePassword } from './server/db';
import { UserAccount } from './src/types';

interface SessionRecord {
  userId: string;
  role: 'customer' | 'admin';
  email: string;
  createdAt: number;
  expiresAt: number;
}
const sessions = new Map<string, SessionRecord>();

interface ResetTokenRecord {
  token: string;
  userId: string;
  email: string;
  expiresAt: number;
}
const resetTokens = new Map<string, ResetTokenRecord>();

const SESSION_COOKIE_NAME = 'lumina_session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

function createSession(user: UserAccount): string {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, {
    userId: user.id,
    role: user.role,
    email: user.email,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_MAX_AGE
  });
  return token;
}

function getSessionUser(req: express.Request): UserAccount | null {
  let token = req.cookies?.[SESSION_COOKIE_NAME];
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.substring(7).trim();
  }
  if (!token) return null;

  const session = sessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }

  const user = db.getUserById(session.userId);
  if (!user) {
    sessions.delete(token);
    return null;
  }

  return user;
}

function setSessionCookie(res: express.Response, token: string) {
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/'
  });
}

function clearSessionCookie(res: express.Response) {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  });
}

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  (req as any).user = user;
  next();
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Admin authentication required.' });
  }
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Administrator privileges required.' });
  }
  (req as any).user = user;
  next();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Cookie Parser Middleware
  app.use(cookieParser('lumina-poster-art-session-secret'));

  // JSON Body parsing with larger limit for base64 image uploads
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Real-Time Server-Sent Events (SSE)
  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Initial handshake
    res.write(`event: connected\ndata: ${JSON.stringify({ message: 'Connected to live store stream' })}\n\n`);

    const unregister = db.registerSSE((event, data) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    });

    // Keep-alive ping every 25 seconds
    const pingInterval = setInterval(() => {
      res.write(': ping\n\n');
    }, 25000);

    req.on('close', () => {
      clearInterval(pingInterval);
      unregister();
    });
  });

  // Products API
  app.get('/api/products', (req, res) => {
    let products = db.getProducts();
    const { category, search, minPrice, maxPrice, sort, size, collection, featured, bestSeller, newArrival } = req.query;

    if (category && category !== 'All') {
      products = products.filter((p) => p.category.toLowerCase() === String(category).toLowerCase());
    }

    if (collection) {
      products = products.filter((p) => p.collection.toLowerCase() === String(collection).toLowerCase());
    }

    if (featured === 'true') {
      products = products.filter((p) => p.featured);
    }

    if (bestSeller === 'true') {
      products = products.filter((p) => p.isBestSeller);
    }

    if (newArrival === 'true') {
      products = products.filter((p) => p.isNewArrival);
    }

    if (search) {
      const q = String(search).toLowerCase();
      products = products.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.collection.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (minPrice) {
      products = products.filter((p) => (p.discountPrice || p.price) >= Number(minPrice));
    }

    if (maxPrice) {
      products = products.filter((p) => (p.discountPrice || p.price) <= Number(maxPrice));
    }

    if (size) {
      products = products.filter((p) => p.sizes.some((s) => s.dimensions.includes(String(size)) || s.id === String(size)));
    }

    // Sorting
    if (sort === 'price_asc') {
      products.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sort === 'price_desc') {
      products.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (sort === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'newest') {
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'bestseller') {
      products.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    }

    res.json(products);
  });

  app.get('/api/products/:id', (req, res) => {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });

  app.post('/api/products', (req, res) => {
    try {
      const product = db.addProduct(req.body);
      res.status(201).json(product);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to add product' });
    }
  });

  app.post('/api/products/bulk-prices', (req, res) => {
    const { action, value } = req.body;
    if (!action || typeof value !== 'number' || isNaN(value)) {
      return res.status(400).json({ error: 'Valid action (set_all, adjust_percent, adjust_fixed) and numeric value required' });
    }
    const updatedProducts = db.bulkUpdatePrices(action, value);
    res.json({ success: true, updatedCount: updatedProducts.length, products: updatedProducts });
  });

  app.put('/api/products/:id', (req, res) => {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(updated);
  });

  app.delete('/api/products/:id', (req, res) => {
    const success = db.deleteProduct(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, id: req.params.id });
  });

  // Categories API
  app.get('/api/categories', (req, res) => {
    res.json(db.getCategories());
  });

  app.post('/api/categories', (req, res) => {
    const newCat = db.addCategory(req.body);
    res.status(201).json(newCat);
  });

  // Orders API
  app.get('/api/orders', (req, res) => {
    const { email } = req.query;
    let orders = db.getOrders();
    if (email) {
      orders = orders.filter((o) => o.customer.email.toLowerCase() === String(email).toLowerCase());
    }
    res.json(orders);
  });

  app.get('/api/orders/:id', (req, res) => {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  });

  app.post('/api/orders', (req, res) => {
    try {
      const order = db.createOrder(req.body);
      res.status(201).json(order);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create order' });
    }
  });

  app.patch('/api/orders/:id/status', (req, res) => {
    const { status, note, trackingNumber, carrier } = req.body;
    const updated = db.updateOrderStatus(req.params.id, status, note, trackingNumber, carrier);
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(updated);
  });

  app.post('/api/orders/:id/cancel', (req, res) => {
    const { reason, cancelledBy } = req.body;
    const updated = db.cancelOrder(req.params.id, reason, cancelledBy);
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(updated);
  });

  // Coupons API
  app.get('/api/coupons', (req, res) => {
    res.json(db.getCoupons());
  });

  app.post('/api/coupons/validate', (req, res) => {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ valid: false, error: 'Coupon code required' });
    }
    const result = db.validateCoupon(code, Number(subtotal || 0));
    res.json(result);
  });

  app.post('/api/coupons', (req, res) => {
    const coupon = db.addCoupon(req.body);
    res.status(201).json(coupon);
  });

  app.patch('/api/coupons/:code/toggle', (req, res) => {
    const coupon = db.toggleCoupon(req.params.code);
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    res.json(coupon);
  });

  // Reviews API
  app.get('/api/reviews', (req, res) => {
    const { productId } = req.query;
    res.json(db.getReviews(productId ? String(productId) : undefined));
  });

  app.post('/api/reviews', (req, res) => {
    try {
      const review = db.addReview(req.body);
      res.status(201).json(review);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to submit review' });
    }
  });

  app.delete('/api/reviews/:id', (req, res) => {
    const success = db.deleteReview(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ success: true });
  });

  // Support Tickets API
  app.get('/api/support/tickets', (req, res) => {
    res.json(db.getSupportTickets());
  });

  app.post('/api/support/tickets', (req, res) => {
    const { name, email, subject, message, category, priority, orderNumber, phone } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Name, email, subject, and message are required.' });
    }
    const ticket = db.createSupportTicket({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      category: category || 'General Inquiry',
      priority: priority || 'Medium',
      orderNumber: orderNumber ? orderNumber.trim() : undefined,
      phone: phone ? phone.trim() : undefined
    });
    res.status(201).json(ticket);
  });

  app.post('/api/support/tickets/:id/reply', (req, res) => {
    const { sender, senderName, message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message content is required.' });
    }
    const updated = db.addTicketResponse(
      req.params.id,
      sender || 'Support Agent',
      senderName || 'Support Specialist',
      message.trim()
    );
    if (!updated) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(updated);
  });

  app.patch('/api/support/tickets/:id/status', (req, res) => {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    const updated = db.updateTicketStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(updated);
  });

  // ==========================================
  // AUTHENTICATION & USER SESSIONS (EMAIL + PASSWORD)
  // ==========================================

  // Customer Registration
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password, confirmPassword, phone } = req.body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Full name is required.' });
      }
      if (!email || typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({ error: 'Email address is required.' });
      }
      const trimmedEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }

      if (!password || typeof password !== 'string') {
        return res.status(400).json({ error: 'Password is required.' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      if (confirmPassword !== undefined && password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
      }

      // Check if user already exists in database
      const existing = db.getUserByEmail(trimmedEmail);
      if (existing) {
        return res.status(409).json({ error: 'An account with this email address already exists. Please log in.' });
      }

      // Hash password using bcryptjs
      const passwordHash = await hashPassword(password);

      // Create new customer account in real database
      const newUser = db.createUser({
        name: name.trim(),
        email: trimmedEmail,
        passwordHash,
        role: 'customer',
        phone: phone ? String(phone).trim() : ''
      });

      // Issue session token and secure HttpOnly cookie
      const token = createSession(newUser);
      setSessionCookie(res, token);

      return res.status(201).json({
        success: true,
        user: getPublicUser(newUser),
        token
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      return res.status(500).json({ error: 'An error occurred during registration. Please try again.' });
    }
  });

  // Customer / User Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const trimmedEmail = String(email).trim().toLowerCase();
      const user = await db.verifyUserCredentials(trimmedEmail, String(password));

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // Create session and set cookie
      const token = createSession(user);
      setSessionCookie(res, token);

      return res.json({
        success: true,
        user: getPublicUser(user),
        token
      });
    } catch (err: any) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'An unexpected error occurred during login.' });
    }
  });

  // Session Verification (Restore state on page reload)
  app.get('/api/auth/me', (req, res) => {
    const user = getSessionUser(req);
    if (!user) {
      return res.status(401).json({ authenticated: false, user: null });
    }
    return res.json({
      authenticated: true,
      user: getPublicUser(user)
    });
  });

  // Logout (Invalidate session on server & clear cookie)
  app.post('/api/auth/logout', (req, res) => {
    let token = req.cookies?.[SESSION_COOKIE_NAME];
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7).trim();
    }
    if (token) {
      sessions.delete(token);
    }
    clearSessionCookie(res);
    return res.json({ success: true, message: 'Logged out successfully.' });
  });

  // Request Password Reset Link (Forgot Password)
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({ error: 'Please enter your account email address.' });
      }
      const trimmedEmail = email.trim().toLowerCase();
      const user = db.getUserByEmail(trimmedEmail);

      if (!user) {
        return res.status(404).json({ error: 'No registered collector account found with this email address.' });
      }

      // Generate unique secure reset token valid for 1 hour
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
      resetTokens.set(resetToken, {
        token: resetToken,
        userId: user.id,
        email: user.email,
        expiresAt
      });

      const host = req.headers.host || 'localhost:3000';
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
      const origin = `${protocol}://${host}`;
      const resetLink = `${origin}/?resetToken=${resetToken}`;

      console.log(`[AUTH] Password recovery link generated for ${user.email}: ${resetLink}`);

      return res.json({
        success: true,
        message: `A secure password recovery link has been generated and sent for ${user.email}`,
        email: user.email,
        resetToken,
        resetLink
      });
    } catch (err: any) {
      console.error('Forgot password error:', err);
      return res.status(500).json({ error: 'Failed to process password recovery request. Please try again.' });
    }
  });

  // Verify Reset Token
  app.get('/api/auth/verify-reset-token', (req, res) => {
    const token = String(req.query.token || '').trim();
    if (!token) {
      return res.status(400).json({ valid: false, error: 'Reset token is required.' });
    }
    const record = resetTokens.get(token);
    if (!record) {
      return res.status(404).json({ valid: false, error: 'Password reset link is invalid or has already been used.' });
    }
    if (Date.now() > record.expiresAt) {
      resetTokens.delete(token);
      return res.status(410).json({ valid: false, error: 'Password reset link has expired. Please request a new link.' });
    }
    return res.json({ valid: true, email: record.email, token: record.token });
  });

  // Reset Password using Token
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, newPassword, confirmPassword } = req.body;
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: 'Password reset token is required.' });
      }
      const record = resetTokens.get(token);
      if (!record) {
        return res.status(400).json({ error: 'This password reset link is invalid or has already been used.' });
      }
      if (Date.now() > record.expiresAt) {
        resetTokens.delete(token);
        return res.status(400).json({ error: 'This password reset link has expired. Please request a new link.' });
      }

      if (!newPassword || typeof newPassword !== 'string') {
        return res.status(400).json({ error: 'New password is required.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      }
      if (confirmPassword !== undefined && newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
      }

      const user = db.getUserById(record.userId);
      if (!user) {
        return res.status(404).json({ error: 'Associated user account was not found.' });
      }

      // Hash new password using bcrypt
      const passwordHash = await hashPassword(newPassword);
      const updatedUser = db.updateUser(user.id, { passwordHash });

      // Invalidate consumed token
      resetTokens.delete(token);

      if (!updatedUser) {
        return res.status(500).json({ error: 'Failed to update user password.' });
      }

      // Automatically authenticate and issue session
      const sessionToken = createSession(updatedUser);
      setSessionCookie(res, sessionToken);

      return res.json({
        success: true,
        message: 'Your password has been successfully reset! You are now logged in.',
        user: getPublicUser(updatedUser),
        token: sessionToken
      });
    } catch (err: any) {
      console.error('Reset password error:', err);
      return res.status(500).json({ error: 'An unexpected error occurred while resetting password.' });
    }
  });

  // Update Profile & Addresses
  app.put('/api/auth/profile', requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user as UserAccount;
      const { name, phone, addresses, wishlist, currentPassword, newPassword } = req.body;

      const updates: Partial<UserAccount> = {};
      if (name && typeof name === 'string' && name.trim()) {
        updates.name = name.trim();
      }
      if (phone !== undefined) {
        updates.phone = String(phone).trim();
      }
      if (Array.isArray(addresses)) {
        updates.addresses = addresses;
      }
      if (Array.isArray(wishlist)) {
        updates.wishlist = wishlist;
      }

      // If user wants to change their password
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ error: 'Current password is required to change password.' });
        }
        const isMatch = await comparePassword(currentPassword, currentUser.passwordHash || '');
        if (!isMatch) {
          return res.status(400).json({ error: 'Current password is incorrect.' });
        }
        if (newPassword.length < 6) {
          return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
        }
        updates.passwordHash = await hashPassword(newPassword);
      }

      const updatedUser = db.updateUser(currentUser.id, updates);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User account not found.' });
      }

      return res.json({
        success: true,
        user: getPublicUser(updatedUser)
      });
    } catch (err: any) {
      console.error('Profile update error:', err);
      return res.status(500).json({ error: 'Failed to update profile.' });
    }
  });

  // ==========================================
  // ADMIN PORTAL AUTHENTICATION & OPERATIONS
  // ==========================================

  // Admin Stats (Requires Admin privileges)
  app.get('/api/admin/stats', (req, res) => {
    const user = getSessionUser(req);
    if (user && user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Administrator privileges required.' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Admin authentication required.' });
    }
    res.json(db.getAdminStats());
  });

  // Admin Login (Email + Password)
  app.post('/api/admin/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const trimmedEmail = String(email).trim().toLowerCase();
      const user = await db.verifyUserCredentials(trimmedEmail, String(password));

      if (!user) {
        return res.status(401).json({ error: 'Invalid admin credentials.' });
      }

      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied: This account does not have administrator privileges.' });
      }

      const token = createSession(user);
      setSessionCookie(res, token);

      return res.json({
        success: true,
        user: getPublicUser(user),
        token
      });
    } catch (err: any) {
      console.error('Admin login error:', err);
      return res.status(500).json({ error: 'Admin authentication failed.' });
    }
  });

  // Admin Auth Verify (Supports existing callers and password check)
  app.post('/api/admin/auth/verify', async (req, res) => {
    try {
      const { email, password } = req.body;

      // 1. If existing session is already an admin
      const sessionUser = getSessionUser(req);
      if (sessionUser && sessionUser.role === 'admin') {
        return res.json({ success: true, message: 'Admin session active', user: getPublicUser(sessionUser) });
      }

      // 2. If email and password provided
      if (email && password) {
        const user = await db.verifyUserCredentials(String(email).trim().toLowerCase(), String(password));
        if (!user || user.role !== 'admin') {
          return res.status(401).json({ success: false, message: 'Invalid admin credentials or insufficient privileges.' });
        }
        const token = createSession(user);
        setSessionCookie(res, token);
        return res.json({ success: true, message: 'Admin authenticated', user: getPublicUser(user), token });
      }

      // 3. If only password provided
      if (password) {
        const adminUser = await db.verifyAdminCredentials(String(password));
        if (!adminUser) {
          return res.status(401).json({ success: false, message: 'Incorrect admin password.' });
        }
        const token = createSession(adminUser);
        setSessionCookie(res, token);
        return res.json({ success: true, message: 'Access granted', user: getPublicUser(adminUser), token });
      }

      return res.status(400).json({ success: false, message: 'Admin credentials required.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Verification error' });
    }
  });

  // Admin Auth Status
  app.get('/api/admin/auth/status', (req, res) => {
    const user = getSessionUser(req);
    const auth = db.getAdminAuth();
    const maskedPhone = auth.recoveryPhone
      ? auth.recoveryPhone.replace(/(\d{3})\d+(\d{2})/, '$1***$2')
      : 'Registered phone';
    res.json({
      hasPassword: true,
      recoveryPhone: auth.recoveryPhone,
      maskedPhone,
      isAdmin: user?.role === 'admin',
      adminUser: user?.role === 'admin' ? getPublicUser(user) : null
    });
  });

  app.post('/api/admin/auth/send-otp', (req, res) => {
    const { phone } = req.body;
    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    const result = db.generateOtpForPhone(phone);
    res.json(result);
  });

  app.post('/api/admin/auth/verify-otp-direct', (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone number and OTP code are required' });
    }
    const isValid = db.verifyAndConsumeOtp(phone, otp);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
    }
    res.json({ success: true, message: 'OTP verified successfully! Access granted.' });
  });

  app.post('/api/admin/auth/reset-password', (req, res) => {
    const { phone, otp, newPassword } = req.body;
    if (!phone || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Phone, OTP code, and new password are required' });
    }
    const result = db.resetPasswordWithOtp(phone, otp, newPassword);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  app.post('/api/admin/auth/update-phone', requireAdmin, (req, res) => {
    const { phone } = req.body;
    if (!phone || phone.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Valid phone number required' });
    }
    db.setAdminRecoveryPhone(phone);
    res.json({ success: true, message: 'Recovery phone updated successfully' });
  });

  // Admin Logout
  app.post('/api/admin/auth/logout', (req, res) => {
    const token = req.cookies?.[SESSION_COOKIE_NAME];
    if (token) {
      sessions.delete(token);
    }
    clearSessionCookie(res);
    res.json({ success: true, message: 'Admin signed out successfully.' });
  });

  // Admin Users Management (Protected: requires admin role)
  app.get('/api/admin/users', requireAdmin, (req, res) => {
    const users = db.getUsers().map(getPublicUser);
    res.json(users);
  });

  app.patch('/api/admin/users/:id/role', requireAdmin, (req, res) => {
    const { role } = req.body;
    if (role !== 'customer' && role !== 'admin') {
      return res.status(400).json({ error: 'Invalid role specified.' });
    }
    const updated = db.updateUser(req.params.id, { role });
    if (!updated) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ success: true, user: getPublicUser(updated) });
  });

  app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
    const target = db.getUserById(req.params.id);
    if (!target) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const currentAdmin = (req as any).user as UserAccount;
    if (target.id === currentAdmin.id) {
      return res.status(400).json({ error: 'You cannot delete your own admin account.' });
    }
    db.deleteUser(req.params.id);
    res.json({ success: true });
  });

  // Simulated payment gateway verification endpoint (Cards, UPI, Apple Pay, PayPal)
  app.post('/api/checkout/process-payment', (req, res) => {
    const { paymentMethod, amount, cardLast4, upiId, upiApp } = req.body;
    // Simulate secure PCI-DSS / NPCI tokenized authorization
    setTimeout(() => {
      const isUpi = paymentMethod === 'UPI';
      const upiRefNumber = isUpi ? `UPI${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}` : undefined;

      res.json({
        success: true,
        transactionId: isUpi 
          ? `upi_txn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
          : `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        status: 'authorized',
        amount,
        paymentMethod,
        cardLast4: isUpi ? undefined : (cardLast4 || '4242'),
        upiId: isUpi ? (upiId || 'collector@upi') : undefined,
        upiApp: isUpi ? (upiApp || 'BHIM UPI') : undefined,
        upiRefNumber,
        message: isUpi
          ? `UPI payment authorized via ${upiApp || 'UPI'} (${upiId || 'collector@upi'})`
          : 'Payment authorized securely via encrypted gateway'
      });
    }, 600);
  });

  // AI Customer Support Chat Endpoint (Powered by Gemini API)
  const STORE_SYSTEM_INSTRUCTION = `You are Lumina AI, the friendly, articulate, and highly knowledgeable AI customer support specialist for Lumina Art Posters (a premium e-commerce store specializing in museum-grade physical art prints, gallery framing, and custom sizes).

Here is the exact information about Lumina Art Posters to answer customer questions accurately:

1. SHIPPING & DELIVERY:
- Dispatch: All poster prints and framed artworks are printed on demand and dispatched within 1-2 business days.
- Standard Shipping: Takes 3-5 business days. Flat rate of $8.95 (FREE on orders over $100).
- Express Shipping: Takes 1-2 business days for $18.00.
- International Shipping: Available worldwide with full courier tracking (5-10 business days).
- Packaging: Unframed prints ship in heavy-duty reinforced craft tubes. Framed art prints are securely encased in corner protectors and heavy-duty double-walled protective flat boxes with zero plastic packaging.
- Order Tracking: Tracking numbers are sent automatically via email and SMS as soon as the order is handed to courier (FedEx / UPS / DHL).

2. FRAMING OPTIONS & MATERIALS:
- Frames Available: 
  * Solid Natural Oak: Handcrafted real oak hardwood with warm grain finish.
  * Matte Black Aluminum: Gallery-grade anodized sleek metal frame.
  * Pure White Wood: Modern painted solid hardwood frame.
- Glass & Glazing: High-clarity optical museum-grade cast acrylic. It is shatter-resistant, lightweight, and filters out 92% of UV rays to prevent fading over time.
- Sizes:
  * A4: 21 x 30 cm / 8.3 x 11.7 in (Ideal for gallery walls & small desks)
  * A3: 30 x 42 cm / 11.7 x 16.5 in (Popular medium accent size)
  * A2: 42 x 60 cm / 16.5 x 23.4 in (Standard statement art size)
  * A1: 60 x 84 cm / 23.4 x 33.1 in (Large feature focal piece)
- Custom Sizing: Custom print sizes and bespoke frame options are available upon request via our Support page.

3. PRINT QUALITY & PAPER:
- Paper Stock: 250 GSM heavy archival giclée matte paper with a smooth non-glare velvet surface.
- Inks: 12-color archival pigment-based giclée inks with a 100+ year fade-resistance guarantee.
- Sustainability: Paper is 100% FSC-certified from sustainably managed forests.

4. RETURNS & REPLACEMENTS:
- 30-day money-back guarantee for unused items.
- Free instant replacement if a print or frame arrives damaged in transit—customers can submit a ticket on our Support page.

5. TONE & FORMATTING:
- Be warm, helpful, polite, concise, and articulate.
- Use clean formatting (bullet points, bold text) when listing specs.
- Keep answers under 150 words unless detailed information is explicitly requested.
- If a customer needs personalized order-specific help, invite them to submit a ticket on our Support page.`;

  let aiClientInstance: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (aiClientInstance) return aiClientInstance;
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    aiClientInstance = new GoogleGenAI({ apiKey: key });
    return aiClientInstance;
  }

  app.post('/api/ai-chat', async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      const ai = getGeminiClient();
      if (ai) {
        const formattedHistory = Array.isArray(history)
          ? history.slice(-6).map((h: { role: string; text: string }) => ({
              role: h.role === 'user' ? 'user' : 'model',
              parts: [{ text: h.text }]
            }))
          : [];

        formattedHistory.push({
          role: 'user',
          parts: [{ text: message }]
        });

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: formattedHistory,
          config: {
            systemInstruction: STORE_SYSTEM_INSTRUCTION,
            temperature: 0.7,
          }
        });

        const text = response.text || "I'm happy to help! Let me know if you have any questions about our shipping times, frame materials, or archival paper options.";
        return res.json({ reply: text });
      } else {
        // Intelligent fallback if GEMINI_API_KEY is not set
        const q = message.toLowerCase();
        let reply = "I'm Lumina AI Assistant!";
        if (q.includes('ship') || q.includes('delivery') || q.includes('track') || q.includes('arrive')) {
          reply = "🚚 **Shipping & Delivery Info:**\n• Orders dispatch within 1–2 business days.\n• Standard Shipping: 3–5 business days ($8.95 or FREE over $100).\n• Express Shipping: 1–2 business days ($18.00).\n• All orders ship in protective tubes or flat double-walled boxes with full tracking.";
        } else if (q.includes('frame') || q.includes('glass') || q.includes('wood') || q.includes('oak') || q.includes('size')) {
          reply = "🖼️ **Framing Options & Sizes:**\n• Frame Choices: Solid Natural Oak, Gallery Matte Black Aluminum, or Pure White Wood.\n• Glass: 92% UV-blocking, shatter-resistant optical museum acrylic.\n• Available Sizes: A4 (8x12 in), A3 (12x16 in), A2 (16x24 in), and A1 (24x33 in).";
        } else if (q.includes('paper') || q.includes('print') || q.includes('quality') || q.includes('ink') || q.includes('material')) {
          reply = "🎨 **Print Materials & Quality:**\n• 250 GSM heavy archival giclée matte paper.\n• 12-color archival pigment inks with 100+ year fade resistance.\n• FSC-certified sustainable wood fiber.";
        } else if (q.includes('return') || q.includes('refund') || q.includes('damage')) {
          reply = "📦 **Returns & Replacements:**\n• 30-day money-back guarantee.\n• Free instant replacement for items damaged during transit via our Support page ticket system!";
        } else {
          reply = "Hello! I'm Lumina AI. I can answer any questions about our **shipping times**, **gallery framing materials**, **archival print quality**, and **sizes**. What would you like to know?";
        }
        return res.json({ reply });
      }
    } catch (err) {
      console.error('AI Chat Endpoint error:', err);
      const q = (req.body.message || '').toLowerCase();
      let reply = "I'm Lumina AI! Our art prints are printed on 250 GSM archival giclée paper with optional museum-grade oak, black aluminum, or white wood frames. Standard shipping takes 3-5 days (free over $100).";
      if (q.includes('ship') || q.includes('delivery')) {
        reply = "🚚 Standard shipping takes 3-5 business days ($8.95 or free over $100). Orders dispatch in 1-2 days with FedEx/UPS/DHL tracking.";
      } else if (q.includes('frame') || q.includes('size')) {
        reply = "🖼️ We offer Solid Natural Oak, Matte Black Aluminum, and Pure White Wood frames in A4, A3, A2, and A1 sizes with 92% UV protection acrylic glass.";
      }
      return res.json({ reply });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lumina Art Posters Server running on http://localhost:${PORT}`);
  });
}

startServer();
