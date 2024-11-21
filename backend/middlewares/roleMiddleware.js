const roleMiddleware = (requiredRole) => {
    return (req, res, next) => {
      const user = req.user;  // L'utente è stato decodificato dal token
  
      // Verifica che l'utente abbia il ruolo richiesto
      if (user.role !== requiredRole) {
        return res.status(403).json({ message: 'Forbidden: You do not have the required role' });
      }
  
      next();  // Se il ruolo è corretto, passa alla richiesta successiva
    };
  };
  
  module.exports = roleMiddleware;
  