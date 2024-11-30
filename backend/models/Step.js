// models/Step.js
const mongoose = require('mongoose');

const StepSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  actionType: {
    type: String,
    required: true,
    enum: ['click', 'type', 'navigate', 'waitForSelector', 'screenshot', 'assert'], // valori consentiti
  },
  selector: {
    type: String,
    required: function () {
      return ['click', 'type', 'waitForSelector', 'assert'].includes(this.actionType);
    }, // richiesto solo per azioni che lo necessitano
  },
  value: {
    type: String,
    required: function () {
      return this.actionType === 'type'; // richiesto solo per 'type'
    },
  },
});

module.exports = mongoose.model('Step', StepSchema);
