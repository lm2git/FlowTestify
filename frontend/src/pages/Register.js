import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';  // Importa il nuovo CSS dedicato

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');  // Nuovo stato per conferma password
  const [message, setMessage] = useState('');  // Stato per il messaggio di successo o errore
  const [messageType, setMessageType] = useState('');  // Tipo di messaggio (successo o errore)

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verifica che le password corrispondano
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setMessageType('error');
      return;
    }

    // Creiamo il corpo della richiesta con solo email e password
    const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password }),  // Invia email e password
    });

    const data = await response.json();

    if (data.success) {
      // Registrazione riuscita
      setMessage('Registration successful! You can now login.');
      setMessageType('success');
      setTimeout(() => {
        navigate('/');  // Reindirizza al login dopo 2 secondi
      }, 2000);
    } else {
      // Registrazione fallita
      setMessage('Registration failed. Please try again.');
      setMessageType('error');
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit}>
        <h1>Register</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
      
      {/* Messaggio di successo o errore */}
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}
      
      <div className="register-link">
        <span>Already have an account? </span>
        <a href="/">Login here</a>
      </div>
    </div>
  );
};

export default Register;
