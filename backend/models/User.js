const mongoose = require('mongoose');
const Tenant = require('./Tenant'); // Assicurati di avere il modello Tenant

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['user', 'admin'], 
    default: 'user',
  },
  tenantId: { 
    type: [mongoose.Schema.Types.ObjectId], 
    ref: 'Tenant',
    default: [], 
  },
  createdTenants: { 
    type: [mongoose.Schema.Types.ObjectId], 
    ref: 'Tenant',
    default: [],
  },
});

// Middleware pre-save per creare un tenant associato all'utente
userSchema.pre('save', async function (next) {
  // Verifica se l'utente è nuovo
  if (this.isNew) {
    try {
      // Crea un nuovo tenant con il nome dell'username
      const tenant = new Tenant({
        name: this.username, // Usa il nome utente come nome del tenant
        createdBy: this._id, // Associa l'utente come creatore
      });
      
      await tenant.save();

      // Associa il tenant all'utente
      this.tenantId.push(tenant._id);
      this.createdTenants.push(tenant._id);
    } catch (error) {
      return next(error); // Passa l'errore a Mongoose
    }
  }

  next();
});

module.exports = mongoose.model('User', userSchema);
