const { sendResponse, sendError } = require('../../responses/index');
const { db } = require('../../services/index');
const { createToken } = require('../../utils/signToken');

const { nanoid } = require('nanoid');
const bcrypt = require('bcryptjs');

exports.handler = async (event, context) => {
  try {
    const requestBody = JSON.parse(event.body);

    if (requestBody.password !== requestBody.passwordConfirm) {
      return sendError(400, { success: false, message: 'Passwords do not match.' });
    }

    const userId = nanoid(6);

    const newUser = {
      userId,
      userName: requestBody.userName,
      password: requestBody.password,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const checkIfUserExcists = {
      TableName: process.env.DYNAMODB_USERS_TABLE,
      IndexName: process.env.DYNAMODB_USER_INDEX,
      KeyConditionExpression: 'userName = :userName',
      ExpressionAttributeValues: {
        ':userName': newUser.userName,
      },
    };

    const isUserExists = await db.query(checkIfUserExcists).promise();

    if (isUserExists.Items.length > 0) {
      return sendError(400, { success: false, message: 'Username already exists.' });
    }

    newUser.password = await bcrypt.hash(newUser.password, 12);

    const params = {
      TableName: process.env.DYNAMODB_USERS_TABLE,
      Item: newUser,
    };

    await db.put(params).promise();
    newUser.passwordConfirm = undefined;
    newUser.password = undefined;

    const token = createToken(newUser.userId);

    return sendResponse(200, {
      success: true,
      message: 'User registration successful.',
      user: newUser,
      token,
    });
  } catch (error) {
    console.error(error);
    return sendError(500, { success: false, error: 'User registration failed.' });
  }
};
