//backend/routes/index.js

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
router.post('/assignTenant', authMiddleware, roleMiddleware('admin'), tenantController.assignTenantToUser);
router.get('/tenant', authMiddleware, tenantController.getTenant);

// Test Management (Protette)
router.post('/tests/create', authMiddleware, testController.createTest);
router.get('/tests/:tenantname', authMiddleware, testController.getTests);
router.post('/tests/:testId/steps/add', authMiddleware, testController.addStepToTest);
router.get('/tests/:testId/steps', authMiddleware, testController.getStepsByTestId);
router.delete('/tests/:testId/steps/:stepId/delete', authMiddleware, testController.deleteStep);

//Step Management (protette)
router.get('/steps/:stepId', authMiddleware, testController.getStepDetails);

//Step Execution 
router.post('/tests/:testId/run', testController.runTest);
router.put('/tests/:testId/message', authMiddleware, testController.updateTestMessage);
module.exports = router;

