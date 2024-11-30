import React, { useState, useEffect } from 'react';
import './TestPopup.css';

const TestPopup = ({ selectedTest, setSelectedTest }) => {
  const [steps, setSteps] = useState([]);
  const [stepDefinitions, setStepDefinitions] = useState({});
  const [newStepDescription, setNewStepDescription] = useState('');
  const [newStepActionType, setNewStepActionType] = useState('');
  const [newStepValue, setNewStepValue] = useState('');
  const [currentTest, setCurrentTest] = useState(selectedTest);
  const [showForm, setShowForm] = useState(false);

  // Elenco dei valori consentiti per actionType
  const actionTypeOptions = [
    { value: '', label: 'Seleziona un tipo di azione' },
    { value: 'click', label: 'Click' },
    { value: 'type', label: 'Type' },
    { value: 'navigate', label: 'Navigate' },
    { value: 'waitForSelector', label: 'Wait for Selector' },
    { value: 'screenshot', label: 'Screenshot' },
    { value: 'assert', label: 'Assert' },
  ];

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

  const handleAddStep = async () => {
    if (!newStepDescription.trim() || !newStepActionType) {
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
        fetchTestSteps(selectedTest._id);
        setShowForm(false);
      } else {
        alert(`Errore: ${data.message}`);
      }
    } catch (error) {
      console.error('Errore di rete:', error);
      alert("Errore nell'aggiunta dello step.");
    }
  };

  return (
    <div className="test-popup">
      <div className="test-popup-content">
        <h2>{currentTest?.name}</h2>
        <h3>Steps configured:</h3>
        <ul>
          {steps.length > 0 ? (
            steps.map((step, index) => (
              <li key={index} className="step-item">
                <div>
                  <p><strong>Description:</strong> {stepDefinitions[step._id]?.description || 'Caricamento descrizione...'}</p>
                  <p><strong>Action Type:</strong> {stepDefinitions[step._id]?.actionType || 'Caricamento actionType...'}</p>
                  <p><strong>Value:</strong> {stepDefinitions[step._id]?.value || 'Caricamento param...'}</p>
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

        {showForm && (
          <div className="add-step-form">
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
              {actionTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
        )}
        <div className="popup-actions">
          <button onClick={() => setSelectedTest(null)}>Chiudi</button>
        </div>
      </div>
    </div>
  );
};

export default TestPopup;
