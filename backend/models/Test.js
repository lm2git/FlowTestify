const mongoose = require('mongoose');
const Step = require('./Step');  // Importa il modello di Step

// Schema del Test
const testSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tenantName: { type: String, required: true }, // Aggiungi tenantName
  steps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Step' }]  // Fai riferimento al modello Step
});

module.exports = mongoose.model('Test', testSchema);
