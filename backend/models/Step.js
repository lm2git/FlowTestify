// models/Step.js
const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  description: String,
  actionType: String,
  value: String,
  status: { type: String, default: 'pending' },
  order: { type: Number, default: 0 },
});

const Step = mongoose.model('Step', stepSchema);

module.exports = Step;