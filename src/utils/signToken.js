const jwt = require('jsonwebtoken');

const createToken = (userId) => {
  console.log(userId);
  const token = jwt.sign({ userId: userId }, process.env.JWTSECRET, {
    expiresIn: process.env.JWTEXPIRATION,
  });

  // res.cookie('jwt', token, {
  //   expires: new Date(Date.now() + process.env.TOKEN_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
  //   httpOnly: true,
  //   secure: true,
  //   sameSite: 'none',
  // });

  return token;
};

module.exports = { createToken };
