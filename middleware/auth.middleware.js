const jwt = require('jsonwebtoken');


module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Bearer <token>
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is secure
    req.user = decoded; // Attach user info to the request
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};
