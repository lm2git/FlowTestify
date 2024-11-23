import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import logo from '../assets/images/title-optimized.png';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext); // Usa destructuring per evitare più chiamate a useContext
  const navigate = useNavigate(); // Importa `useNavigate` correttamente
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // Effettua il controllo di autenticazione prima di renderizzare il contenuto
  useEffect(() => {
    console.log('Utente autenticato:', user);
    const storedUser = localStorage.getItem('user');
    console.log('Utente salvato in localStorage:', storedUser);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (!user) {
      navigate('/'); // Se l'utente non è autenticato, reindirizza alla pagina di login
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/'); // Reindirizza alla pagina di login dopo il logout
  };

  // Simulazione chiamata API per test
  useEffect(() => {
    setTimeout(() => {
      setTests([
        { id: 1, name: 'Test 1', status: 'success', description: 'Descrizione Test 1' },
        { id: 2, name: 'Test 2', status: 'failure', description: 'Descrizione Test 2' },
        { id: 3, name: 'Test 3', status: 'failure', description: 'Descrizione Test 3' },
      ]);
    }, 1000);
  }, []);

  const openTestDetails = (test) => setSelectedTest(test);
  const closeTestDetails = () => setSelectedTest(null);



  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="dashboard-logo" />
        </div>
        <div className="profile-actions">
          <button onClick={() => alert('Profilo')} className="profile-button">Profilo</button>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>

      <aside
        className={`dashboard-sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        <ul className="menu-list">
          <li className="menu-item">
            <span className="menu-icon">➕</span>
            {isSidebarExpanded && <span>Aggiungi Test</span>}
          </li>
          <li className="menu-item">
            <span className="menu-icon">⚙️</span>
            {isSidebarExpanded && <span>Operazioni</span>}
          </li>
        </ul>
      </aside>

      <main className="dashboard-main">
        <div className="test-list">
          {Array.isArray(tests) && tests.length > 0 ? (
            tests.map((test, index) => (
              <div
                key={test.id}
                className={`test-card ${test.status}`}
                onClick={() => openTestDetails(test)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3>{test.name}</h3>
                <p>Ultimo risultato: {test.status === 'success' ? 'OK' : 'Fallito'}</p>
              </div>
            ))
          ) : (
            <p>Caricamento dei test in corso...</p>
          )}
        </div>
      </main>

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
