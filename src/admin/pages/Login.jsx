import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import '../../styles/admin.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: request OTP, 2: verify OTP & reset
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let el = document.querySelector('meta[name="robots"]');
    if (el) el.setAttribute('content', 'noindex, nofollow');
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Kripya apna registered admin email enter karein');
      return;
    }
    if (!password) {
      setError('Kripya apna password enter karein');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      navigate('/admin');
    } catch (err) {
      const msg = err.response?.data?.message || 'Galat email ya password. Kripya dobara koshish karein.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send OTP to admin email via Resend
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError('Kripya registered admin email enter karein');
      return;
    }
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail.trim() });
      if (res.data?.success) {
        setForgotSuccess(res.data.message || 'OTP aapke email par bhej diya gaya hai!');
        setForgotStep(2);
        setCountdown(60); // 60s cooldown for resend
      } else {
        setForgotError(res.data?.message || 'OTP bhejne me samasya aayi.');
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Email par OTP nahi bheja ja saka.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: Verify OTP and reset password
  const handleVerifyOtpAndReset = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotOtp.trim()) {
      setForgotError('Kripya 6-digit OTP code enter karein');
      return;
    }
    if (newPassword.length < 4) {
      setForgotError('Naya password kam se kam 4 akshar ka hona chahiye');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotError('New Password aur Confirm Password aapas me match nahi kar rahe hain');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await api.post('/auth/verify-reset-otp', {
        email: forgotEmail.trim(),
        otp: forgotOtp.trim(),
        newPassword,
      });

      if (res.data?.success) {
        setForgotSuccess('✅ Password safalta-purvak badal gaya hai! Ab naye password se login karein.');
        setPassword(newPassword);
        setEmail(forgotEmail.trim());
        setTimeout(() => {
          setForgotModalOpen(false);
          setForgotStep(1);
          setForgotOtp('');
          setNewPassword('');
          setConfirmNewPassword('');
        }, 2200);
      } else {
        setForgotError(res.data?.message || 'Password reset nahi ho saka.');
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Galat OTP ya reset error.');
    } finally {
      setForgotLoading(false);
    }
  };

  const openForgotModal = () => {
    setForgotModalOpen(true);
    setForgotStep(1);
    setForgotError('');
    setForgotSuccess('');
    if (email && email.trim()) {
      setForgotEmail(email.trim());
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <img
            src="/logo.webp"
            alt="STAR HOME INTERIOR"
            style={{ height: 48, width: 'auto', margin: '0 auto 12px', display: 'block', borderRadius: 4 }}
          />
          <h1>STAR HOME INTERIOR</h1>
          <p style={{ color: '#888', fontSize: 12, margin: '4px 0 0' }}>Security & Access Portal</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="adm-alert adm-alert-error" style={{ fontSize: 13, lineHeight: 1.5 }}>
              {error}
            </div>
          )}

          {/* Mandatory Admin Email */}
          <div className="adm-form-group" style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: '#d1d5db', fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Admin Email (ईमेल आईडी) *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="e.g. admin@starhomeinterior.in"
              autoFocus
              style={{ width: '100%' }}
            />
          </div>

          {/* Mandatory Admin Password */}
          <div className="adm-form-group" style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: '#d1d5db', fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Password (पासवर्ड) *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter admin password"
                style={{ width: '100%', paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', fontSize: 14, cursor: 'pointer' }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
            <button
              type="button"
              onClick={openForgotModal}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#d97706',
                fontSize: 12,
                cursor: 'pointer',
                padding: '4px 0',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                textDecoration: 'underline',
              }}
            >
              🔒 Forgot Password? (पासवर्ड भूल गए?)
            </button>
          </div>

          <button type="submit" className="adm-btn adm-btn-primary adm-btn-full" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? 'Logging in...' : 'Login to Dashboard'}
          </button>
        </form>
      </div>

      {/* ================= FORGOT PASSWORD MODAL (RESEND OTP) ================= */}
      {forgotModalOpen && (
        <div className="adm-modal-overlay" onClick={() => !forgotLoading && setForgotModalOpen(false)} style={{ zIndex: 10000 }}>
          <div
            className="adm-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 460, width: '92%', borderRadius: 14, overflow: 'hidden', background: '#111827', border: '1px solid #1f2937' }}
          >
            {/* Modal Header */}
            <div style={{ background: 'linear-gradient(135deg, #1f2937, #111827)', padding: '20px 24px', borderBottom: '1px solid #374151' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: 18, color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                  <span style={{ color: '#f59e0b' }}>🔐</span> Password Reset
                </h3>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 20, cursor: 'pointer', padding: 0 }}
                >
                  ✕
                </button>
              </div>
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#9ca3af' }}>
                Star Home Interior Admin Portal &bull; Resend Email OTP Verification
              </p>
            </div>

            <div style={{ padding: '24px' }}>
              {forgotError && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  marginBottom: 16,
                  fontSize: 12,
                  background: 'rgba(239,68,68,0.12)',
                  border: '1px solid #ef4444',
                  color: '#f87171',
                  lineHeight: 1.5,
                }}>
                  {forgotError}
                </div>
              )}

              {forgotSuccess && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  marginBottom: 16,
                  fontSize: 12,
                  background: 'rgba(16,185,129,0.12)',
                  border: '1px solid #10b981',
                  color: '#34d399',
                  lineHeight: 1.5,
                }}>
                  {forgotSuccess}
                </div>
              )}

              {/* STEP 1: ENTER EMAIL TO RECEIVE OTP */}
              {forgotStep === 1 && (
                <form onSubmit={handleSendOtp}>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontSize: 12, color: '#d1d5db', marginBottom: 6, fontWeight: 600 }}>
                      Registered Admin Email (पंजीकृत ईमेल)
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. admin@starhomeinterior.in"
                      required
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        background: '#030712',
                        border: '1px solid #374151',
                        borderRadius: 8,
                        color: '#f9fafb',
                        fontSize: 14,
                        boxSizing: 'border-box',
                      }}
                    />
                    <span style={{ fontSize: 11, color: '#9ca3af', marginTop: 6, display: 'block' }}>
                      ⚡ Resend email service ke zariye is address par 6-digit OTP code bheja jayega.
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                    <button
                      type="button"
                      onClick={() => setForgotModalOpen(false)}
                      disabled={forgotLoading}
                      style={{
                        flex: 1,
                        padding: '11px',
                        background: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: 8,
                        color: '#d1d5db',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      style={{
                        flex: 2,
                        padding: '11px',
                        background: 'linear-gradient(135deg, #d97706, #b45309)',
                        border: 'none',
                        borderRadius: 8,
                        color: '#ffffff',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: forgotLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      {forgotLoading ? 'Sending OTP via Resend...' : '📩 Send OTP to Email'}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: ENTER OTP & NEW PASSWORD */}
              {forgotStep === 2 && (
                <form onSubmit={handleVerifyOtpAndReset}>
                  <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>OTP Bheja gaya:</div>
                    <div style={{ fontSize: 13, color: '#fbbf24', fontWeight: 600 }}>{forgotEmail}</div>
                  </div>

                  {/* OTP Code Input */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label style={{ fontSize: 12, color: '#d1d5db', fontWeight: 600 }}>
                        6-Digit OTP Code
                      </label>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={countdown > 0 || forgotLoading}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: countdown > 0 ? '#6b7280' : '#f59e0b',
                          fontSize: 11,
                          cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                          padding: 0,
                          textDecoration: countdown > 0 ? 'none' : 'underline',
                        }}
                      >
                        {countdown > 0 ? `Resend in ${countdown}s` : '🔄 Resend OTP'}
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      required
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: '#030712',
                        border: '2px solid #f59e0b',
                        borderRadius: 8,
                        color: '#fbbf24',
                        fontSize: 22,
                        fontWeight: 800,
                        letterSpacing: 6,
                        textAlign: 'center',
                        boxSizing: 'border-box',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>

                  {/* New Password Input */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, color: '#d1d5db', marginBottom: 6, fontWeight: 600 }}>
                      New Password (नया पासवर्ड)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Naya password daalein (kam se kam 4 akshar)"
                        required
                        style={{
                          width: '100%',
                          padding: '11px 40px 11px 14px',
                          background: '#030712',
                          border: '1px solid #374151',
                          borderRadius: 8,
                          color: '#f9fafb',
                          fontSize: 14,
                          boxSizing: 'border-box',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', fontSize: 14, cursor: 'pointer' }}
                      >
                        {showNewPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password Input */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 12, color: '#d1d5db', marginBottom: 6, fontWeight: 600 }}>
                      Confirm New Password (पासवर्ड कन्फर्म करें)
                    </label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Upar wala password dobara daalein"
                      required
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        background: '#030712',
                        border: '1px solid #374151',
                        borderRadius: 8,
                        color: '#f9fafb',
                        fontSize: 14,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      disabled={forgotLoading}
                      style={{
                        flex: 1,
                        padding: '11px',
                        background: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: 8,
                        color: '#d1d5db',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      style={{
                        flex: 2,
                        padding: '11px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        borderRadius: 8,
                        color: '#ffffff',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: forgotLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      {forgotLoading ? 'Verifying...' : '✅ Save New Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
