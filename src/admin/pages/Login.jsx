import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../../styles/admin.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [useEmailLogin, setUseEmailLogin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let el = document.querySelector('meta[name="robots"]');
    if (el) el.setAttribute('content', 'noindex, nofollow');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (useEmailLogin && email.trim()) {
        await login({ email: email.trim(), password });
      } else {
        await login(password);
      }
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Wrong password or email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>STAR HOME INTERIOR</h1>
          <p>Admin Login Portal</p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="adm-alert adm-alert-error">{error}</div>}

          {useEmailLogin && (
            <div className="adm-form-group">
              <label>Admin Email / Username</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required={useEmailLogin}
                placeholder="e.g. admin@starhomeinterior.in"
                autoFocus
              />
            </div>
          )}

          <div className="adm-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ margin: 0 }}>Password</label>
              <button
                type="button"
                onClick={() => setUseEmailLogin(!useEmailLogin)}
                style={{ fontSize: 11, color: '#b8956a', textDecoration: 'underline', padding: 0 }}
              >
                {useEmailLogin ? '⚡ Quick Login (Only Password)' : '📧 Login with Email'}
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter admin password"
                autoFocus={!useEmailLogin}
                style={{ width: '100%', paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#888', fontSize: 14 }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button type="submit" className="adm-btn adm-btn-primary adm-btn-full" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Logging in...' : 'Login to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
