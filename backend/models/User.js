const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },  // Riferimento al tenant associato
  role: { type: String, enum: ['admin', 'user'], default: 'user' }  // Aggiunto il campo 'role'
});

module.exports = mongoose.model('User', userSchema);
