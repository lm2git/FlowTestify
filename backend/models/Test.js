const mongoose = require('mongoose');
const Step = require('../models/Step');


// Schema del Test
const testSchema = new mongoose.Schema({
  name: { type: String, required: true },
  steps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Step' }],  // Fai riferimento al modello Step
  steps: [stepSchema], // Array di step
});

const Test = mongoose.model('Test', testSchema);

module.exports = Test;