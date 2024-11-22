import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [tests, setTests] = useState([
    { id: 1, name: 'Test 1', status: 'success', description: 'Descrizione Test 1' },
    { id: 2, name: 'Test 2', status: 'failure', description: 'Descrizione Test 2' },
    { id: 3, name: 'Test 3', status: 'success', description: 'Descrizione Test 3' },
  ]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [visibleTests, setVisibleTests] = useState([]); // Per il fade-in

  useEffect(() => {
    // Mostra i test uno alla volta con un intervallo
    let index = 0;
    const interval = setInterval(() => {
      if (index < tests.length) {
        setVisibleTests((prev) => [...prev, tests[index]]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 300); // Ritardo tra i fade-in
    return () => clearInterval(interval);
  }, [tests]);

  if (!user) {
    return <Navigate to="/" />;
  }

  const openTestDetails = (test) => {
    setSelectedTest(test);
  };

  const closeTestDetails = () => {
    setSelectedTest(null);
  };

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
          <li className="menu-item">
            <i className="icon">🏠</i> <span>Aggiungi Test</span>
          </li>
          <li className="menu-item">
            <i className="icon">⚙️</i> <span>Operazioni</span>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="test-list">
          {visibleTests.map((test) => (
            <div
              key={test.id}
              className={`test-card ${test.status}`}
              onClick={() => openTestDetails(test)}
            >
              <h3>{test.name}</h3>
              <p>Ultimo risultato: {test.status === 'success' ? 'OK' : 'Fallito'}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Popup trasparente per il test selezionato */}
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
