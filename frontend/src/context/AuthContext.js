import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Carica l'utente e il token dal localStorage se esistono
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userInfo = { username: 'userFromToken', token };
      setUser(userInfo);
    }
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    // Rimuovi il navigate, il reindirizzamento sarà gestito altrove
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
