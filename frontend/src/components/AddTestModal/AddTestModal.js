import React from 'react';
import './AddTestModal.css';

const AddTestModal = ({
  setIsAddingTest,
  newTestName,
  setNewTestName,
  handleAddTest,
}) => {
  return (
    <div className="add-test-modal">
      <div className="modal-content">
        <button className="close-modal" onClick={() => setIsAddingTest(false)}>
          ✖
        </button>
        <h2>Aggiungi un Nuovo Test</h2>
        <input
          type="text"
          placeholder="Nome del test"
          value={newTestName}
          onChange={(e) => setNewTestName(e.target.value)}
        />
        <button className="add-test-button" onClick={handleAddTest}>
          Aggiungi Test
        </button>
      </div>
    </div>
  );
};

export default AddTestModal;
