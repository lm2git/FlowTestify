import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import logo from '../assets/images/title-optimized.png';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isAddingTest, setIsAddingTest] = useState(false); // Stato per gestire la creazione di un test
  const [newTestName, setNewTestName] = useState(''); // Stato per il nome del nuovo test

  // Se l'utente non è autenticato, reindirizza alla pagina di login
  if (!localStorage.getItem('user')) {
    return <Navigate to="/" />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Carica i test del tenant al montaggio
  const fetchTests = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + `/tests?tenantName=${user.tenantName}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      if (response.ok) {
        setTests(data.tests);
      } else {
        console.error('Errore nel caricamento dei test:', data.message);
      }
    } catch (error) {
      console.error('Errore di rete:', error);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  // Creazione di un nuovo test
  const handleAddTest = async () => {
    if (!newTestName.trim()) {
      alert('Il nome del test non può essere vuoto.');
      return;
    }

    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/tests/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ name: newTestName, tenantName: user.tenantName }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Test creato con successo!');
        setIsAddingTest(false);
        setNewTestName('');
        fetchTests(); // Ricarica la lista dei test
      } else {
        alert(`Errore: ${data.message}`);
      }
    } catch (error) {
      console.error('Errore di rete:', error);
      alert('Errore nella creazione del test.');
    }
  };

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
          <li className="menu-item" onClick={() => setIsAddingTest(true)}>
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
            <p>Non ci sono test disponibili.</p>
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

      {isAddingTest && (
        <div className="add-test-modal">
          <div className="add-test-content">
            <h2>Crea un nuovo test</h2>
            <input
              type="text"
              placeholder="Nome del test"
              value={newTestName}
              onChange={(e) => setNewTestName(e.target.value)}
            />
            <button onClick={handleAddTest}>Salva</button>
            <button onClick={() => setIsAddingTest(false)}>Annulla</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;


