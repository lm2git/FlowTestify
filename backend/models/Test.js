// models/test.js
const mongoose = require('mongoose');
const stepSchema = require('../models/Step').schema;

const testSchema = new mongoose.Schema({
  name: { type: String, required: true },
  steps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Step' }],
  tenantName: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'success', 'failure'],
    default: 'pending',
  },
  message: {  
    type: String,
    default: 'no error detail',
  }
});

const Test = mongoose.model('Test', testSchema);

module.exports = Test;
