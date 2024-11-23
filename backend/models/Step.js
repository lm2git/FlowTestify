const mongoose = require('mongoose');

// Schema per i passi di un test
const stepSchema = new mongoose.Schema({
  description: { type: String, required: true },
  playwrightCommand: { type: String, required: true },
  status: { type: String, enum: ['ok', 'fail'], default: 'ok' },
  executedAt: { type: Date },
});

// Modello per i passi
module.exports = mongoose.model('Step', stepSchema);
