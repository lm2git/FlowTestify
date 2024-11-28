import React, { useState, useEffect } from 'react';
import './TestPopup.css';

const TestPopup = ({ selectedTest, setSelectedTest }) => {
  const [steps, setSteps] = useState([]);
  const [stepDefinitions, setStepDefinitions] = useState({}); // Memorizza le descrizioni degli step
  const [newStepDescription, setNewStepDescription] = useState('');
  const [newStepActionType, setNewStepActionType] = useState('');
  const [newStepValue, setNewStepValue] = useState('');
  const [currentTest, setCurrentTest] = useState(selectedTest);
  const [showForm, setShowForm] = useState(false); // Stato per gestire la visibilità del modulo

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
        setSteps(data.steps); // Salva gli ID degli step
        fetchStepDefinitions(data.steps); // Recupera le descrizioni
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
          `${process.env.REACT_APP_BACKEND_URL}/steps/${step._id}`, // Endpoint per ottenere la definizione completa dello step
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
          newStepDefinitions[step._id] = data.description; // Salva la descrizione con l'ID dello step
        } else {
          console.error(`Errore nel recupero della descrizione per lo step ${step._id}: ${data.message}`);
        }
      } catch (error) {
        console.error('Errore di rete nella definizione dello step:', error);
      }
    }

    setStepDefinitions(newStepDefinitions); // Memorizza tutte le descrizioni
  };

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
            Authorization: `Bearer ${user.token}`,
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
        fetchTestSteps(selectedTest._id); // Ricarica gli step dopo l'aggiunta
        setShowForm(false); // Nascondi il modulo dopo l'aggiunta
      } else {
        alert(`Errore: ${data.message}`);
      }
    } catch (error) {
      console.error('Errore di rete:', error);
      alert("Errore nell'aggiunta dello step.");
    }
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
        fetchTestSteps(selectedTest._id); // Ricarica gli step dopo l'eliminazione
      } else {
        alert(`Errore: ${data.message}`);
      }
    } catch (error) {
      console.error('Errore di rete:', error);
      alert("Errore nell'eliminazione dello step.");
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
        <h3>Steps configured:</h3>
        <ul>
          {steps.length > 0 ? (
            steps.map((step, index) => (
              <li key={index} className="step-item">
                <div>
                  <p>{step._id}</p>
                  <p>{stepDefinitions[step._id] || 'Caricamento descrizione...'}</p> {/* Mostra la descrizione */}
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

        {/* Bottone per mostrare/nascondere il modulo di aggiunta */}
        <button onClick={() => setShowForm(!showForm)} className="show-form-button">
          {showForm ? 'Annulla' : 'Aggiungi Nuovo Step'}
        </button>

        {/* Modulo di aggiunta step */}
        <div className={`add-step-form ${showForm ? 'slide-in' : 'slide-out'}`}>
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
