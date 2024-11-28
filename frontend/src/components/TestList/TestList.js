import React, { useState, useEffect } from 'react';
import './TestList.css';
import '../../styles/Dashboard.css';
import AddTestModal from './AddTestModal';

const TestList = ({ tests, isLoading, onTestClick }) => {
  const [isAddingTest, setIsAddingTest] = useState(false); // Stato per gestire l'aggiunta del test
  const [updatedTests, setUpdatedTests] = useState(tests); // Stato per i test aggiornati

  const fetchTests = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const tenantName = user?.tenant;

      if (!tenantName) {
        alert('Errore: tenant non trovato. Effettua nuovamente il login.');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/tests`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setUpdatedTests(data); // Aggiorna la lista dei test
      } else {
        alert(`Errore: ${data.message}`);
      }
    } catch (error) {
      console.error('Errore di rete:', error);
      alert('Errore nel recupero dei test.');
    }
  };

  useEffect(() => {
    if (!isLoading) {
      fetchTests(); // Ricarica i test iniziali
    }
  }, [isLoading]);

  const handleExecutionClick = (testId) => {
    // Simula l'esecuzione del test e aggiorna lo stato a "success"
    setUpdatedTests(prevTests =>
      prevTests.map(test =>
        test._id === testId ? { ...test, status: 'success' } : test
      )
    );
  };

  const handleTestClick = (test) => {
    // Logica per la selezione del test
    console.log(test);
  };

  return (
    <div className="test-list">
      <button onClick={() => setIsAddingTest(true)}>Aggiungi Test</button>
      {isAddingTest && (
        <AddTestModal setIsAddingTest={setIsAddingTest} fetchTests={fetchTests} />
      )}

      {Array.isArray(updatedTests) && updatedTests.length > 0 ? (
        updatedTests.map((test, index) => (
          <div
            key={test._id || index}
            className={`test-card ${test.status}`}
            onClick={() => handleTestClick(test)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <h3>{test.name}</h3>
            <p>Ultimo risultato: {test.status === 'success' ? 'OK' : 'Fallito'}</p>
            
            {/* Bottone per simulare l'esecuzione del test */}
            <button onClick={() => handleExecutionClick(test._id)}>Esegui Test</button>
          </div>
        ))
      ) : (
        <p>Nessun test trovato.</p>
      )}
    </div>
  );
};

export default TestList;
