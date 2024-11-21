const Tenant = require('../models/Tenant');
const User = require('../models/User');

// Crea un nuovo Tenant (solo admin)
const createTenant = async (req, res) => {
  const { name } = req.body;
  const userId = req.user._id; // Ottieni l'utente dal token JWT (già autenticato)

  try {
    // Verifica se l'utente ha già un tenant
    const existingTenant = await Tenant.findOne({ userId });
    if (existingTenant) {
      return res.status(400).json({ message: 'User already has a tenant' });
    }

    // Crea un nuovo tenant
    const newTenant = new Tenant({ name, userId });
    await newTenant.save();

    // Associa il tenant all'utente (campo tenantId nell'utente)
    await User.findByIdAndUpdate(userId, { tenantId: newTenant._id });

    res.status(201).json({ message: 'Tenant created successfully', tenant: newTenant });
  } catch (error) {
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




module.exports = {
  createTenant,
  getTenant,
};
