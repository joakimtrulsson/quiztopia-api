const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const { sendResponse, sendError } = require('../responses/index');

const validateToken = {
  before: async (request) => {
    try {
      const token = request.event.headers.authorization.replace('Bearer ', '');

      const decoded = await promisify(jwt.verify)(token, process.env.JWTSECRET);

      request.event.userId = decoded.userId;

      return request.response;
    } catch (error) {
      if (error.name === 'TypeError') {
        return sendError(401, { success: false, message: 'No token provided.' });
      }
      if (error.name === 'JsonWebTokenError') {
        return sendError(401, { success: false, message: 'Invalid token.' });
      }
      if (error.name === 'TokenExpiredError') {
        return sendError(401, { success: false, message: 'Token has expired.' });
      }
    }
  },
  onError: async (request) => {
    request.event.error = '401';
    return request.response;
  },
};

module.exports = { validateToken };
