import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Carica l'utente e il token dal localStorage se esistono
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Decodifica il token JWT per estrarre le informazioni sull'utente (opzionale)
      const userInfo = { username: 'userFromToken', token }; // Estrai i dati dal token, se necessario
      setUser(userInfo);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
