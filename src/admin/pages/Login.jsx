import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Wrong password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>STAR HOME</h1>
          <p>Admin Panel</p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="adm-alert adm-alert-error">{error}</div>}
          <div className="adm-form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter admin password" autoFocus />
          </div>
          <button type="submit" className="adm-btn adm-btn-primary adm-btn-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
