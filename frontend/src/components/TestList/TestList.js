import React from 'react';
import './TestList.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import '../../styles/Dashboard.css';

const TestList = ({ tests, isLoading, onTestClick, fetchTests, onTestReorder }) => {
  
  // Funzione per gestire il completamento del test
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

  // Funzione per gestire il riordino dei test
  const handleOnDragEnd = (result) => {
    const { destination, source } = result;

    if (!destination) return;

    const reorderedTests = Array.from(tests);
    const [removed] = reorderedTests.splice(source.index, 1);
    reorderedTests.splice(destination.index, 0, removed);

    // Aggiorna lo stato dei test, non richiama fetch
    onTestReorder(reorderedTests);
  };

  // Caricamento dei dati
  if (isLoading) return <p>Caricamento...</p>;

  // Verifica che tests non sia vuoto e che gli ID siano validi
  if (!tests || tests.length === 0) return <p>Nessun test trovato.</p>;

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="test-list" direction="horizontal">
        {(provided) => (
          <div
            className="test-list"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tests.map((test, index) => {
              // Aggiungi un controllo per l'ID e assicurati che sia presente
              const testId = test._id ? test._id.toString() : `${index}`;
              return (
                <Draggable key={testId} draggableId={testId} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`test-card ${test.status}`}
                      style={{
                        ...provided.draggableProps.style,
                        animationDelay: `${index * 0.1}s`
                      }}
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
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default TestList;
