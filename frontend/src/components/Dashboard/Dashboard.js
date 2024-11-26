import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';  // Aggiungi questa riga per importare AuthContext

import { Navigate, useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import TestList from '../TestList/TestList';
import TestPopup from '../TestPopup/TestPopup';
import AddTestModal from '../AddTestModal/AddTestModal';

import '../../styles/Dashboard.css'; 

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [selectedTest, setSelectedTest] = useState(null);
    const [isAddingTest, setIsAddingTest] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
  
    // Fetch tests from backend
    useEffect(() => {
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
      fetchTests();
    }, [navigate]);
  
    const handleLogout = () => {
      logout();
      navigate('/');
    };
  
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
  
        <Sidebar isAddingTest={isAddingTest} setIsAddingTest={setIsAddingTest} />
        
        <main className="dashboard-main">
          <TestList tests={tests} isLoading={isLoading} setSelectedTest={setSelectedTest} />
        </main>
  
        {selectedTest && (
          <TestPopup selectedTest={selectedTest} setSelectedTest={setSelectedTest} />
        )}
  
        {isAddingTest && (
          <AddTestModal setIsAddingTest={setIsAddingTest} fetchTests={() => setTests([])} />
        )}
      </div>
    );
  };
  
  export default Dashboard;