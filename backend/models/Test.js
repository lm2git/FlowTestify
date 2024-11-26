// models/test.js
const mongoose = require('mongoose');
const stepSchema = require('../models/Step').schema; // Importa solo lo schema

// Schema del Test
const testSchema = new mongoose.Schema({
  name: { type: String, required: true },
  steps: [stepSchema],  // Array di oggetti con stepSchema
  tenantName: { type: String, required: true },  // Aggiungi tenantName
});

const Test = mongoose.model('Test', testSchema);

module.exports = Test;