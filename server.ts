import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

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

  // Admin Stats
  app.get('/api/admin/stats', (req, res) => {
    res.json(db.getAdminStats());
  });

  // Admin Portal Security & Authentication
  app.get('/api/admin/auth/status', (req, res) => {
    const auth = db.getAdminAuth();
    // Return masked phone info so admin knows where OTP goes, but not plaintext password
    const maskedPhone = auth.recoveryPhone
      ? auth.recoveryPhone.replace(/(\d{3})\d+(\d{2})/, '$1***$2')
      : 'Registered phone';
    res.json({
      hasPassword: true,
      recoveryPhone: auth.recoveryPhone,
      maskedPhone
    });
  });

  app.post('/api/admin/auth/verify', (req, res) => {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }
    const isValid = db.verifyAdminPassword(password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Incorrect admin password' });
    }
    res.json({ success: true, message: 'Access granted' });
  });

  app.post('/api/admin/auth/send-otp', (req, res) => {
    const { phone } = req.body;
    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    const result = db.generateOtpForPhone(phone);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  app.post('/api/admin/auth/verify-otp-direct', (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone number and OTP code are required' });
    }
    const isValid = db.verifyOtp(phone, otp);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired WhatsApp OTP code' });
    }
    // Clear active OTP once verified
    const auth = db.getAdminAuth();
    auth.activeOtp = null;
    db.saveData(db['data']);
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

  app.post('/api/admin/auth/update-phone', (req, res) => {
    const { phone } = req.body;
    if (!phone || phone.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Valid phone number required' });
    }
    db.setAdminRecoveryPhone(phone);
    res.json({ success: true, message: 'Recovery phone updated successfully' });
  });

  // Simulated payment gateway verification endpoint
  app.post('/api/checkout/process-payment', (req, res) => {
    const { paymentMethod, amount, cardLast4 } = req.body;
    // Simulate secure PCI-DSS tokenized authorization
    setTimeout(() => {
      res.json({
        success: true,
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        status: 'authorized',
        amount,
        paymentMethod,
        cardLast4: cardLast4 || '4242',
        message: 'Payment authorized securely via encrypted gateway'
      });
    }, 600);
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
