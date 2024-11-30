//backend/controllers/testController.js

const Tenant = require('../models/Tenant');
const Test = require('../models/Test');
const Step = require('../models/Step');
const axios = require('axios');

const { executeStep } = require('../services/testExecutionService');  // Importa il servizio per eseguire i passi

// Funzione per creare un test
const createTest = async (req, res) => {
  const { name, tenantName } = req.body; // Non includiamo gli step qui

  try {
    // Verifica che il tenant esista
    const tenant = await Tenant.findOne({ name: tenantName });
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Verifica che non esista già un test con lo stesso nome nello stesso tenant
    const test = await Test.findOne({ name: name, tenantName: tenantName });
    if (test) {
      return res.status(409).json({ message: 'Test with the same name already exists in this tenant' });
    }

    // Crea un nuovo test senza step
    const newTest = new Test({ name, steps: [], tenantName });
    await newTest.save();

    res.status(201).json({ message: 'Test created successfully', test: newTest });
  } catch (error) {
    console.error('Error creating test:', error);
    res.status(500).json({ message: 'Error creating test', error });
  }
};




// Funzione per ottenere i test di un tenant
const getTests = async (req, res) => {
  const { tenantname } = req.params;

  try {
    // Trova i test per il tenant specificato
    const tests = await Test.find({ tenantName: tenantname }).populate('steps');
    if (!tests || tests.length === 0) {
      return res.status(404).json({ message: 'Nessun test trovato per questo tenant' });
    }

    res.status(200).json({ tests });
  } catch (error) {
    console.error('Errore nel caricamento dei test:', error);
    res.status(500).json({ message: 'Errore nel caricamento dei test', error });
  }
};

// Funzione per ottenere gli step di un test specifico
const getStepsByTestId = async (req, res) => {
  const { testId } = req.params;

  try {
    // Trova il test tramite il suo ID e popola gli step
    const test = await Test.findById(testId).populate('steps');
    if (!test) {
      return res.status(404).json({ message: 'Test non trovato' });
    }

    // Restituisce solo gli step del test
    res.status(200).json({ steps: test.steps });
  } catch (error) {
    console.error('Errore durante il recupero degli step:', error);
    res.status(500).json({ message: 'Errore durante il recupero degli step', error });
  }
};

const addStepToTest = async (req, res) => {
  const { testId } = req.params;
  const { description, actionType, selector, value } = req.body;

  // Log del corpo della richiesta
  console.log('Dati ricevuti nel backend:', {
    description,
    actionType,
    selector,
    value,
  });

  if (!description || !actionType) {
    return res.status(400).json({ message: 'Description and actionType are required.' });
  }

  try {
    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({ message: 'Test not found.' });
    }

    // Crea un nuovo documento Step
    const newStep = new Step({
      description,
      actionType,
      selector: selector || null,
      value: value || null,
    });

    // Salva lo step nel database
    await newStep.save();

    // Aggiungi l'ID dello step all'array steps del test
    test.steps.push(newStep._id);

    // Salva il test con il nuovo step
    await test.save();

    res.status(201).json({ message: 'Step added successfully.' });
  } catch (error) {
    console.error('Error adding step:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const deleteStep = async (req, res) => {
  try {
    const { testId, stepId } = req.params;

    // Trova il test
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test non trovato' });
    }

    // Trova e rimuovi lo step
    const stepToRemove = test.steps.id(stepId);
    if (!stepToRemove) {
      return res.status(404).json({ message: 'Step non trovato' });
    }

    // Rimuovi lo step
    test.steps.pull(stepId);

    // Salva il test aggiornato
    await test.save();

    res.status(200).json({ message: 'Step eliminato con successo' });
  } catch (error) {
    console.error('Errore nell\'eliminazione dello step:', error);
    res.status(500).json({ message: 'Errore del server' });
  }
};

// Funzione per ottenere la definizione completa di uno step
const getStepDetails = async (req, res) => {
  const stepId = req.params.stepId;

  try {
    // Cerca lo step nel database
    const step = await Step.findById(stepId);

    if (!step) {
      return res.status(404).json({ message: 'Step non trovato' });
    }

    // Restituisci la definizione completa dello step
    res.json(step);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
};

const runTest = async (req, res) => {
  const { testId } = req.params;

  try {
    // Recupera il test dal database
    const test = await Test.findById(testId).populate('steps');
    if (!test) {
      return res.status(404).json({ message: 'Test non trovato' });
    }

    console.log(`Esecuzione test: ${test.name}`);

    // Effettua una chiamata POST al server Playwright
    const response = await axios.post('http://playwright:3003/run-test', {
      steps: test.steps, // Passa gli step al server Playwright
    });

    if (response.status === 200) {
      // Aggiorna lo stato del test come successo
      test.status = 'success';
      await test.save();
      res.status(200).json({ message: 'Test completato con successo', test });
    } else {
      // Gestisci eventuali errori
      test.status = 'failure';
      await test.save();
      res.status(500).json({ message: 'Errore durante il test', error: response.data });
    }
  } catch (error) {
    console.error('Errore durante l\'esecuzione del test:', error);

    // Aggiorna lo stato del test come fallito
    const test = await Test.findById(testId);
    if (test) {
      test.status = 'failure';
      await test.save();
    }

    res.status(500).json({ message: 'Errore durante l\'esecuzione del test', error: error.message });
  }
};


module.exports = { createTest, getTests, addStepToTest, getStepsByTestId,  deleteStep , getStepDetails, runTest};
