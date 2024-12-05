import React, { useState, useEffect } from "react";
import Select from "react-select"; // Importa la libreria React Select
import "./TestPopup.css";

const TestPopup = ({ selectedTest, setSelectedTest }) => {
  const [steps, setSteps] = useState([]);
  const [stepDefinitions, setStepDefinitions] = useState({});
  const [newStepDescription, setNewStepDescription] = useState("");
  const [newStepActionType, setNewStepActionType] = useState("");
  const [newStepSelector, setNewStepSelector] = useState("");
  const [newStepValue, setNewStepValue] = useState("");
  const [availableSelectors, setAvailableSelectors] = useState([]); // Stato per i selettori disponibili
  const [currentTest, setCurrentTest] = useState(selectedTest);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (selectedTest) {
      setCurrentTest(selectedTest);
      fetchTestSteps(selectedTest._id);
    }
  }, [selectedTest]);

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

  const fetchStepDefinitions = async (steps) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const newStepDefinitions = {};

    for (let step of steps) {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/steps/${step._id}`,
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
          newStepDefinitions[step._id] = {
            description: data.description,
            actionType: data.actionType,
            selector: data.selector,
            value: data.value,
          };
        } else {
          console.error(
            `Errore nel recupero della definizione per lo step ${step._id}: ${data.message}`
          );
        }
      } catch (error) {
        console.error("Errore di rete nella definizione dello step:", error);
      }
    }

    setStepDefinitions(newStepDefinitions);

    // Ottieni i selettori disponibili tramite il backend
    fetchAvailableSelectors();
  };

  const fetchAvailableSelectors = async () => {
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
        }
      );

      const data = await response.json();
      if (response.ok) {
        // Trasforma il JSON in un array di opzioni
        const selectors = Object.entries(data.selectors.selectors).flatMap(
          ([actionType, values]) =>
            values.map((selector) => ({ label: selector, value: selector }))
        );
        setAvailableSelectors(selectors);
      } else {
        alert(`Errore nel recupero dei selettori: ${data.message}`);
      }
    } catch (error) {
      console.error("Errore di rete:", error);
      alert("Errore nel recupero dei selettori.");
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

        {showForm && (
          <div className="add-step-form">
            <input
              type="text"
              placeholder="Descrizione dello step"
              value={newStepDescription}
              onChange={(e) => setNewStepDescription(e.target.value)}
            />
            <select
              value={newStepActionType}
              onChange={(e) => setNewStepActionType(e.target.value)}
            >
              <option value="">Seleziona un tipo di azione</option>
              <option value="click">Clicca su un elemento</option>
              <option value="type">Inserisci testo</option>
              <option value="navigate">Naviga a un URL</option>
              <option value="waitForSelector">Aspetta un elemento</option>
              <option value="assert">Verifica un elemento</option>
            </select>

            {["click", "type", "waitForSelector", "assert"].includes(
              newStepActionType
            ) && (
              <Select
                options={availableSelectors}
                onChange={(selected) => setNewStepSelector(selected?.value || "")}
                placeholder="Seleziona o inserisci un selettore"
                isClearable
                isSearchable
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
        )}
      </div>
    </div>
  );
};

export default TestPopup;
