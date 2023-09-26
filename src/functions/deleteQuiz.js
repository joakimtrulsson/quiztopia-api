const middy = require('@middy/core');

const { validateToken } = require('../middleware/validateToken');
const { sendResponse, sendError } = require('../responses/index');
const { db } = require('../services/index');

const handler = middy(async (event, context) => {
  try {
    const quizId = event.pathParameters.quizId;

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

    const deleteQuiz = {
      TableName: process.env.DYNAMODB_QUIZ_TABLE,
      Key: {
        quizId: quizId,
      },
    };

    await db.delete(deleteQuiz).promise();

    const questionParams = {
      TableName: process.env.DYNAMODB_QUESTION_TABLE,
      IndexName: process.env.DYNAMODB_QUESTION_INDEX,
      KeyConditionExpression: 'quizId = :quizId',
      ExpressionAttributeValues: {
        ':quizId': quizId,
      },
    };

    const allQuestionResult = await db.query(questionParams).promise();

    if (allQuestionResult.Count === 0) {
      return sendError(404, {
        success: false,
        message: 'Questions not found.',
      });
    }

    const questions = allQuestionResult.Items;

    const deletePromises = questions.map(async (question) => {
      const deleteParams = {
        TableName: process.env.DYNAMODB_QUESTION_TABLE,
        Key: {
          questionId: question.questionId,
        },
      };

      try {
        await db.delete(deleteParams).promise();
      } catch (error) {
        return sendError(500, {
          success: false,
          error: error.message,
          message: 'Could not delete questions.',
        });
      }
    });

    await Promise.all(deletePromises);

    return sendResponse(200, {
      success: true,
      message: `The quiz '${quizResult.Items[0].quizName}' (ID: ${quizResult.Items[0].quizId}) has been deleted.`,
    });
  } catch (error) {
    return sendError(500, {
      success: false,
      error: error.message,
      message: 'Could not delete quiz and questions.',
    });
  }
}).use(validateToken);

module.exports = { handler };
