const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

const authController = require('../controllers/authController');
const testController = require('../controllers/testController');
const tenantController = require('../controllers/tenantController');

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');


console.log('Binding routes...');
router.post('/login', authController.login); 
router.post('/register', authController.register); 

// Tenant Management (Protected)
// Crea un nuovo Tenant (solo admin)
router.post('/tenant', authMiddleware, roleMiddleware('admin'), tenantController.createTenant);

// Ottieni il Tenant dell'utente
router.get('/tenant', authMiddleware, tenantController.getTenant);


// Test Management (Protected)
router.post('/tests', authMiddleware, testController.createTest);
router.get('/tests/:tenantId', authMiddleware, testController.getTests);
router.get('/test/:id', authMiddleware, testController.getTestById);
router.put('/test/:id', authMiddleware, testController.updateTest);
router.delete('/test/:id', authMiddleware, testController.deleteTest);


//testing 
// Crea un Tenant per il testing (non protetta)
router.post('/create-test-tenant', async (req, res) => {
    try {
      // Crea un Tenant di prova
      const tenant = new Tenant({
        name: 'TestTenant',  // Puoi definire un nome di test o renderlo dinamico
      });
  
      // Salva il tenant nel database
      const savedTenant = await tenant.save();
  
      // Risposta di successo con il tenant appena creato
      res.status(201).json({
        message: 'Test tenant created successfully',
        tenant: savedTenant
      });
    } catch (error) {
      console.error('Error creating test tenant:', error);
      res.status(500).json({ message: 'Failed to create test tenant', error });
    }
  });


module.exports = router;

