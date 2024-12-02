// models/test.js
const mongoose = require('mongoose');
const stepSchema = require('../models/Step').schema; // Importa solo lo schema

// Schema del Test
const testSchema = new mongoose.Schema({
  name: { type: String, required: true },
  steps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Step' }], // Array di riferimenti a Step
  tenantName: { type: String, required: true },  // Aggiungi tenantName
  status: { 
    type: String, 
    enum: ['pending', 'success', 'failure'], 
    default: 'pending' // Stato iniziale del test
  },
});

const Test = mongoose.model('Test', testSchema);

module.exports = Test;
