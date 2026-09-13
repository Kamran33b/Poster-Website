import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  KeyRound, 
  Smartphone, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle2, 
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  // Mode: 'login' (Enter password) | 'forgot_request_otp' (Enter phone) | 'forgot_verify_otp' (Enter OTP + new password)
  const [mode, setMode] = useState<'login' | 'forgot_request_otp' | 'forgot_verify_otp'>('login');

  // Login form state
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recovery form state
  const [phone, setPhone] = useState('');
  const [maskedPhone, setMaskedPhone] = useState<string>('');
  const [otpCode, setOtpCode] = useState('');
  const [receivedOtpBanner, setReceivedOtpBanner] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Load registered recovery phone status on open
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setErrorMessage(null);
      setSuccessMessage(null);
      setReceivedOtpBanner(null);
      setMode('login');

      fetch('/api/admin/auth/status')
        .then((res) => res.json())
        .then((data) => {
          if (data.recoveryPhone) {
            setPhone(data.recoveryPhone);
            setMaskedPhone(data.maskedPhone || data.recoveryPhone);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle password login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!password) {
      setErrorMessage('Please enter the admin password');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Incorrect admin password. Click "Forgot password?" to reset.');
        return;
      }

      // Store in session and fire callback
      sessionStorage.setItem('lumina_admin_authenticated', 'true');
      onSuccess();
    } catch {
      setErrorMessage('Unable to verify credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle sending OTP to phone
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setReceivedOtpBanner(null);

    if (!phone || phone.trim().length < 6) {
      setErrorMessage('Please provide a valid registered phone number');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Could not send OTP. Verify your phone number.');
        return;
      }

      setSuccessMessage(`OTP sent to ${phone}`);
      // Present the simulated SMS OTP notification banner directly for rapid verification
      if (data.otpCode) {
        setReceivedOtpBanner(data.otpCode);
        setOtpCode(data.otpCode); // Pre-fill or make one-click copyable
      }
      setMode('forgot_verify_otp');
    } catch {
      setErrorMessage('Failed to transmit OTP. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP verification and resetting the password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!otpCode || otpCode.trim().length < 4) {
      setErrorMessage('Please enter the 6-digit OTP code');
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          otp: otpCode.trim(),
          newPassword: newPassword.trim()
        })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'OTP verification failed or expired');
        return;
      }

      setSuccessMessage('Password reset successfully! You may now sign in.');
      setPassword(newPassword.trim());
      setMode('login');
      setReceivedOtpBanner(null);
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setErrorMessage('Failed to reset password. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      id="admin-auth-modal-overlay"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      style={{ zIndex: 9999 }}
    >
      {/* Dark backdrop */}
      <div 
        className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card Centered */}
      <div 
        id="admin-auth-card"
        className="relative z-10 bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-auto animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Top Dismiss Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-stone-900 text-amber-400 mx-auto flex items-center justify-center shadow-md mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-950">
            {mode === 'login' && 'Admin Portal Access'}
            {mode === 'forgot_request_otp' && 'Reset Admin Password'}
            {mode === 'forgot_verify_otp' && 'Verify OTP & Set Password'}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {mode === 'login' && 'Enter your password to unlock the store management CMS'}
            {mode === 'forgot_request_otp' && 'Verify using your registered mobile number — no email required'}
            {mode === 'forgot_verify_otp' && 'Enter the 6-digit OTP code sent to your phone'}
          </p>
        </div>

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Simulated Instant SMS / WhatsApp Notification Banner */}
        {receivedOtpBanner && (
          <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-xs">
            <div className="flex items-center justify-between font-bold text-amber-900 mb-1">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-amber-700" />
                <span>Simulated SMS & WhatsApp Verification</span>
              </span>
              <span className="text-[10px] bg-amber-200/80 px-1.5 py-0.5 rounded text-amber-800 font-mono">Instant Delivery</span>
            </div>
            <p className="text-stone-700 text-[11px] leading-relaxed">
              LUMINA Admin Security Code: <span className="font-mono font-bold text-sm text-stone-950 bg-white px-2 py-0.5 rounded border border-amber-300 ml-1">{receivedOtpBanner}</span>
            </p>
            <div className="mt-2 pt-2 border-t border-amber-200/70 flex items-center justify-between text-[11px]">
              <span className="text-stone-500">Auto-filled in input below</span>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Your LUMINA Admin Portal security OTP is: ${receivedOtpBanner}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 hover:underline"
              >
                <span>Send to WhatsApp chat</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        )}

        {/* 1. LOGIN MODE */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-stone-800">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot_request_otp');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs font-medium text-amber-700 hover:text-amber-800 underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full pl-4 pr-10 py-3 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 text-stone-900 font-mono text-sm tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                id="admin-login-submit"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Access...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>Open Admin Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="pt-2 text-center">
              <span className="text-[11px] text-stone-400">
                Default password: <span className="font-mono text-stone-600 font-bold">admin123</span>
              </span>
            </div>
          </form>
        )}

        {/* 2. FORGOT PASSWORD -> STEP 1: PHONE NUMBER & OTP REQUEST */}
        {mode === 'forgot_request_otp' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                Registered Mobile / WhatsApp Number
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                  <Smartphone className="w-4 h-4" />
                </span>
                <input
                  id="admin-phone-input"
                  type="tel"
                  required
                  autoFocus
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555-234-5678 or your WhatsApp number"
                  className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 text-stone-900 font-mono text-sm"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5">
                You can use your mobile or WhatsApp number. A 6-digit OTP code is generated instantly without any email.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                id="admin-send-otp-submit"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="w-full py-2.5 text-stone-600 hover:text-stone-900 text-xs font-medium flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Password Login</span>
              </button>
            </div>
          </form>
        )}

        {/* 3. FORGOT PASSWORD -> STEP 2: VERIFY OTP & ENTER NEW PASSWORD */}
        {mode === 'forgot_verify_otp' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-stone-800">
                  6-Digit OTP Code
                </label>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-[11px] text-amber-700 hover:text-amber-800 underline"
                >
                  Resend OTP
                </button>
              </div>
              <input
                id="admin-otp-input"
                type="text"
                maxLength={6}
                required
                autoFocus
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 text-center font-mono text-xl tracking-[0.3em] font-bold text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                New Admin Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-4 pr-10 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 text-stone-900 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                Confirm New Password
              </label>
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 text-stone-900 font-mono text-xs"
              />
            </div>

            <div className="pt-2 space-y-2">
              <button
                id="admin-reset-submit"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Reset Password & Proceed</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('forgot_request_otp');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="w-full py-2 text-stone-600 hover:text-stone-900 text-xs font-medium flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Phone Number</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
