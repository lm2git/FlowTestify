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

    // Se non è stato rilasciato in una nuova posizione, non fare nulla
    if (!destination) return;

    // Se la posizione di partenza e quella di destinazione sono uguali, non fare nulla
    if (destination.index === source.index) return;

    // Riordina i test
    const reorderedTests = Array.from(tests);
    const [movedTest] = reorderedTests.splice(source.index, 1);
    reorderedTests.splice(destination.index, 0, movedTest);

    // Passa i test riordinati al genitore per aggiornare lo stato
    onTestReorder(reorderedTests);
  };

  if (isLoading) return <p>Caricamento...</p>;

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="testList" direction="horizontal">
        {(provided) => (
          <div
            className="test-list"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {Array.isArray(tests) && tests.length > 0 ? (
              tests.map((test, index) => (
                <Draggable key={test._id || index} draggableId={test._id || index.toString()} index={index}>
                  {(provided) => (
                    <div
                      className={`test-card ${test.status}`}
                      style={{
                        ...provided.draggableProps.style,
                        animationDelay: `${index * 0.1}s`,
                      }}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
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
              ))
            ) : (
              <p>Nessun test trovato.</p>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default TestList;
