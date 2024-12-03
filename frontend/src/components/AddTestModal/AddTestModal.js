import React, { useState } from 'react'; 
import './AddTestModal.css';

const AddTestModal = ({ setIsAddingTest, fetchTests }) => {
  const [newTestName, setNewTestName] = useState('');

  const handleAddTest = async () => {
    if (!newTestName.trim()) {
      alert('Il nome del test non può essere vuoto.');
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const tenantName = user?.tenant;

      if (!tenantName) {
        alert('Errore: tenant non trovato. Effettua nuovamente il login.');
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/tests/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ name: newTestName, tenantName }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        //alert('Test creato con successo.');
        fetchTests(); // Aggiorna la lista dei test
        setIsAddingTest(false);
      } else {
        alert(`Errore: ${data.message}`);
      }
    } catch (error) {
      console.error('Errore di rete:', error);
      alert('Errore nella creazione del test.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Aggiungi un nuovo test</h3>
        <input
          type="text"
          placeholder="Nome del test"
          value={newTestName}
          onChange={(e) => setNewTestName(e.target.value)}
        />
        <button onClick={handleAddTest}>Aggiungi</button>
        <button onClick={() => setIsAddingTest(false)}>Annulla</button>
      </div>
    </div>
  );
};

export default AddTestModal;