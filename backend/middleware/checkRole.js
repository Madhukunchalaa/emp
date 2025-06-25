const checkRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    // Support both string and array
    if (Array.isArray(role)) {
      if (!role.includes(req.user.role)) {
        return res.status(403).json({ message: `Access denied. ${role.join(', ')} role required.` });
      }
    } else {
      if (req.user.role !== role) {
        return res.status(403).json({ message: `Access denied. ${role} role required.` });
      }
    }
    next();
  };
};

module.exports = checkRole; 