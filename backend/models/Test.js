const mongoose = require('mongoose');
const stepSchema = require('./Step');  // Importiamo lo schema degli step

const testSchema = new mongoose.Schema({
  name: { type: String, required: true },
  steps: [stepSchema],  // Array di passi
});

module.exports = mongoose.model('Test', testSchema);
