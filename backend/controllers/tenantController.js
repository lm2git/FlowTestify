const Tenant = require('../models/Tenant');
const User = require('../models/User');


// Funzione per creare un tenant e associare un utente admin che lo crea
const createTenant = async (req, res) => {
    const { name } = req.body;
    const userId = req.user.userId; // Ottieni l'utente dal token JWT (già autenticato)
  
    console.log('User in createTenant:', req.user); // Aggiungi un log per verificare il contenuto di req.user
    console.log('User ID:', userId); // Verifica se userId è presente
  
    try {
      // Crea un nuovo tenant
      const newTenant = new Tenant({ name, userId });
      await newTenant.save();
  
      // Aggiorna la lista 'createdTenants' dell'admin
      await User.findByIdAndUpdate(userId, { $push: { createdTenants: newTenant._id } });
  
      res.status(201).json({ message: 'Tenant created successfully', tenant: newTenant });
    } catch (error) {
      console.error('Error creating tenant:', error); // Log aggiuntivo per il debug
      res.status(500).json({ message: 'Error creating tenant', error });
    }
  };

// Ottieni il Tenant dell'utente
const getTenant = async (req, res) => {
    const userId = req.user._id; // Ottieni l'utente dal token JWT (già autenticato)

    try {
        const tenant = await Tenant.findOne({ userId });
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        res.status(200).json(tenant);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tenant', error });
    }
};

// Funzione per assegnare un tenant a un utente (solo admin)
const assignTenantToUser = async (req, res) => {
    const { userId, tenantId } = req.body; // Ottieni userId e tenantId dalla richiesta
  
    // Verifica che l'utente che sta facendo la richiesta sia un admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Only admins can assign tenants' });
    }
  
    try {
      // Verifica se il tenant esiste
      const tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found' });
      }
  
      // Verifica se l'utente esiste
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Assegna il tenant all'utente (aggiungi tenantId alla lista)
      user.tenantId.push(tenantId);
      await user.save();  // Salva l'utente con il nuovo tenantId
  
      res.status(200).json({ message: 'Tenant successfully assigned to user', user });
    } catch (error) {
      console.error('Error assigning tenant to user:', error);
      res.status(500).json({ message: 'Error assigning tenant to user', error });
    }
  };
  
  

module.exports = {
    createTenant,
    getTenant,
    assignTenantToUser
};
