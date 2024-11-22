import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import '../styles/Dashboard.css'; 

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [tests, setTests] = useState([]); // Default value is an empty array
  const [selectedTest, setSelectedTest] = useState(null);

  if (!user) {
    return <Navigate to="/" />;
  }

  const openTestDetails = (test) => setSelectedTest(test);
  const closeTestDetails = () => setSelectedTest(null);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo-container">
          <img src="/path/to/logo.png" alt="Logo" className="dashboard-logo" />
        </div>
        <div className="profile-actions">
          <button onClick={() => alert('Profilo')} className="profile-button">Profilo</button>
          <button onClick={logout} className="logout-button">Logout</button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <ul className="menu-list">
          <li className="menu-item">Aggiungi Test</li>
          <li className="menu-item">Operazioni</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="test-list">
          {Array.isArray(tests) && tests.length > 0 ? (
            tests.map((test) => (
              test && test.status ? (
                <div
                  key={test.id}
                  className={`test-card ${test.status}`}
                  onClick={() => openTestDetails(test)}
                >
                  <h3>{test.name}</h3>
                  <p>Ultimo risultato: {test.status === 'success' ? 'OK' : 'Fallito'}</p>
                </div>
              ) : null
            ))
          ) : (
            <p>No tests available.</p>
          )}
        </div>
      </main>

      {/* Test Details Popup */}
      {selectedTest && (
        <div className="test-popup">
          <div className="test-popup-content">
            <h2>{selectedTest.name}</h2>
            <p>{selectedTest.description}</p>
            <button onClick={() => alert('Modifica Test')}>Modifica</button>
            <button onClick={closeTestDetails}>Chiudi</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
