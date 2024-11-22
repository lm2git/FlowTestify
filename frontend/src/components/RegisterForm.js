import React, { useState } from 'react';

const RegisterForm = ({ onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');  // Aggiungiamo il campo ruolo
  const [tenant, setTenant] = useState('');  // Campo tenant (opzionale)

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister({ username: email, password, role, tenant });  // Passiamo role e tenant
  };

  return (
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
  );
};

export default RegisterForm;
