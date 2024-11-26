import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [newStepDescription, setNewStepDescription] = useState('');
  const [newStepActionType, setNewStepActionType] = useState('');
  const [newStepValue, setNewStepValue] = useState('');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user')); // Ottieni l'utente autenticato
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/tests/${user.tenantName}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setTests(data.tests);
      } else {
        alert(`Errore nel caricamento dei test: ${data.message}`);
      }
    } catch (error) {
      console.error('Errore di rete:', error);
      alert('Errore nel caricamento dei test.');
    }
  };

  const handleTestClick = (test) => {
    setSelectedTest(test);
  };

  const handleAddStep = async () => {
    if (!newStepDescription.trim() || !newStepActionType.trim()) {
      alert('Descrizione e tipo di azione sono obbligatori.');
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/tests/${selectedTest._id}/steps`,
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
        setSelectedTest(data.test); // Aggiorna il test selezionato
        setNewStepDescription('');
        setNewStepActionType('');
        setNewStepValue('');
      } else {
        alert(`Errore: ${data.message}`);
      }
    } catch (error) {
      console.error('Errore di rete:', error);
      alert('Errore nell\'aggiunta dello step.');
    }
  };

  return (
    <div className="dashboard">
      <h1>Dashboard dei Test</h1>
      <div className="tests-list">
        <h2>Elenco Test</h2>
        <ul>
          {tests.map((test) => (
            <li key={test._id} onClick={() => handleTestClick(test)}>
              {test.name}
            </li>
          ))}
        </ul>
      </div>

      {selectedTest && (
        <div className="test-details">
          <h2>Dettagli Test: {selectedTest.name}</h2>
          <h3>Steps:</h3>
          <ul>
            {selectedTest.steps.map((step) => (
              <li key={step.order}>
                {step.order}. {step.description} - {step.actionType}
              </li>
            ))}
          </ul>

          <div className="add-step-form">
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
        </div>
      )}
    </div>
  );
};

export default Dashboard;
