import React, { useState, useEffect } from "react";
import "./TestPopup.css";

const TestPopup = ({ selectedTest, setSelectedTest }) => {
  const [steps, setSteps] = useState([]);
  const [stepDefinitions, setStepDefinitions] = useState({});
  const [newStepDescription, setNewStepDescription] = useState("");
  const [newStepActionType, setNewStepActionType] = useState("");
  const [newStepSelector, setNewStepSelector] = useState("");
  const [newStepValue, setNewStepValue] = useState("");
  const [currentTest, setCurrentTest] = useState(selectedTest);
  const [showForm, setShowForm] = useState(false);
  const [suggestedSelectors, setSuggestedSelectors] = useState({
    click: [],
    type: [],
    waitForSelector: [],
    assert: [],
  });

  useEffect(() => {
    if (selectedTest) {
      setCurrentTest(selectedTest);
      fetchTestSteps(selectedTest._id);
    }
  }, [selectedTest]);

  useEffect(() => {
    if (newStepActionType) {
      fetchSelectorsSuggestions();
    }
  }, [newStepActionType]);

  const fetchSelectorsSuggestions = async () => {
    if (!selectedTest) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/tests/${selectedTest._id}/run-and-extract-selectors`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ testId: selectedTest._id }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuggestedSelectors(data.selectors.selectors || {});
      } else {
        alert(`Errore nel recupero dei selettori: ${data.message}`);
      }
    } catch (error) {
      console.error("Errore di rete:", error);
      alert("Errore nel recupero dei selettori.");
    }
  };

  const handleDeleteStep = async (stepId) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!window.confirm("Sei sicuro di voler eliminare questo step?")) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/tests/${selectedTest._id}/steps/${stepId}/delete`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Step eliminato con successo.");
        fetchTestSteps(selectedTest._id);
      } else {
        alert(`Errore: ${data.message}`);
      }
    } catch (error) {
      console.error("Errore di rete:", error);
      alert("Errore nell'eliminazione dello step.");
    }
  };

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
        `${process.env.REACT_APP_BACKEND_URL}/tests/${selectedTest._id}/steps/add`,
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
        alert("Step aggiunto con successo");
        fetchTestSteps(selectedTest._id);
      } else {
        alert(`Errore: ${data.message}`);
      }
    } catch (error) {
      console.error("Errore di rete:", error);
      alert("Errore nell'aggiunta dello step.");
    }
  };

  if (!currentTest || !steps) {
    return null;
  }

  return (
    <div className="test-popup">
      <div className="test-popup-content">
        <h2>{currentTest.name}</h2>
        <p>{currentTest.description}</p>
        <h3>Steps configurati:</h3>
        <ul>
          {steps.length > 0 ? (
            steps.map((step, index) => (
              <li key={index} className="step-item">
                <div>
                  <p>
                    <strong>ID Step:</strong> {step._id}
                  </p>
                  <p>
                    <strong>Description:</strong>{" "}
                    {stepDefinitions[step._id]?.description ||
                      "Caricamento descrizione..."}
                  </p>
                  <p>
                    <strong>Action Type:</strong>{" "}
                    {stepDefinitions[step._id]?.actionType ||
                      "Caricamento actionType..."}
                  </p>
                  <p>
                    <strong>Selector:</strong>{" "}
                    {stepDefinitions[step._id]?.selector || "N/A"}
                  </p>
                  <p>
                    <strong>Value:</strong>{" "}
                    {stepDefinitions[step._id]?.value || "N/A"}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteStep(step._id)}
                  className="delete-button"
                >
                  Elimina
                </button>
              </li>
            ))
          ) : (
            <p>Nessun step disponibile</p>
          )}
        </ul>
        <button
          onClick={() => setShowForm(!showForm)}
          className="show-form-button"
        >
          {showForm ? "Annulla" : "Aggiungi Nuovo Step"}
        </button>

        <div className={`add-step-form ${showForm ? "slide-in" : "slide-out"}`}>
          <input
            type="text"
            placeholder="Descrizione dello step (es: 'Clicca sul pulsante di login')"
            value={newStepDescription}
            onChange={(e) => setNewStepDescription(e.target.value)}
          />
          <select
            value={newStepActionType}
            onChange={(e) => setNewStepActionType(e.target.value)}
          >
            <option value="">Seleziona un tipo di azione</option>
            <option value="click">Clicca su un elemento (click)</option>
            <option value="type">Inserisci testo in un campo (type)</option>
            <option value="navigate">Naviga a un URL (navigate)</option>
            <option value="waitForSelector">
              Aspetta la presenza di un elemento (waitForSelector)
            </option>
            <option value="screenshot">Cattura uno screenshot</option>
            <option value="assert">Verifica che un elemento esista</option>
          </select>

          {["click", "type", "waitForSelector", "assert"].includes(
            newStepActionType
          ) && (
            <select
              value={newStepSelector}
              onChange={(e) => setNewStepSelector(e.target.value)}
            >
              <option value="">Seleziona un selettore</option>
              {suggestedSelectors[newStepActionType]?.map((selector, index) => (
                <option key={index} value={selector}>
                  {selector}
                </option>
              ))}
            </select>
          )}

          {newStepActionType === "navigate" && (
            <input
              type="text"
              placeholder="Inserisci l'URL (es: 'https://example.com')"
              value={newStepSelector}
              onChange={(e) => setNewStepSelector(e.target.value)}
            />
          )}

          {newStepActionType === "type" && (
            <input
              type="text"
              placeholder="Inserisci il testo da digitare"
              value={newStepValue}
              onChange={(e) => setNewStepValue(e.target.value)}
            />
          )}

          <button onClick={handleAddStep} className="add-step-button">
            Aggiungi Step
          </button>
        </div>
        <button onClick={() => setSelectedTest(null)}>Chiudi</button>
      </div>
    </div>
  );
};

export default TestPopup;
