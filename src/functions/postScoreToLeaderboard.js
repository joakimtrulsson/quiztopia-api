const middy = require('@middy/core');
const validator = require('@middy/validator');
const { transpileSchema } = require('@middy/validator/transpile');
const httpJsonBodyParser = require('@middy/http-json-body-parser');
const httpErrorHandler = require('@middy/http-error-handler');
const httpHeaderNormalizer = require('@middy/http-header-normalizer');

const { db } = require('../services/index');
const { validateToken } = require('../middleware/validateToken');
const { sendResponse, sendError } = require('../responses/index');
const { checkIfQuizExists } = require('../utilities/quizUtils');
const schema = require('../schemas/postScoreSchema.json');

const handler = middy(async (event) => {
  try {
    const quizId = event.pathParameters.quizId;
    const requestBody = event.body;
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
})
  .use(validateToken)
  .use(httpHeaderNormalizer())
  .use(httpJsonBodyParser())
  .use(
    validator({
      eventSchema: transpileSchema(schema),
    })
  )
  .use(httpErrorHandler());

module.exports = { handler };
