import React, { useState } from 'react'; 
import './TestPopup.css';

const TestPopup = ({ selectedTest, setSelectedTest }) => {
  const [newStepDescription, setNewStepDescription] = useState('');
  const [newStepActionType, setNewStepActionType] = useState('');
  const [newStepValue, setNewStepValue] = useState('');

  const handleAddStep = async () => {
    if (!newStepDescription.trim() || !newStepActionType.trim()) {
      alert('Descrizione e tipo di azione sono obbligatori.');
      return;
    }
  
    // Controlla che il token esista
    if (!selectedTest?.user?.token) {
      alert('Token utente non disponibile. Effettua nuovamente il login.');
      return;
    }
  
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/tests/${selectedTest._id}/steps`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${selectedTest.user.token}`,
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
        setSelectedTest(data.test);
        setNewStepDescription('');
        setNewStepActionType('');
        setNewStepValue('');
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
        <h2>{selectedTest.name}</h2>
        <p>{selectedTest.description}</p>
        <h3>Steps</h3>
        <ul>
          {selectedTest.steps && selectedTest.steps.length > 0 ? (
            selectedTest.steps.map((step, index) => (
              <li key={index}>
                <p><strong>{step.name}</strong></p>
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
            placeholder="Valore (opzionale)"
            value={newStepValue}
            onChange={(e) => setNewStepValue(e.target.value)}
          />
          <button onClick={handleAddStep}>Aggiungi Step</button>
        </div>
        <button onClick={() => setSelectedTest(null)}>Chiudi</button>
      </div>
    </div>
  );
};

export default TestPopup;