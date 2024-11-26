const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Tenant = require('../models/Tenant');

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

      // Crea il payload del JWT includendo anche il ruolo
      const token = jwt.sign(
        { userId: user._id, role: user.role },  // Assicurati che il ruolo sia incluso nel payload
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      // Restituisci il token JWT
      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error });
    }
  };
  
  
// Register Controller (con tenant associato)
const register = async (req, res) => {
  const { username, password, role = 'user' } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    // Controlla se l'username esiste già
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Hash della password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea un nuovo utente con ruolo
    const newUser = new User({ username, password: hashedPassword, role });

    // Salva il nuovo utente
    await newUser.save();

    // Crea un tenant associato al nome dell'utente
    const tenant = new Tenant({
      name: username,          // Nome del tenant
      createdBy: newUser._id,  // Utente creatore
      userId: newUser._id,     // Utente associato al tenant
    });
    await tenant.save();

    // Aggiorna l'utente con il tenant appena creato
    newUser.tenantId.push(tenant._id);
    if (role === 'admin') {
      newUser.createdTenants.push(tenant._id);
    }

    newUser.tenantName = tenant.name;
    console.log(newUser);
    await newUser.save();

    res.status(201).json({ message: 'User and default tenant created successfully' });
  } catch (error) {
    console.error(`[FlowTestify] Error in register: ${error.message}`);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

module.exports = {
  login,
  register,
};
