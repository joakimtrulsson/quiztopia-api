const middy = require('@middy/core');
const bcrypt = require('bcryptjs');
// Nytt
const validator = require('@middy/validator');
const { transpileSchema } = require('@middy/validator/transpile');
const httpJsonBodyParser = require('@middy/http-json-body-parser');
const httpErrorHandler = require('@middy/http-error-handler');
const httpHeaderNormalizer = require('@middy/http-header-normalizer');

const { sendResponse, sendError } = require('../responses/index');
const { db } = require('../services/index');
const { createToken } = require('../utilities/signToken');
const schema = require('../schemas/signInSchema.json');

const handler = middy(async (event, context) => {
  try {
    const { userName, password } = event.body;

    if (!userName || !password) {
      return sendError(400, { success: false, error: 'Please provide username and password.' });
    }

    const params = {
      TableName: process.env.DYNAMODB_USERS_TABLE,
      IndexName: process.env.DYNAMODB_USER_INDEX,
      KeyConditionExpression: 'userName = :userName',
      ExpressionAttributeValues: {
        ':userName': userName,
      },
    };

    const userData = await db.query(params).promise();

    if (userData.Items.length === 0) {
      return sendError(401, { success: false, error: 'User not found.' });
    }

    const isPasswordValid = await bcrypt.compare(password, userData.Items[0].password);

    if (!isPasswordValid) {
      return sendError(401, { success: false, error: 'Invalid password.' });
    }

    userData.Items[0].password = undefined;

    const token = createToken(userData.Items[0].userId);

    return sendResponse(200, {
      success: true,
      message: 'You have successfully signed in.',
      userData: userData.Items[0],
      token,
    });
  } catch (error) {
    return sendError(500, {
      success: false,
      errorMessage: error.message,
      error: 'User sign-in failed.',
    });
  }
})
  .use(httpHeaderNormalizer())
  .use(httpJsonBodyParser())
  .use(
    validator({
      eventSchema: transpileSchema(schema),
    })
  )
  .use(httpErrorHandler());

module.exports = { handler };
