const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  description: String, // Descrizione dello step
  actionType: String,  // Tipo di azione (es. "click", "go to url", etc.)
  value: String,       // Valore associato all'azione (es. URL per "go to url")
  status: String,      // Stato del test step (es. "success", "failed", etc.)
  order: Number,       // Ordine dello step
});

// Schema del Test
const testSchema = new mongoose.Schema({
  name: { type: String, required: true },
  steps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Step' }],  // Fai riferimento al modello Step
  steps: [stepSchema], // Array di step
});

const Test = mongoose.model('Test', testSchema);

module.exports = Test;