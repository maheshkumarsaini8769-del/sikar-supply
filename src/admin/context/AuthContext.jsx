import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      api.get('/auth/me').then(res => {
        setUser(res.data.user);
      }).catch(() => {
        localStorage.removeItem('admin_token');
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (password) => {
    const res = await api.post('/auth/login', { password });
    localStorage.setItem('admin_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('admin_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
