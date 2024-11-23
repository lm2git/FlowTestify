import React, { createContext, useState, useEffect } from 'react';

// Creazione del contesto per l'autenticazione
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Carica l'utente dal localStorage quando il componente viene montato
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []); // Il useEffect viene eseguito solo una volta al caricamento del componente

  const login = (userData) => {
    // Salva l'utente nel localStorage e imposta lo stato
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    // Rimuovi l'utente dal localStorage e imposta lo stato su null
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
