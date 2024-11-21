const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Ottieni il token da Authorization header
  
    if (!token) {
      return res.status(403).json({ message: 'Token is missing' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Aggiungi i dati decodificati (userId e role) a req.user
      console.log('User in authMiddleware:', req.user); // Verifica il contenuto di req.user
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token', error });
    }
  };

module.exports = authMiddleware;

