const mongoose = require('mongoose');

// Aggiungi il campo 'role' al modello User
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['user', 'admin'],  // Puoi aggiungere altri ruoli se necessario
    default: 'user'  // Ruolo predefinito
  },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },  // Campo per associare il tenant
});

module.exports = mongoose.model('User', userSchema);
