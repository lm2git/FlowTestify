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
// Assegnare un utente a un tenant (solo admin)
router.post('/assignTenant', authMiddleware, roleMiddleware('admin'), tenantController.assignTenantToUser);
// Ottieni il Tenant dell'utente
router.get('/tenant', authMiddleware, tenantController.getTenant);

// Test Management (Protette)
router.post('/tests/create', authMiddleware, testController.createTest);
router.get('/tests/:tenantname', authMiddleware, testController.getTests);
router.put('/test/:id', authMiddleware, async (req, res) => {
    try {
      const result = await testController.updateTest(req, res);  // Verifica se `updateTest` è definito
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Errore durante l\'aggiornamento del test' });
    }
  });
// Elimina un test
router.delete('/test/:id', authMiddleware, async (req, res) => {
    try {
      const result = await testController.deleteTest(req, res);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Errore durante l\'eliminazione del test' });
    }
  });
router.post('/test/:id/execute', authMiddleware, testController.executeTest);




module.exports = router;

