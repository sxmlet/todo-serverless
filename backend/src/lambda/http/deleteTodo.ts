import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo } from '../../helpers/todos';
import { getUserId } from '../utils'
import { newAPIGatewayProxyResult } from '../../helpers/response';
import { HttpError } from 'http-errors'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event);
    try {
      await deleteTodo(userId, todoId)
      return newAPIGatewayProxyResult({
        id: todoId,
      });
    } catch (e) {
      const err = e as HttpError;
      return newAPIGatewayProxyResult({
        error: {
          message: err.message,
        }
      },  err.statusCode);
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
