const jwt = require('jsonwebtoken');

const createToken = (userId) => {
  const token = jwt.sign({ userId: userId }, process.env.JWTSECRET, {
    expiresIn: process.env.JWTEXPIRATION,
  });

  return token;
};

module.exports = { createToken };
