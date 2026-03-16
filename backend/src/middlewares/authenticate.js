
import jwt    from 'jsonwebtoken';
import config from '../config/app.js';

const authenticate = (req, res, next) => {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided.' });
  }

  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = {
      id:        decoded.sub,
      role:      decoded.role,
      outlet_id: decoded.outlet_id,
    };
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Token expired.'
      : 'Invalid token.';
    return res.status(401).json({ success: false, error: message });
  }
};

export default authenticate;
