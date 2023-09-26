const { db } = require('../services/index');
const { sendResponse, sendError } = require('../responses/index');
const { checkIfQuizExists } = require('../utilities/quizUtils');

exports.handler = async (event) => {
  try {
    const quizId = event.pathParameters.quizId;

    const quizExists = await checkIfQuizExists(quizId);

    if (!quizExists) {
      return sendError(404, {
        success: false,
        message: 'Quiz not found.',
      });
    }

    const params = {
      TableName: process.env.DYNAMODB_LEADERBOARD_TABLE,
      IndexName: 'ScoreIndex',
      KeyConditionExpression: 'quizId = :quizId',
      ExpressionAttributeValues: {
        ':quizId': quizId,
      },
      ScanIndexForward: false,
    };

    const leaderboardResult = await db.query(params).promise();

    return sendResponse(200, {
      success: true,
      message: 'Leaderboard successfully retrieved.',
      leaderboard: leaderboardResult.Items,
    });
  } catch (error) {
    return sendError(400, {
      success: false,
      error: error.message,
      message: 'Could not save your score.',
    });
  }
};
