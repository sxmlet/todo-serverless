import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../businessLogic/todos';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { newAPIGatewayProxyResult } from '../../helpers/response'
import { HttpError } from 'http-errors'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    const uid = getUserId(event);
    try {
      const updated = await updateTodo(uid, todoId, updatedTodo)
      return newAPIGatewayProxyResult(updated);
    } catch (e) {
      const err = e as HttpError;
      return newAPIGatewayProxyResult({
        error: {
          message: err.message,
        }
      }, err.statusCode);
    }
  });

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
