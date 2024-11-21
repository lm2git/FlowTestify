const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');  // Estrarre il token dal header
  
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
  
    try {
      // Decodifica il token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;  // Aggiungi i dati decodificati all'oggetto request
      next();  // Passa al prossimo middleware/route handler
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  };

module.exports = authMiddleware;

