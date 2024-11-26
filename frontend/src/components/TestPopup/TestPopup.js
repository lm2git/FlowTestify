import React from 'react';
import '../styles/TestPopup.css';

const TestPopup = ({ selectedTest, closeTestDetails, fetchTests }) => {
  const handleDeleteTest = async () => {
    if (!window.confirm('Sei sicuro di voler eliminare questo test?')) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/tests/delete/${selectedTest._id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}`,
          },
        }
      );

      if (response.ok) {
        alert('Test eliminato con successo.');
        closeTestDetails();
        fetchTests();
      } else {
        const data = await response.json();
        alert(`Errore: ${data.message}`);
      }
    } catch (error) {
      console.error('Errore di rete:', error);
      alert('Errore durante l’eliminazione del test.');
    }
  };

  return (
    <div className="test-popup">
      <div className="popup-content">
        <button className="close-popup" onClick={closeTestDetails}>
          ✖
        </button>
        <h2>Dettagli del Test</h2>
        <p><strong>Nome:</strong> {selectedTest.name}</p>
        <p><strong>Status:</strong> {selectedTest.status}</p>
        <p><strong>Descrizione:</strong> {selectedTest.description || 'N/A'}</p>
        <button className="delete-test" onClick={handleDeleteTest}>
          Elimina Test
        </button>
      </div>
    </div>
  );
};

export default TestPopup;
