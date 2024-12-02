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

const getStepsByTestId = async (req, res) => {
  const { testId } = req.params;

  try {
    // Trova il test e popola i dettagli degli step
    const test = await Test.findById(testId).populate('steps');
    if (!test) {
      return res.status(404).json({ message: 'Test non trovato' });
    }

    res.status(200).json({ steps: test.steps });
  } catch (error) {
    console.error('Errore durante il recupero degli step:', error);
    res.status(500).json({ message: 'Errore durante il recupero degli step', error });
  }
};



const addStepToTest = async (req, res) => {
  const { testId } = req.params;
  const { description, actionType, selector, value, screenshotPath, url } = req.body;

  if (!description || !actionType) {
    return res.status(400).json({ message: 'Description and actionType are required.' });
  }

  // Validate actionType
  const validActionTypes = ['click', 'type', 'navigate', 'waitForSelector', 'screenshot', 'assert'];
  if (!validActionTypes.includes(actionType)) {
    return res.status(400).json({ message: 'Azione non supportata.' });
  }

  // Validate selector and value based on actionType
  if (['click', 'type', 'waitForSelector', 'assert'].includes(actionType) && !selector) {
    return res.status(400).json({ message: 'Selector is required for this action type.' });
  }

  if (actionType === 'type' && !value) {
    return res.status(400).json({ message: 'Value is required for "type" action.' });
  }

  if (actionType === 'screenshot' && !screenshotPath) {
    return res.status(400).json({ message: 'Screenshot path is required for "screenshot" action.' });
  }

  if (actionType === 'navigate' && !url) {
    return res.status(400).json({ message: 'URL is required for "navigate" action.' });
  }

  try {
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found.' });
    }

    const newStep = new Step({
      description,
      actionType,
      selector: selector || null,
      value: value || null,
      screenshotPath: screenshotPath || null,
      url: url || null,  // Ensure URL is set if actionType is 'navigate'
    });

    await newStep.save();
    test.steps.push(newStep._id);
    await test.save();

    res.status(201).json({ message: 'Step added successfully.', step: newStep });
  } catch (error) {
    console.error('Error adding step:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};





const deleteStep = async (req, res) => {
  const { testId, stepId } = req.params;

  try {
    // Trova il test
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test non trovato' });
    }

    // Rimuovi il riferimento dello step dall'array `steps`
    test.steps.pull(stepId);
    await test.save();

    // Elimina il documento dello step
    await Step.findByIdAndDelete(stepId);

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
    // Recupera il test dal database e popola gli step
    const test = await Test.findById(testId).populate({
      path: 'steps',
      model: 'Step',
    });

    if (!test) {
      return res.status(404).json({ message: 'Test non trovato' });
    }

    console.log(`Esecuzione test: ${test.name}`);

    if (!test.steps || test.steps.length === 0) {
      return res.status(400).json({ message: 'Il test non ha nessun step definito.' });
    }

    // Prepara gli step da inviare al server Playwright
    const commands = test.steps.map((step) => {
      const baseCommand = { action: step.actionType, args: [] };

      switch (step.actionType) {
        case 'navigate':
          return { ...baseCommand, args: [step.url] };
        case 'click':
          return { ...baseCommand, args: [step.selector] };
        case 'type':
          return { ...baseCommand, args: [step.selector, step.value] };
        case 'waitForSelector':
          return { ...baseCommand, args: [step.selector] };
        case 'assert':
          return { ...baseCommand, args: [step.selector, step.expectedValue] };
        case 'screenshot':
          return { ...baseCommand, args: [step.screenshotPath] };
        default:
          throw new Error(`Azione sconosciuta: ${step.actionType}`);
      }
    });

    // Log per debug
    console.log('Commands inviati a Playwright:', JSON.stringify({ commands }, null, 2));

    // Effettua una chiamata POST al server Playwright
    const response = await axios.post('http://playwright:3003/run-test', { commands });

    if (response.status === 200) {
      test.status = 'success';
      await test.save();
      return res.status(200).json({ message: 'Test completato con successo', test });
    } else {
      test.status = 'failure';
      await test.save();
      return res.status(500).json({ message: 'Errore durante l\'esecuzione del test', error: response.data });
    }
  } catch (error) {
    console.error('Errore durante l\'esecuzione del test:', error);
    const test = await Test.findById(testId);
    if (test) {
      test.status = 'failure';
      await test.save();
    }
    return res.status(500).json({ message: 'Errore durante l\'esecuzione del test', error: error.message });
  }
};





module.exports = { createTest, getTests, addStepToTest, getStepsByTestId,  deleteStep , getStepDetails, runTest};
