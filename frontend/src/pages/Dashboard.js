import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/" />;  // Reindirizza alla login se l'utente non è autenticato
  }

  return (
    <div>
      <h1>Welcome to your Dashboard</h1>
      <p>Username: {user.username}</p>
      <p>Tenant: {user.tenant || 'No tenant assigned'}</p>
    </div>
  );
};

export default Dashboard;
