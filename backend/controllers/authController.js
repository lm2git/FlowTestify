const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Tenant = require('../models/Tenant'); // Aggiungi il modello Tenant

// Register Controller (con creazione automatica di un tenant)
const register = async (req, res) => {
    console.log('Register controller is working');
    const { username, password } = req.body;
  
    // Verifica che username e password siano forniti
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
  
    try {
        // Verifica se il nome utente esiste già
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username is already taken' });
        }
  
        // Crea un Tenant (oppure puoi modificare questa logica per scegliere un tenant esistente)
        const tenant = new Tenant({
            name: 'Default Tenant',  // Puoi cambiare il nome o renderlo dinamico
        });
        const savedTenant = await tenant.save();  // Salva il tenant
  
        // Hash della password
        const hashedPassword = await bcrypt.hash(password, 10);
  
        // Crea un nuovo utente e assegna il tenantId
        const newUser = new User({
            username,
            password: hashedPassword,
            tenantId: savedTenant._id,  // Assegna il tenantId all'utente
        });
        await newUser.save();
  
        // Restituisci una risposta di successo
        res.status(201).json({
            message: 'User created successfully',
            tenant: savedTenant,  // Restituisce anche il tenant creato
            user: newUser,  // Restituisce l'utente creato
        });
    } catch (error) {
        console.error(`[FlowTestify] Error in register: ${error.message}`);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

// Login Controller (rimane invariato)
const login = async (req, res) => {
    const { username, password } = req.body;
  
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
  
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
  
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

module.exports = {
    login,
    register,
};
