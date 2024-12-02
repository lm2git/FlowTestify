import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import TestList from '../TestList/TestList';
import TestPopup from '../TestPopup/TestPopup';
import AddTestModal from '../AddTestModal/AddTestModal';

import '../../styles/Dashboard.css';

import logo from '../../assets/images/title-optimized.png';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null); // Mantieni lo stato per il test selezionato
  const [isAddingTest, setIsAddingTest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Funzione di fetch dei test
  const fetchTests = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
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
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setTests(data.tests);
      }
    } catch (error) {
      console.error('Errore di rete:', error);
      alert('Errore di rete. Controlla la connessione e riprova.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch dei test all'avvio del componente
  useEffect(() => {
    fetchTests();
  }, []);

  // Funzione di logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Gestione del clic su un test
  const handleTestClick = (test) => {
    setSelectedTest(test);  // Apri il popup con il test selezionato
  };

  const closePopup = () => {
    setSelectedTest(null);  // Chiudi il popup
  };

  // Funzione per gestire il riordino dei test
  const handleTestReorder = (reorderedTests) => {
    setTests(reorderedTests);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="dashboard-logo" />
        </div>
        <div className="profile-actions">
          <button onClick={() => alert('Profilo')} className="profile-button">
            Profilo
          </button>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <Sidebar
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        onAddTest={() => setIsAddingTest(true)}
      />

      <main className="dashboard-main">
        <TestList
          tests={tests}
          isLoading={isLoading}
          onTestClick={handleTestClick}
          fetchTests={fetchTests}  // Passa la funzione fetchTests come prop
          onTestReorder={handleTestReorder}  // Passa la funzione di riordino
        />
      </main>

      {selectedTest && (
        <TestPopup selectedTest={selectedTest} setSelectedTest={closePopup} />
      )}

      {isAddingTest && (
        <AddTestModal setIsAddingTest={setIsAddingTest} fetchTests={fetchTests} />
      )}
    </div>
  );
};

export default Dashboard;
