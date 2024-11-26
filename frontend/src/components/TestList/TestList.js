import React from 'react';
import React, { useState } from 'react'; 
import './TestList.css';
import '../../styles/Dashboard.css';

const TestList = ({ tests, isLoading, onTestClick }) => {
  if (isLoading) return <p>Caricamento...</p>;

  return (
    <div className="test-list">
      {Array.isArray(tests) && tests.length > 0 ? (
        tests.map((test, index) => (
          <div
            key={test._id || index}
            className={`test-card ${test.status}`}
            onClick={() => onTestClick(test)} 
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
  );
};

export default TestList;
