import React, { useState, useEffect } from 'react';
import './TestPopup.css';

const TestPopup = ({ selectedTest, setSelectedTest }) => {
  const [steps, setSteps] = useState([]);
  const [stepDefinitions, setStepDefinitions] = useState({});
  const [newStepDescription, setNewStepDescription] = useState('');
  const [newStepActionType, setNewStepActionType] = useState('');
  const [newStepSelector, setNewStepSelector] = useState('');
  const [newStepValue, setNewStepValue] = useState('');
  const [currentTest, setCurrentTest] = useState(selectedTest);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (selectedTest) {
      setCurrentTest(selectedTest);
      fetchTestSteps(selectedTest._id);
    }
  }, [selectedTest]);

  const fetchTestSteps = async (testId) => {
    if (!testId) return;

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/tests/${testId}/steps`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSteps(data.steps);
        fetchStepDefinitions(data.steps);
      } else {
        alert(`Errore nel recupero degli step: ${data.message}`);
      }
    } catch (error) {
      console.error('Errore di rete:', error);
      alert('Errore nel recupero degli step.');
    }
  };

  const fetchStepDefinitions = async (steps) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const newStepDefinitions = {};

    for (let step of steps) {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/steps/${step._id}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${user.token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();
        if (response.ok) {
          newStepDefinitions[step._id] = {
            description: data.description,
            actionType: data.actionType,
            selector: data.selector,
            value: data.value,
          };
        } else {
          console.error(`Errore nel recupero della definizione per lo step ${step._id}: ${data.message}`);
        }
      } catch (error) {
        console.error('Errore di rete nella definizione dello step:', error);
      }
    }

    setStepDefinitions(newStepDefinitions);
  };

  const handleDeleteStep = async (stepId) => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!window.confirm('Sei sicuro di voler eliminare questo step?')) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/tests/${selectedTest._id}/steps/${stepId}/delete`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert('Step eliminato con successo.');
        fetchTestSteps(selectedTest._id);
      } else {
        alert(`Errore: ${data.message}`);
      }
    } catch (error) {
      console.error('Errore di rete:', error);
      alert("Errore nell'eliminazione dello step.");
    }
  };

  const handleAddStep = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
  
    // Verifica i dati che stai inviando
    console.log('Dati da inviare:', {
      description: newStepDescription,
      actionType: newStepActionType,
      selector: newStepSelector,
      value: newStepValue,
    });
  
    if (!newStepDescription || !newStepActionType) {
      alert('La descrizione e il tipo di azione sono obbligatori.');
      return;
    }
  
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/tests/${selectedTest._id}/steps/add`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: newStepDescription.trim(), // Aggiungi .trim() per rimuovere spazi bianchi
            actionType: newStepActionType.trim(), // Aggiungi .trim() per rimuovere spazi bianchi
            selector: newStepSelector || '', // Imposta un valore vuoto se non c'è selector
            value: newStepValue || '', // Imposta un valore vuoto se non c'è value
          }),
        }
      );
  
      const data = await response.json();
  
      if (response.ok) {
        alert('Step aggiunto con successo');
        fetchTestSteps(selectedTest._id);
      } else {
        alert(`Errore: ${data.message}`);
      }
    } catch (error) {
      console.error('Errore di rete:', error);
      alert("Errore nell'aggiunta dello step.");
    }
  };
  

  if (!currentTest || !steps) {
    return null;
  }

  return (
    <div className="test-popup">
      <div className="test-popup-content">
        <h2>{currentTest.name}</h2>
        <p>{currentTest.description}</p>
        <h3>Steps configurati:</h3>
        <ul>
          {steps.length > 0 ? (
            steps.map((step, index) => (
              <li key={index} className="step-item">
                <div>
                  <p><strong>ID Step:</strong> {step._id}</p>
                  <p><strong>Description:</strong> {stepDefinitions[step._id]?.description || 'Caricamento descrizione...'}</p>
                  <p><strong>Action Type:</strong> {stepDefinitions[step._id]?.actionType || 'Caricamento actionType...'}</p>
                  <p><strong>Selector:</strong> {stepDefinitions[step._id]?.selector || 'N/A'}</p>
                  <p><strong>Value:</strong> {stepDefinitions[step._id]?.value || 'N/A'}</p>
                </div>
                <button onClick={() => handleDeleteStep(step._id)} className="delete-button">
                  Elimina
                </button>
              </li>
            ))
          ) : (
            <p>Nessun step disponibile</p>
          )}
        </ul>

        <button onClick={() => setShowForm(!showForm)} className="show-form-button">
          {showForm ? 'Annulla' : 'Aggiungi Nuovo Step'}
        </button>

        <div className={`add-step-form ${showForm ? 'slide-in' : 'slide-out'}`}>
          <input
            type="text"
            placeholder="Descrizione"
            value={newStepDescription}
            onChange={(e) => setNewStepDescription(e.target.value)}
          />
          <select
            value={newStepActionType}
            onChange={(e) => setNewStepActionType(e.target.value)}
          >
            <option value="">Seleziona un tipo di azione</option>
            <option value="click">Click</option>
            <option value="type">Type</option>
            <option value="navigate">Navigate</option>
            <option value="waitForSelector">Wait For Selector</option>
            <option value="screenshot">Screenshot</option>
            <option value="assert">Assert</option>
          </select>
          {['click', 'type', 'waitForSelector', 'assert'].includes(newStepActionType) && (
            <input
              type="text"
              placeholder="Selector"
              value={newStepSelector}
              onChange={(e) => setNewStepSelector(e.target.value)}
            />
          )}
          {newStepActionType === 'type' && (
            <input
              type="text"
              placeholder="Value"
              value={newStepValue}
              onChange={(e) => setNewStepValue(e.target.value)}
            />
          )}
          <button onClick={handleAddStep} className="add-step-button">
            Aggiungi Step
          </button>
        </div>

        <div className="popup-actions">
          <button onClick={() => setSelectedTest(null)}>Chiudi</button>
        </div>
      </div>
    </div>
  );
};

export default TestPopup;
