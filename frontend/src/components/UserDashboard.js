import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const UserDashboard = () => {
  const { user, logout } = useContext(AuthContext);  // Recupera l'utente dal contesto

  return (
    <div className="dashboard">
      <h1>Welcome to your Dashboard!</h1>
      <p>Token: {user.token}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default UserDashboard;
