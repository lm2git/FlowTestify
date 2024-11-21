const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Login Controller
const login = async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const user = await User.findOne({ username }).populate('tenantId');  // Popola tenantId per recuperarlo facilmente
  
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Crea il token JWT
      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      // Invia la risposta con il token e il tenantId
      res.status(200).json({
        message: 'Login successful',
        token,           // Token JWT
        tenantId: user.tenantId._id, // Invia anche il tenantId
        userId: user._id,
        role: user.role
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error });
    }
  };
  
// Register Controller (with tenant association)
const register = async (req, res) => {
    console.log('Register controller is working');
    const { username, password, tenantId } = req.body;
  
    // Verifica che siano forniti username, password e tenantId
    if (!username || !password || !tenantId) {
      return res.status(400).json({ message: 'Username, password, and tenantId are required' });
    }
  
    try {
      // Verifica se il tenantId è valido
      const tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        return res.status(400).json({ message: 'Invalid tenantId' });
      }
  
      // Verifica se l'username è già stato registrato
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
  
      // Hash della password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Crea il nuovo utente con tenantId associato
      const newUser = new User({ username, password: hashedPassword, tenantId });
      await newUser.save();
  
      // Risposta di successo
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      console.error(`[FlowTestify] Error in register: ${error.message}`);
      res.status(500).json({ message: 'Internal server error', error });
    }
  };

module.exports = {
  login,
  register,
};
