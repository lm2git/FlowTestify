import React, { useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      console.log("Utente autenticato");
    } else {
      console.log("Utente non autenticato");
    }
  }, [user]);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
