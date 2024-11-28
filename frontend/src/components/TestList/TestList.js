import React, { useState } from 'react';
import './TestList.css';
import '../../styles/Dashboard.css';

const TestList = ({ tests, isLoading, onTestClick }) => {
  const [updatedTests, setUpdatedTests] = useState(tests); // Stato per gestire i test aggiornati

  const handleExecutionClick = (testId) => {
    alert('Esecuzione test avviata!'); // Mostra il messaggio di esecuzione
    // Aggiorna lo stato del test con ID 'testId' a 'success'
    setUpdatedTests(prevTests =>
      prevTests.map(test =>
        test._id === testId ? { ...test, status: 'success' } : test
      )
    );
  };

  if (isLoading) return <p>Caricamento...</p>;

  return (
    <div className="test-list">
      {Array.isArray(updatedTests) && updatedTests.length > 0 ? (
        updatedTests.map((test, index) => (
          <div
            key={test._id || index}
            className={`test-card ${test.status}`} // Sintassi corretta
            onClick={() => onTestClick(test)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <h3>{test.name}</h3>
            <br />
            <p>Ultimo risultato: {test.status === 'success' ? 'OK' : 'Fallito'}</p>
            {/* Icona del razzo per esecuzione */}
            <div className="alert-icon" onClick={() => handleExecutionClick(test._id)}>
              🚀 {/* Razzo Unicode */}
            </div>
          </div>
        ))
      ) : (
        <p>Nessun test trovato.</p>
      )}
    </div>
  );
};

export default TestList;
