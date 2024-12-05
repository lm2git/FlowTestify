import React, { useState, useEffect } from "react";
import "./TestPopup.css";

const TestPopup = ({ selectedTest, setSelectedTest }) => {
  const [steps, setSteps] = useState([]);
  const [newStepDescription, setNewStepDescription] = useState("");
  const [newStepActionType, setNewStepActionType] = useState("");
  const [newStepSelector, setNewStepSelector] = useState("");
  const [newStepValue, setNewStepValue] = useState("");
  const [currentTest, setCurrentTest] = useState(selectedTest);
  const [showForm, setShowForm] = useState(false);
  const [selectors, setSelectors] = useState({
    click: [],
    type: [],
    waitForSelector: [],
    assert: []
  });

  // Funzione per recuperare gli steps dal backend
  const fetchTestSteps = async (testId) => {
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/tests/${testId}/steps`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setSteps(data.steps); // Imposta gli steps ricevuti nel state
      } else {
        alert(`Errore: ${data.message}`);
      }
    } catch (error) {
      console.error("Errore di rete:", error);
      alert("Errore nel recupero degli steps.");
    }
  };

  // Funzione per recuperare i suggerimenti dalla API
  const fetchSelectors = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/selectors`, // L'endpoint dell'API che restituisce il JSON con i selettori
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        // Salva i dati ricevuti (contenenti click, type, waitForSelector, assert) nello stato
        setSelectors(data.selectors);
      } else {
        alert(`Errore: ${data.message}`);
      }
    } catch (error) {
      console.error("Errore di rete:", error);
      alert("Errore nel recupero dei selettori.");
    }
  };

  // Funzione per aggiungere un nuovo step
  const handleAddStep = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    const stepData = {
      description: newStepDescription.trim(),
      actionType: newStepActionType.trim(),
      value: newStepValue || "",
    };

    if (newStepActionType === "navigate") {
      stepData.url = newStepSelector.trim();
    } else {
      stepData.selector = newStepSelector.trim();
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP.BACKEND_URL}/tests/${selectedTest._id}/steps/add`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(stepData),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setSteps((prevSteps) => [...prevSteps, data.step]); // Aggiungi lo step appena creato alla lista
        alert("Passo aggiunto con successo!");
      } else {
        alert(`Errore: ${data.message}`);
      }
    } catch (error) {
      console.error("Errore di rete:", error);
      alert("Errore nel salvataggio del passo.");
    }
  };

  // Funzione per ottenere i suggerimenti in base all'azione selezionata
  const getSuggestionsForAction = () => {
    switch (newStepActionType) {
      case "click":
        return selectors.click || [];
      case "type":
        return selectors.type || [];
      case "navigate":
        return selectors.waitForSelector || []; // Puoi scegliere un altro set di suggerimenti per 'navigate'
      default:
        return [];
    }
  };

  // UseEffect per caricare gli steps e i selettori quando il test cambia
  useEffect(() => {
    if (selectedTest) {
      setCurrentTest(selectedTest);
      fetchTestSteps(selectedTest._id); // Carica gli steps per il test selezionato
    }
  }, [selectedTest]);

  useEffect(() => {
    fetchSelectors(); // Carica i selettori all'avvio
  }, []);

  return (
    <div className="test-popup">
      <h2>Test Steps</h2>
      <div>
        {steps.length === 0 ? (
          <p>Nessun passo trovato per questo test.</p>
        ) : (
          <ul>
            {steps.map((step, index) => (
              <li key={index}>
                <strong>{step.description}</strong>
                <div>
                  {step.actionType === "click" && <p>Action: Click</p>}
                  {step.actionType === "type" && <p>Action: Type</p>}
                  {step.actionType === "navigate" && <p>Action: Navigate</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={() => setShowForm(!showForm)}>Aggiungi Passo</button>

      {showForm && (
        <div>
          <input
            type="text"
            placeholder="Descrizione"
            value={newStepDescription}
            onChange={(e) => setNewStepDescription(e.target.value)}
          />
          <select
            value={newStepActionType}
            onChange={(e) => setNewStepActionType(e.target.value)}
          >
            <option value="">Seleziona un'azione</option>
            <option value="click">Click</option>
            <option value="type">Type</option>
            <option value="navigate">Navigate</option>
          </select>

          <input
            type="text"
            placeholder="Selector"
            value={newStepSelector}
            onChange={(e) => setNewStepSelector(e.target.value)}
          />
          <input
            type="text"
            placeholder="Value"
            value={newStepValue}
            onChange={(e) => setNewStepValue(e.target.value)}
          />

          {newStepActionType && (
            <div>
              <h4>Suggerimenti per {newStepActionType}:</h4>
              <ul>
                {getSuggestionsForAction().map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={handleAddStep}>Aggiungi Passo</button>
        </div>
      )}
    </div>
  );
};

export default TestPopup;
