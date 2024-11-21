const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');  // Estrarre il token
  
    if (!token) {
      return res.status(401).json({ message: 'Authorization required' });
    }
  
    try {
      // Verifica il token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);  // Trova l'utente con l'ID
  
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
  
      req.user = user;  // Salva l'utente nel request per poterlo utilizzare nei middleware successivi
      next();  // Continua con la richiesta
    } catch (error) {
      res.status(401).json({ message: 'Invalid token', error });
    }
  };
  

module.exports = authMiddleware;

