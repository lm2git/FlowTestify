import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Login.css'; 

import logo from '../assets/images/logo_transparent.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(AuthContext); // Utilizza il contesto per salvare l'utente
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });
      const data = await response.json();

      if (data.token) {
        setUser({
          username: email,
          token: data.token,
          tenant: email, // Assicurati che tenantName sia passato correttamente
        });

      // Salva il token e il tenant nel localStorage
      localStorage.setItem(
        'user',
        JSON.stringify({ username: email, token: data.token, tenant: email })
      );
        // Reindirizza alla dashboard
        navigate('/dashboard');
      } else {
        alert('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="logo-container">
        <img src={logo} alt="FlowTestify Logo" className="login-logo" />
      </div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      <div className="register-link">
        <span>Don't have an account? </span>
        <a href="/register">Register here</a>
      </div>
    </div>
  );
};

export default Login;
