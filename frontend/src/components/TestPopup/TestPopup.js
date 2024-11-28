import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './TestPopup.css';

const ITEM_TYPE = 'STEP'; // Tipo per React DnD

const StepItem = ({ step, index, moveStep, removeStep }) => {
  const [, ref] = useDrag({
    type: ITEM_TYPE,
    item: { index },
  });

  const [, drop] = useDrop({
    accept: ITEM_TYPE,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveStep(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <li ref={(node) => ref(drop(node))} className="step-item">
      <p><strong>{step.description}</strong></p>
      <button onClick={() => removeStep(index)}>Elimina</button>
    </li>
  );
};

const TestPopup = ({ selectedTest, setSelectedTest }) => {
  const [newStepDescription, setNewStepDescription] = useState('');
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    if (selectedTest) {
      setSteps(selectedTest.steps || []);
    }
  }, [selectedTest]);

  const moveStep = (fromIndex, toIndex) => {
    const updatedSteps = [...steps];
    const [movedStep] = updatedSteps.splice(fromIndex, 1);
    updatedSteps.splice(toIndex, 0, movedStep);
    setSteps(updatedSteps);
  };

  const removeStep = (index) => {
    const updatedSteps = steps.filter((_, i) => i !== index);
    setSteps(updatedSteps);
  };

  const saveOrder = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/tests/${selectedTest._id}/steps/reorder`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ steps }),
      }
    );

    if (response.ok) {
      alert('Ordine salvato con successo.');
    } else {
      alert('Errore nel salvataggio dell\'ordine.');
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="test-popup">
        <h2>{selectedTest.name}</h2>
        <ul>
          {steps.map((step, index) => (
            <StepItem
              key={step._id}
              step={step}
              index={index}
              moveStep={moveStep}
              removeStep={removeStep}
            />
          ))}
        </ul>
        <button onClick={saveOrder}>Salva Ordine</button>
        <button onClick={() => setSelectedTest(null)}>Chiudi</button>
      </div>
    </DndProvider>
  );
};

export default TestPopup;
