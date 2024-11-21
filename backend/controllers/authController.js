const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Login Controller
const login = async (req, res) => {
  console.log('Login controller is working');
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

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

const register = async (req, res) => {
    console.log('register controller is working');
    const { username, password } = req.body;
    console.log('Received username:', username);
    console.log('Received password:', password);
  
    try {
      // Verifica se l'utente esiste già
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        console.log('Username already exists');
        return res.status(400).json({ message: 'Username already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, password: hashedPassword });
  
      await newUser.save();
      console.log('User created successfully');
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      console.error('Error in register:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  };

module.exports = {
  login,
  register,
};
