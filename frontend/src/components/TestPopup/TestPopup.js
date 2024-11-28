import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './TestPopup.css';

const ItemType = {
  STEP: 'step',
};

// Componente per un singolo Step (elemento trascinabile e con pulsante di eliminazione)
const StepItem = ({ step, index, moveStep, handleDeleteStep }) => {
  const [, ref] = useDrag({
    type: ItemType.STEP,
    item: { index },
  });

  const [, drop] = useDrop({
    accept: ItemType.STEP,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveStep(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <li ref={(node) => ref(drop(node))} className="step-item">
      <div>
        <p><strong>{step._id}</strong></p>
        <p>{step.description}</p>
      </div>
      <button onClick={() => handleDeleteStep(step._id)} className="delete-button">
        Elimina
      </button>
    </li>
  );
};

const TestPopup = ({ selectedTest, setSelectedTest }) => {
  const [newStepDescription, setNewStepDescription] = useState('');
  const [newStepActionType, setNewStepActionType] = useState('');
  const [newStepValue, setNewStepValue] = useState('');
  const [currentTest, setCurrentTest] = useState(selectedTest);

  useEffect(() => {
    if (selectedTest) {
      setCurrentTest(selectedTest);
    }
  }, [selectedTest]);

  const fetchTestSteps = async () => {
    if (!selectedTest) return;

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/tests/${selectedTest._id}/steps`,
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
        setCurrentTest((prevTest) => ({
          ...prevTest,
          steps: data.steps,
        }));
      } else {
        alert(`Errore nel recupero degli step: ${data.message}`);
      }
    } catch (error) {
      console.error('Errore di rete:', error);
      alert('Errore nel recupero degli step.');
    }
  };

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
        fetchTestSteps();
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
        fetchTestSteps(); // Ricarica gli step dopo l'eliminazione
      } else {
        alert(`Errore: ${data.message}`);
      }
    } catch (error) {
      console.error('Errore di rete:', error);
      alert("Errore nell'eliminazione dello step.");
    }
  };

  const moveStep = async (fromIndex, toIndex) => {
    const user = JSON.parse(localStorage.getItem('user'));
    let retryCount = 0;
    const maxRetries = 3; // Numero massimo di tentativi
  
    // Funzione per ricaricare gli step e ottenere la versione aggiornata
    const fetchUpdatedSteps = async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/tests/${selectedTest._id}/steps`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (!response.ok) {
        const data = await response.json();
        alert(data.message || 'Errore nel recupero degli step');
        return null;
      }
  
      const data = await response.json();
      return data;
    };
  
    // Funzione principale per il movimento degli step
    const reorderSteps = async (steps, version) => {
      const reorderResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/tests/${selectedTest._id}/steps/reorder`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            steps: steps,   // Gli step riordinati
            version: version, // La versione aggiornata
          }),
        }
      );
  
      if (!reorderResponse.ok) {
        const reorderData = await reorderResponse.json();
        alert(reorderData.message || 'Errore nell\'aggiornamento degli step');
        return false;
      }
      return true;
    };
  
    // Funzione per il movimento con tentativi
    const moveStepWithRetry = async () => {
      let success = false;
  
      // Riordina gli step localmente nel frontend
      const updatedSteps = [...currentTest.steps];
      const [movedStep] = updatedSteps.splice(fromIndex, 1);
      updatedSteps.splice(toIndex, 0, movedStep);
  
      setCurrentTest((prevTest) => ({
        ...prevTest,
        steps: updatedSteps,
      }));
  
      // Prova a ripetere l'operazione fino al massimo dei tentativi
      while (retryCount < maxRetries && !success) {
        const data = await fetchUpdatedSteps();
        if (!data) return;
  
        const { __v: version } = data;
  
        // Tentiamo di eseguire l'operazione con la versione più aggiornata
        success = await reorderSteps(updatedSteps, version);
  
        if (!success) {
          retryCount++;
          if (retryCount < maxRetries) {
            alert(`Tentativo ${retryCount} fallito, ricaricando i dati...`);
          }
        }
      }
  
      if (success) {
        alert('Ordine degli step aggiornato con successo.');
        fetchTestSteps(); // Ricarica gli step dopo l'aggiornamento
      } else {
        alert('Impossibile aggiornare gli step dopo i tentativi.');
      }
    };
  
    // Avvia il processo di aggiornamento
    moveStepWithRetry();
  };
  

  if (!currentTest || !currentTest.steps) {
    return null;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="test-popup">
        <div className="test-popup-content">
          <h2>{currentTest.name}</h2>
          <p>{currentTest.description}</p>
          <h3>Steps</h3>
          <ul>
            {currentTest.steps && currentTest.steps.length > 0 ? (
              currentTest.steps.map((step, index) => (
                <StepItem
                  key={index}
                  step={step}
                  index={index}
                  moveStep={moveStep}
                  handleDeleteStep={handleDeleteStep}
                />
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
    </DndProvider>
  );
};

export default TestPopup;
