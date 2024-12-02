import React from 'react';
import './TestList.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import '../../styles/Dashboard.css';

const TestList = ({ tests, isLoading, onTestClick, fetchTests, onTestReorder }) => {

  const handleRunTest = async (testId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/tests/${testId}/run`, { method: 'POST' });
      const result = await response.json();

      if (response.ok) {
        alert('Test completato con successo');
      } else {
        alert(`Errore durante il test: ${result.message}`);
      }

      fetchTests(); // Ricarica i test dopo l'esecuzione
    } catch (error) {
      console.error('Errore durante l\'esecuzione del test:', error);
      alert('Errore durante l\'esecuzione del test');
    }
  };

  const handleOnDragEnd = (result) => {
    const { destination, source } = result;

    if (!destination) return;

    // Puoi gestire il riordinamento dei test qui
    const reorderedTests = Array.from(tests);
    const [removed] = reorderedTests.splice(source.index, 1);
    reorderedTests.splice(destination.index, 0, removed);

    // Aggiorna lo stato dei test dopo il riordino
    fetchTests(reorderedTests);
  };

  if (isLoading) return <p>Caricamento...</p>;

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="test-list" direction="horizontal">
        {(provided) => (
          <div
            className="test-list"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tests.map((test, index) => (
              <Draggable key={test._id} draggableId={test._id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`test-card ${test.status}`}
                  >
                    <h3>{test.name}</h3>
                    <p>Ultimo risultato: {test.status === 'success' ? 'OK' : test.status === 'failure' ? 'Fallito' : 'In attesa'}</p>
                    <div className="test-actions">
                      <button onClick={() => onTestClick(test)}>Dettagli</button>
                      <button onClick={() => handleRunTest(test._id)}>Esegui Test</button>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default TestList;
