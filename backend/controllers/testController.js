const Step = require('../models/Step');
const Test = require('../models/Test');
const Tenant = require('../models/Tenant');

const { executeStep } = require('../services/testExecutionService');  // Importa il servizio per eseguire i passi

// Funzione per creare un test
const createTest = async (req, res) => {
  const { name, steps, tenantName } = req.body;  // Includi tenantName

  try {
      // Verifica che il tenant esista
      const tenant = await Tenant.findOne({ name: tenantName });
      if (!tenant) {
          return res.status(404).json({ message: 'Tenant not found' });
      }

      // Crea un nuovo test con il tenantName
      const newTest = new Test({ name, steps, tenantName });
      await newTest.save();

      res.status(201).json({ message: 'Test created successfully', test: newTest });
  } catch (error) {
      console.error('Error creating test:', error);
      res.status(500).json({ message: 'Error creating test', error });
  }
};

// Funzione per ottenere i test di un tenant
const getTests = async (req, res) => {
  const { tenantId } = req.params;

  try {
      // Trova i test per il tenant specificato
      const tests = await Test.find({ tenantName: tenantId }).populate('steps');
      if (!tests) {
          return res.status(404).json({ message: 'No tests found for this tenant' });
      }

      res.status(200).json({ tests });
  } catch (error) {
      console.error('Error fetching tests:', error);
      res.status(500).json({ message: 'Error fetching tests', error });
  }
};

// Funzione per aggiornare un test
const updateTest = async (req, res) => {
  const { id } = req.params;
  const { name, steps, tenantName } = req.body;

  try {
      // Trova il test e aggiorna il nome, i passi e il tenantName
      const updatedTest = await Test.findByIdAndUpdate(id, { name, steps, tenantName }, { new: true });
      if (!updatedTest) {
          return res.status(404).json({ message: 'Test not found' });
      }

      res.status(200).json({ message: 'Test updated successfully', test: updatedTest });
  } catch (error) {
      console.error('Error updating test:', error);
      res.status(500).json({ message: 'Error updating test', error });
  }
};

// Funzione per eliminare un test
const deleteTest = async (req, res) => {
  const { id } = req.params;

  try {
      // Trova e rimuovi il test
      const deletedTest = await Test.findByIdAndDelete(id);
      if (!deletedTest) {
          return res.status(404).json({ message: 'Test not found' });
      }

      res.status(200).json({ message: 'Test deleted successfully' });
  } catch (error) {
      console.error('Error deleting test:', error);
      res.status(500).json({ message: 'Error deleting test', error });
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



module.exports = { createTest, executeTest, getTests, updateTest, deleteTest };
