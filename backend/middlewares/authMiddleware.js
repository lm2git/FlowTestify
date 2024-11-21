const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Authorization required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).populate('tenantId');  // Popola tenantId per accedere facilmente

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;  // Aggiungi l'utente al request
    req.tenantId = user.tenantId._id;  // Aggiungi il tenantId al request

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token', error });
  }
};

module.exports = authMiddleware;

