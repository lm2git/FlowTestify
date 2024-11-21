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

// Ottieni i Tenant associati all'utente
const getTenant = async (req, res) => {
    const userId = req.user.userId; // Ottieni l'ID utente dal token JWT (già autenticato)

    try {
        // Trova l'utente e popola i dettagli dei tenant
        const user = await User.findById(userId).populate('tenantId'); // Popola i dettagli dei tenant
        if (!user) {
            return res.status(404).json({ message: 'no Tenant found linked with this user' });
        }

        // Costruisci la risposta
        const response = {
            associatedTenants: user.tenantId, // Tenant a cui l'utente ha accesso
        };

        // Se l'utente è un admin, includi i tenant creati
        if (user.role === 'admin') {
            const populatedUser = await user.populate('createdTenants'); // Popola i tenant creati
            response.createdTenants = populatedUser.createdTenants;
        }

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching tenant:', error); // Log utile per il debug
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
  
        // Controlla se il tenant è già assegnato all'utente
        if (user.tenantId.includes(tenantId)) {
            return res.status(400).json({ message: 'Tenant already assigned to user' });
        }
  
        // Assegna il tenant all'utente (aggiungi tenantId alla lista)
        user.tenantId.push(tenantId);
        await user.save(); // Salva l'utente con il nuovo tenantId
  
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
