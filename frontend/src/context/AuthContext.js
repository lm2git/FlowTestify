import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token });
    }
  }, []);

  const login = (token) => {
    try {
      localStorage.setItem('token', token);
      setUser({ token });
      if (navigate) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };
  
  const logout = () => {
    try {
      localStorage.removeItem('token');
      setUser(null);
      if (navigate) {
        navigate('/');
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
