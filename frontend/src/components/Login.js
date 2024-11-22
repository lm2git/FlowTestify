import React, { useState } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { login } = useContext(AuthContext);  // Recupera la funzione di login dal contesto
  const [token, setToken] = useState('');     // Stato per il token
  const [error, setError] = useState('');     // Stato per eventuali errori

  const handleLogin = () => {
    if (token) {
      login(token);  // Esegui il login con il token
    } else {
      setError('Please provide a token');  // Messaggio di errore se il token non è valido
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <input
        type="text"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Enter your token"
      />
      {error && <p className="error">{error}</p>}
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
