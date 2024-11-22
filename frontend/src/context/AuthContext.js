import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Crea il contesto
export const AuthContext = createContext();

// Crea il provider per il contesto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);  // Inizializza l'utente come null
  const navigate = useNavigate();

  // Esegui il controllo sul token quando il componente viene montato
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token });  // Se esiste un token, imposta l'utente
    }
  }, []);

  // Funzione di login
  const login = (token) => {
    localStorage.setItem('token', token);
    setUser({ token });  // Salva l'utente con il token
    navigate('/dashboard');  // Naviga al dashboard dopo il login
  };

  // Funzione di logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);  // Rimuove l'utente dalla memoria e esegue logout
    navigate('/');  // Torna alla pagina di login
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}  {/* Rende disponibili i valori ai componenti figli */}
    </AuthContext.Provider>
  );
};
