const mongoose = require('mongoose');

const StepSchema = new mongoose.Schema({
  description: {
    type: String,
    required: false,
  },
  actionType: {
    type: String,
    required: true,
    enum: ['click', 'type', 'navigate', 'waitForSelector', 'screenshot', 'assert'], // valori consentiti
  },
  selector: {
    type: String,
    required: function () {
      return ['click', 'type', 'waitForSelector', 'assert', 'navigate'].includes(this.actionType);
    }, // richiesto solo per azioni che lo necessitano
  },
  value: {
    type: String,
    required: function () {
      return this.actionType === 'type'; // richiesto solo per 'type'
    },
  },
  screenshotPath: {
    type: String,
    required: function () {
      return this.actionType === 'screenshot'; // richiesto solo per screenshot
    },
  },
});

module.exports = mongoose.model('Step', StepSchema);
