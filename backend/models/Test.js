const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  name: { type: String, required: true },
  steps: [{ step: String, details: Object }],
});

module.exports = mongoose.model('Test', testSchema);
