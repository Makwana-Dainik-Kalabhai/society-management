const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'super_secret_society_jwt_key_2026_x99';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id }, secret, { expiresIn });
};

const generateRefreshToken = (id) => {
  const secret = process.env.REFRESH_SECRET || 'super_secret_society_refresh_key_2026_x99';
  const expiresIn = process.env.REFRESH_EXPIRES_IN || '30d';
  return jwt.sign({ id }, secret, { expiresIn });
};

module.exports = {
  generateToken,
  generateRefreshToken
};
