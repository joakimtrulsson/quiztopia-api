const middy = require('@middy/core');

const { db } = require('../services/index');
const { validateToken } = require('../middleware/validateToken');
const { sendResponse, sendError } = require('../responses/index');
const { checkIfQuizExists } = require('../utilities/quizUtils');

const handler = middy(async (event) => {
  try {
    const quizId = event.pathParameters.quizId;
    const requestBody = JSON.parse(event.body);
    const { score } = requestBody;
    const userId = event.userId;

    const quizExists = await checkIfQuizExists(quizId);

    if (!quizExists) {
      return sendError(404, {
        success: false,
        message: 'Quiz not found.',
      });
    }

    const newScore = {
      quizId,
      userId,
      score,
    };

    const params = {
      TableName: process.env.DYNAMODB_LEADERBOARD_TABLE,
      Item: newScore,
    };

    await db.put(params).promise();

    return sendResponse(200, {
      success: true,
      message: 'Score successfully saved.',
    });
  } catch (error) {
    return sendError(400, {
      success: false,
      error: error.message,
      message: 'Could not save your score.',
    });
  }
}).use(validateToken);

module.exports = { handler };
