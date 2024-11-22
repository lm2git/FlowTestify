import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Carica l'utente e il token dal localStorage se esistono
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userInfo = { username: 'userFromToken', token }; // Estrai i dati dal token
      setUser(userInfo);
    }
  }, []);

  // Funzione di logout
  const logout = () => {
    setUser(null); // Rimuove lo stato dell'utente
    localStorage.removeItem('token'); // Rimuove il token dal localStorage
    navigate('/'); // Reindirizza alla pagina di login
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
