const { sendResponse, sendError } = require('../responses/index');
const { db } = require('../services/index');

exports.handler = async (event, context) => {
  try {
    const quizId = event.pathParameters.quizId;
    console.log(quizId);

    const quizParams = {
      TableName: process.env.DYNAMODB_QUIZ_TABLE,
      KeyConditionExpression: 'quizId = :quizId',
      ExpressionAttributeValues: {
        ':quizId': quizId,
      },
    };

    const quizResult = await db.query(quizParams).promise();
    console.log(quizResult);

    if (quizResult.Count === 0) {
      return sendError(404, {
        success: false,
        message: 'Quiz not found.',
      });
    }

    const quiz = quizResult.Items[0];

    const questionParams = {
      TableName: process.env.DYNAMODB_QUESTION_TABLE,
      IndexName: process.env.DYNAMODB_QUESTION_INDEX,
      KeyConditionExpression: 'quizId = :quizId',
      ExpressionAttributeValues: {
        ':quizId': quizId,
      },
    };

    const questionResult = await db.query(questionParams).promise();

    const questions = questionResult.Items;

    return sendResponse(200, {
      success: true,
      message: 'Quiz and questions retrieved successfully.',
      quiz,
      questions,
    });
  } catch (error) {
    return sendError(500, {
      success: false,
      error: error.message,
      message: 'Could not retrieve quiz and questions.',
    });
  }
};
