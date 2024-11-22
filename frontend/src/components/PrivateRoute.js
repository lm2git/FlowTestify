import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);  // Recupera l'utente dal contesto

  if (!user) {
    return <Navigate to="/" />;  // Reindirizza alla pagina di login se l'utente non è autenticato
  }

  return children;  // Altrimenti, mostra il contenuto della rotta protetta
};

export default PrivateRoute;
