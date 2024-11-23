const Step = require('../models/Step');
const Test = require('../models/Test');
const { executeStep } = require('../services/testExecutionService');  // Importa il servizio per eseguire i passi

// Funzione per creare un test
const createTest = async (req, res) => {
  try {
    const { name, steps } = req.body;
    const newTest = new Test({ name, steps });
    await newTest.save();
    res.status(201).json(newTest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore durante la creazione del test' });
  }
};


// Funzione per eseguire un test
const executeTest = async (req, res) => {
  const testId = req.params.id;
  try {
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test non trovato' });
    }

    // Esegui ogni step del test
    for (const step of test.steps) {
      const stepResult = await executeStep(step);  // Funzione che esegue il passo (Playwright)
      step.status = stepResult.status;
      step.executedAt = new Date();
      await step.save();
    }

    res.json({ message: 'Test eseguito con successo', test });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore durante l\'esecuzione del test' });
  }
};

// Funzione per recuperare i test per un determinato tenant
const getTests = async (req, res) => {
  try {
    const tenantId = req.params.tenantId; // Recupera l'ID del tenant dai parametri della richiesta

    // Trova i test associati al tenant specificato
    const tests = await Test.find({ tenantId: tenantId }).populate('steps'); // Associa i passi dei test

    if (!tests || tests.length === 0) {
      return res.status(404).json({ message: 'Nessun test trovato per questo tenant.' });
    }

    // Ritorna i test trovati
    res.json(tests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore durante il recupero dei test.' });
  }
};

module.exports = { createTest, executeTest, getTests };
