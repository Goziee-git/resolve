const express = require('express');
const router = express.Router();
const calculationController = require('../controllers/calculationController');

// POST route to perform calculation
router.post('/', calculationController.calculate);

// GET route to retrieve calculation history
router.get('/history', calculationController.getHistory);

module.exports = router;
