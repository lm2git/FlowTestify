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
  const [isAddingTest, setIsAddingTest] = useState(false);
  const [newTestName, setNewTestName] = useState('');
  const [newStepDescription, setNewStepDescription] = useState('');
  const [newStepActionType, setNewStepActionType] = useState('');
  const [newStepValue, setNewStepValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Se l'utente non è autenticato, reindirizza alla pagina di login
  if (!localStorage.getItem('user')) {
    return <Navigate to="/" />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const fetchTests = async () => {
  const user = JSON.parse(localStorage.getItem('user')); // Ottieni i dati utente
  console.log(user.token);
    if (!user || !user.token) {
      alert('Sessione scaduta. Effettua di nuovo il login.');
      navigate('/');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/tests/${user.tenant}`,
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setTests(data.tests);
      } else {
        alert(`Errore: ${data.message}`);
      }
    } catch (error) {
      console.error('Errore di rete:', error);
      alert('Errore di rete. Controlla la connessione e riprova.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleAddTest = async () => {
    if (!newTestName.trim()) {
      alert('Il nome del test non può essere vuoto.');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/tests/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
          },
          body: JSON.stringify({ name: newTestName, tenantName: user.tenant }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setIsAddingTest(false);
        setNewTestName('');
        fetchTests();
      } else {
        alert(`Errore: ${data.message}`);
      }
    } catch (error) {
      console.error('Errore di rete:', error);
      alert('Errore nella creazione del test.');
    }
  };

  const handleAddStep = async () => {
    if (!newStepDescription.trim() || !newStepActionType.trim()) {
      alert('Descrizione e tipo di azione sono obbligatori.');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/tests/${selectedTest._id}/steps`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: newStepDescription,
            actionType: newStepActionType,
            value: newStepValue,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert('Step aggiunto con successo.');
        setSelectedTest(data.test); // Aggiorna il test selezionato
        setNewStepDescription('');
        setNewStepActionType('');
        setNewStepValue('');
      } else {
        alert(`Errore: ${data.message}`);
      }
    } catch (error) {
      console.error('Errore di rete:', error);
      alert('Errore nell\'aggiunta dello step.');
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
        </ul>
      </aside>

      <main className="dashboard-main">
        <div className="test-list">
          {isLoading ? (
            <p>Caricamento...</p>
          ) : Array.isArray(tests) && tests.length > 0 ? (
            tests.map((test, index) => (
              <div
                key={test._id || index}
                className={`test-card ${test.status}`}
                onClick={() => openTestDetails(test)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3>{test.name}</h3>
                <p>Ultimo risultato: {test.status === 'success' ? 'OK' : 'Fallito'}</p>
              </div>
            ))
          ) : (
            <p>Nessun test trovato.</p>
          )}
        </div>
      </main>

      {selectedTest && (
        <div className="test-popup">
          <div className="test-popup-content">
            <h2>{selectedTest.name}</h2>
            <p>{selectedTest.description}</p>
            <h3>Steps</h3>
            <ul>
              {selectedTest.steps && selectedTest.steps.length > 0 ? (
                selectedTest.steps.map((step, index) => (
                  <li key={index}>
                    <p><strong>{step.name}</strong></p>
                    <p>{step.description}</p>
                  </li>
                ))
              ) : (
                <p>Nessun step disponibile</p>
              )}
            </ul>
            <div>
              <h3>Aggiungi un nuovo step</h3>
              <input
                type="text"
                placeholder="Descrizione"
                value={newStepDescription}
                onChange={(e) => setNewStepDescription(e.target.value)}
              />
              <input
                type="text"
                placeholder="Tipo di azione"
                value={newStepActionType}
                onChange={(e) => setNewStepActionType(e.target.value)}
              />
              <input
                type="text"
                placeholder="Valore (opzionale)"
                value={newStepValue}
                onChange={(e) => setNewStepValue(e.target.value)}
              />
              <button onClick={handleAddStep}>Aggiungi Step</button>
            </div>
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
