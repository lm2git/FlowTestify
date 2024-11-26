// models/Step.js
const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  description: String,
  actionType: String,
  value: String,
  status: { type: String, default: 'pending' },
  order: Number,
});

const Step = mongoose.model('Step', stepSchema);

module.exports = Step;