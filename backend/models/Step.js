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
      // Il selector è richiesto solo per alcune azioni (escluso 'navigate')
      return ['click', 'type', 'waitForSelector', 'assert'].includes(this.actionType);
    }, 
  },
  url: {
    type: String,
    required: function () {
      // L'URL è richiesto solo per l'azione 'navigate'
      return this.actionType === 'navigate';
    }
  },
  value: {
    type: String,
    required: function () {
      // Il valore è richiesto solo per l'azione 'type'
      return this.actionType === 'type';
    },
  },
  screenshotPath: {
    type: String,
    required: function () {
      // Il percorso dello screenshot è richiesto solo per l'azione 'screenshot'
      return this.actionType === 'screenshot';
    },
  },
});

module.exports = mongoose.model('Step', StepSchema);
