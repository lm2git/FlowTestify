import React, { useState, useEffect } from 'react';
import './TestPopup.css';

const TestPopup = ({ selectedTest, setSelectedTest }) => {
  const [newStepDescription, setNewStepDescription] = useState('');
  const [newStepActionType, setNewStepActionType] = useState('');
  const [newStepValue, setNewStepValue] = useState('');
  const [currentTest, setCurrentTest] = useState(selectedTest);

  // Sincronizza currentTest quando selectedTest cambia
  useEffect(() => {
    if (selectedTest) {
      setCurrentTest(selectedTest);
    }
  }, [selectedTest]);

  const fetchTestSteps = async () => {
    if (!selectedTest) return; // Se selectedTest è undefined, non fare nulla

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/tests/${selectedTest._id}/steps`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Aggiorna currentTest con gli step completi ricevuti
        setCurrentTest((prevTest) => ({
          ...prevTest,
          steps: data.steps, // Usa gli oggetti completi degli step
        }));
      } else {
        alert(`Errore nel recupero degli step: ${data.message}`);
      }
    } catch (error) {
      console.error('Errore di rete:', error);
      alert('Errore nel recupero degli step.');
    }
  };

  // Carica gli step quando selectedTest cambia
  useEffect(() => {
    fetchTestSteps();
  }, [selectedTest]);

  const handleAddStep = async () => {
    if (!newStepDescription.trim() || !newStepActionType.trim()) {
      alert('Descrizione e tipo di azione sono obbligatori.');
      return;
    }
    const user = JSON.parse(localStorage.getItem('user'));

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/tests/${selectedTest._id}/steps/add`,
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
        setNewStepDescription('');
        setNewStepActionType('');
        setNewStepValue('');
        fetchTestSteps(); // Ricarica gli step dopo averne aggiunto uno
      } else {
        alert(`Errore: ${data.message}`);
      }
    } catch (error) {
      console.error('Errore di rete:', error);
      alert("Errore nell'aggiunta dello step.");
    }
  };

  // Se currentTest o currentTest.steps non sono definiti, non renderizzare il popup
  if (!currentTest || !currentTest.steps) {
    return null;
  }

  return (
    <div className="test-popup">
      <div className="test-popup-content">
        <h2>{currentTest.name}</h2>
        <p>{currentTest.description}</p>
        <h3>Steps</h3>
        <ul>
          {currentTest.steps && currentTest.steps.length > 0 ? (
            currentTest.steps.map((step, index) => (
              <li key={index}>
                <p><strong>{step._id}</strong></p>
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
            placeholder="Valore"
            value={newStepValue}
            onChange={(e) => setNewStepValue(e.target.value)}
          />
          <button onClick={handleAddStep}>Aggiungi Step</button>
        </div>
        <div className="popup-actions">
          <button onClick={() => setSelectedTest(null)}>Chiudi</button>
        </div>
      </div>
    </div>
  );
};

export default TestPopup;
