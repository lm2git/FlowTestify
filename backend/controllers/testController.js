//backend/controllers/testController.js

const Tenant = require('../models/Tenant');
const Test = require('../models/Test');
const Step = require('../models/Step');


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
  const { testId } = req.params; // ID del test
  const { description, actionType, value } = req.body; // Dati dello step

  try {
    // Trova il test
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Crea un nuovo documento per lo step
    const newStep = new Step({
      description,
      actionType,
      value,
      status: 'pending',  // Status iniziale dello step
      order: test.steps.length + 1,  // Ordina lo step
    });

    // Salva il nuovo step nel database
    await newStep.save();

    // Aggiungi l'ID dello step al test
    test.steps.push(newStep._id);

    // Salva il test aggiornato
    await test.save();

    // Popola l'array degli steps con gli oggetti completi
    const updatedTest = await Test.findById(testId).populate('steps'); 

    // Restituisci il test aggiornato con gli steps popolati
    res.status(200).json({ message: 'Step added successfully', test: updatedTest });
  } catch (error) {
    console.error('Error adding step:', error);
    res.status(500).json({ message: 'Error adding step', error });
  }
};

const reorderSteps = async (req, res) => {
  try {
    const { testId } = req.params;
    const { steps } = req.body; // L'array riordinato di step

    // Trova il test
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test non trovato' });
    }

    // Riassegna il nuovo ordine di steps
    test.steps = steps;

    // Salva il test con il nuovo ordine
    await test.save();

    res.status(200).json({ message: 'Ordine degli step aggiornato' });
  } catch (error) {
    console.error('Errore nell\'aggiornare l\'ordine degli step:', error);
    res.status(500).json({ message: 'Errore del server' });
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



module.exports = { createTest, getTests, addStepToTest, getStepsByTestId, reorderSteps, deleteStep };
