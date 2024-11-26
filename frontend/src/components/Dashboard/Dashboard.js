import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';  // Aggiungi questa riga per importare AuthContext

import { Navigate, useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import TestList from '../TestList/TestList';
import TestPopup from '../TestPopup/TestPopup';
import AddTestModal from '../AddTestModal/AddTestModal';

import './Dashboard.css'; 


const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isAddingTest, setIsAddingTest] = useState(false);
  const [newTestName, setNewTestName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  if (!localStorage.getItem('user')) {
    return <Navigate to="/" />;
  }

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
            Authorization: `Bearer ${user.token}`,
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

  const openTestDetails = (test) => setSelectedTest(test);
  const closeTestDetails = () => setSelectedTest(null);

  return (
    <div className="dashboard-container">
      <Header logout={logout} navigate={navigate} />
      <Sidebar
        isSidebarExpanded={isSidebarExpanded}
        setIsSidebarExpanded={setIsSidebarExpanded}
        setIsAddingTest={setIsAddingTest}
      />
      <main className="dashboard-main">
        <TestList
          tests={tests}
          isLoading={isLoading}
          openTestDetails={openTestDetails}
        />
      </main>
      {selectedTest && (
        <TestPopup
          selectedTest={selectedTest}
          closeTestDetails={closeTestDetails}
          fetchTests={fetchTests}
        />
      )}
      {isAddingTest && (
        <AddTestModal
          setIsAddingTest={setIsAddingTest}
          newTestName={newTestName}
          setNewTestName={setNewTestName}
          handleAddTest={handleAddTest}
        />
      )}
    </div>
  );
};

export default Dashboard;
