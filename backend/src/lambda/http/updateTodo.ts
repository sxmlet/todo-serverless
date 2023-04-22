import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../helpers/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { newAPIGatewayProxyResult } from '../../helpers/response'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    const uid = getUserId(event);
    const updated = await updateTodo(uid, todoId, updatedTodo)

    return newAPIGatewayProxyResult(JSON.stringify(updated));
  });

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
