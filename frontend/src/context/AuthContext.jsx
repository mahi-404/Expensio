import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    const userData = {
      id: res.data._id,
      name: res.data.name,
      email: res.data.email,
      upi_id: res.data.upi_id,
    };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (name, email, password, upi_id) => {
    const res = await api.post('/auth/register', { name, email, password, upi_id });
    localStorage.setItem('token', res.data.token);
    const userData = {
      id: res.data._id,
      name: res.data.name,
      email: res.data.email,
      upi_id: res.data.upi_id,
    };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
