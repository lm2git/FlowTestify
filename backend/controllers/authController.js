const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Login Controller
const login = async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Trova l'utente per nome utente
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
  
      // Verifica la password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Aggiungi role al payload (ruolo utente)
      const token = jwt.sign(
        { userId: user._id, role: user.role },  // Aggiungi anche il ruolo
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      // Restituisci il token JWT
      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error });
    }
  };
  
 // Register Controller (with username check)
const register = async (req, res) => {
    console.log('Register controller is working');
    const { username, password, role = 'user' } = req.body;  // Aggiungi un ruolo predefinito come 'user'
  
    // Controlla che username e password siano forniti
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
  
    try {
      // Controlla se l'username esiste già
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
  
      // Hash la password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Crea un nuovo utente
      const newUser = new User({ username, password: hashedPassword, role }); // Imposta il ruolo durante la creazione
      await newUser.save();
  
      // Restituisci un messaggio di successo
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
