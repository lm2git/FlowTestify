import React, { useState } from 'react';
import '../style/Register.css';  // Importa il nuovo CSS dedicato

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');  // Aggiungiamo il campo ruolo
  const [tenant, setTenant] = useState('');  // Campo tenant (opzionale)

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Creiamo il corpo della richiesta includendo role e tenant
    const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password, role, tenant }),  // Aggiungiamo username, role e tenant
    });

    const data = await response.json();
    console.log(data);
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
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="Role (default is user)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
        <input
          type="text"
          placeholder="Tenant (optional)"
          value={tenant}
          onChange={(e) => setTenant(e.target.value)}
        />
        <button type="submit">Register</button>
      </form>
      <div className="register-link">
        <span>Already have an account? </span>
        <a href="/login">Login here</a>
      </div>
    </div>
  );
};

export default Register;
