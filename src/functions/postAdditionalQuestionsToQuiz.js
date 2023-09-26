const middy = require('@middy/core');
const { nanoid } = require('nanoid');

const { db } = require('../services/index');
const { validateToken } = require('../middleware/validateToken');
const { sendResponse, sendError } = require('../responses/index');

const handler = middy(async (event) => {
  try {
    const requestBody = JSON.parse(event.body);
    const { questions } = requestBody;

    const userId = event.userId;
    const quizId = event.pathParameters.quizId;

    const quizParams = {
      TableName: process.env.DYNAMODB_QUIZ_TABLE,
      KeyConditionExpression: 'quizId = :quizId',
      ExpressionAttributeValues: {
        ':quizId': quizId,
      },
    };

    const quiz = await db.query(quizParams).promise();

    if (quizResult.Count === 0) {
      return sendError(404, {
        success: false,
        message: 'Quiz not found.',
      });
    }

    if (quiz.Items[0].creatorId !== userId) {
      return sendError(403, {
        success: false,
        message: 'Access denied. You do not have permission to edit this quiz.',
      });
    }

    const questionParams = {
      RequestItems: {
        [process.env.DYNAMODB_QUESTION_TABLE]: questions.map((question) => ({
          PutRequest: {
            Item: {
              questionId: nanoid(3),
              quizId: quizId,
              questionText: question.questionText,
              answer: question.answer,
              latitude: question.latitude,
              longitude: question.longitude,
            },
          },
        })),
      },
    };

    const questionsResult = await db.batchWrite(questionParams).promise();

    if (questionsResult.UnprocessedItems.roomDb) {
      return sendError(500, { success: false, message: 'All questions could not be saved.' });
    }

    return sendResponse(200, {
      success: true,
      message: `Questions successfully added to quiz ${quiz.Items[0].quizName}.`,
    });
  } catch (error) {
    return sendError(400, {
      success: false,
      error: error.message,
      message: 'Could not add your questions.',
    });
  }
}).use(validateToken);

module.exports = { handler };
