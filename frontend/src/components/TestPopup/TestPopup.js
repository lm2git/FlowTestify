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
  const [selectors, setSelectors] = useState({
    click: [
      "a.MV3Tnb", "a.MV3Tnb", "#RP3V5c", "#HQ1lb"
    ],
    type: [
      "#APjFqb", "input.gNO89b", "input[name=\"iflsig\"]", "textarea.csi"
    ],
    waitForSelector: [
      "body.EM1Mrb", "div.L3eUgb", "div.o3j99.n1xJcf.Ne6nSd", "a.MV3Tnb", "div.gb_K"
    ],
    assert: []
  });

  useEffect(() => {
    if (selectedTest) {
      setCurrentTest(selectedTest);
      fetchTestSteps(selectedTest._id);
    }
  }, [selectedTest]);

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

  const handleActionTypeChange = (e) => {
    setNewStepActionType(e.target.value);
    setNewStepSelector(""); // Reset the selector when action changes
  };

  return (
    <div className="test-popup">
      <div className="test-popup-content">
        <h2>{currentTest.name}</h2>
        <p>{currentTest.description}</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="show-form-button"
        >
          {showForm ? "Annulla" : "Aggiungi Nuovo Step"}
        </button>

        <div className={`add-step-form ${showForm ? "slide-in" : "slide-out"}`}>
          <input
            type="text"
            placeholder="Descrizione dello step"
            value={newStepDescription}
            onChange={(e) => setNewStepDescription(e.target.value)}
          />
          <select
            value={newStepActionType}
            onChange={handleActionTypeChange}
          >
            <option value="">Seleziona un tipo di azione</option>
            <option value="click">Clicca su un elemento (click)</option>
            <option value="type">Inserisci testo in un campo (type)</option>
            <option value="navigate">Naviga a un URL (navigate)</option>
            <option value="waitForSelector">
              Aspetta la presenza di un elemento (waitForSelector)
            </option>
            <option value="assert">Verifica che un elemento esista (assert)</option>
          </select>

          {newStepActionType === "click" && (
            <div>
              <label>Selettori per click:</label>
              <ul>
                {selectors.click.map((selector, index) => (
                  <li key={index}>{selector}</li>
                ))}
              </ul>
            </div>
          )}

          {newStepActionType === "type" && (
            <div>
              <label>Selettori per type:</label>
              <ul>
                {selectors.type.map((selector, index) => (
                  <li key={index}>{selector}</li>
                ))}
              </ul>
            </div>
          )}

          {newStepActionType === "waitForSelector" && (
            <div>
              <label>Selettori per waitForSelector:</label>
              <ul>
                {selectors.waitForSelector.map((selector, index) => (
                  <li key={index}>{selector}</li>
                ))}
              </ul>
            </div>
          )}

          {newStepActionType === "assert" && (
            <div>
              <label>Selettori per assert:</label>
              <p>Nessun selettore predefinito disponibile per assert.</p>
            </div>
          )}

          <input
            type="text"
            placeholder="Valore associato all'azione (opzionale)"
            value={newStepValue}
            onChange={(e) => setNewStepValue(e.target.value)}
          />

          <button onClick={handleAddStep}>Aggiungi Step</button>
        </div>
      </div>
    </div>
  );
};

export default TestPopup;
