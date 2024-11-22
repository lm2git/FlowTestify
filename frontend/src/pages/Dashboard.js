import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div>
      <h1>Welcome to your Dashboard</h1>
      <p>Email: {user?.email}</p>
      <p>Tenant: {user?.tenant}</p>
    </div>
  );
};

export default Dashboard;
