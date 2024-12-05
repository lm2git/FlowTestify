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
  const [suggestions, setSuggestions] = useState([]); // Stato per suggerimenti

  // Esempio di selector statici per suggerimenti (dal JSON fornito)
  const availableSelectors = {
    click: ["a.MV3Tnb", "#RP3V5c", "#HQ1lb"],
    type: ["#APjFqb", "input.gNO89b", "textarea.csi"],
    waitForSelector: ["body.EM1Mrb", "div.L3eUgb", "div.o3j99.n1xJcf.Ne6nSd"],
    assert: []
  };

  useEffect(() => {
    if (selectedTest) {
      setCurrentTest(selectedTest);
      fetchTestSteps(selectedTest._id);
    }
  }, [selectedTest]);

  const handleInputSelector = (e) => {
    const value = e.target.value;
    setNewStepSelector(value);

    // Mostra suggerimenti basati sul tipo di azione
    if (newStepActionType && availableSelectors[newStepActionType]) {
      const filteredSuggestions = availableSelectors[newStepActionType].filter((selector) =>
        selector.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setNewStepSelector(suggestion);
    setSuggestions([]); // Nasconde i suggerimenti dopo la selezione
  };

  const fetchTestSteps = async (testId) => {
    if (!testId) return;
    try {
      const user = JSON.parse(localStorage.getItem("user"));
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
        setSteps(data.steps);
        fetchStepDefinitions(data.steps);
      } else {
        alert(`Errore nel recupero degli step: ${data.message}`);
      }
    } catch (error) {
      console.error("Errore di rete:", error);
      alert("Errore nel recupero degli step.");
    }
  };

  // La logica per fetchStepDefinitions, handleAddStep e handleDeleteStep rimane invariata...

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
            <>
              <input
                type="text"
                placeholder="Inserisci il selettore CSS o XPath (es: '#id-button')"
                value={newStepSelector}
                onChange={handleInputSelector}
              />
              {suggestions.length > 0 && (
                <ul className="suggestions-list">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="suggestion-item"
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </>
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
