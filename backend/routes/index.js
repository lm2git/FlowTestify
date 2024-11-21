const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const testController = require('../controllers/testController');
const authMiddleware = require('../middlewares/authMiddleware');

// Authentication
router.post('/login', authController.login);
router.post('/register', authController.register); // Optional

// Test Management (Protected)
router.post('/tests', authMiddleware, testController.createTest);
router.get('/tests/:tenantId', authMiddleware, testController.getTests);
router.get('/test/:id', authMiddleware, testController.getTestById);
router.put('/test/:id', authMiddleware, testController.updateTest);
router.delete('/test/:id', authMiddleware, testController.deleteTest);

module.exports = router;
