import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'
import { createTodo } from '../../helpers/todos'
import { newAPIGatewayProxyResult, RESPONSE_BAD_REQUEST, RESPONSE_CREATED } from '../../helpers/response'
import { TodoItem } from '../../models/TodoItem.js'
import { type HttpError } from 'http-errors'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const result = validateBody(newTodo);
    if (result !== null) {
      return result;
    }

    const userId: string = getUserId(event)
    try {
      const todo: TodoItem = await createTodo(userId, newTodo)
      return newAPIGatewayProxyResult(todo, RESPONSE_CREATED)
    } catch (e) {
      const err = e as HttpError;
      return newAPIGatewayProxyResult({
        error: {
          message: err.message,
        }
      }, err.statusCode);
    }
  }
)

function validateBody(body: CreateTodoRequest): APIGatewayProxyResult|null {
  if (body.name == '') {
    return newAPIGatewayProxyResult({
      error: { message: 'name should not be empty'}
    }, RESPONSE_BAD_REQUEST);
  }

  if (body.dueDate == '') {
    return newAPIGatewayProxyResult({
      error: { message: 'dueDate should not be empty'}
    }, RESPONSE_BAD_REQUEST);
  }

  if (Number(body.dueDate) < Date.now()) {
    return newAPIGatewayProxyResult({
      error: { message: 'dueDate should be higher than current date'}
    }, RESPONSE_BAD_REQUEST);
  }
  return null;
}

handler.use(
  cors({
    credentials: true
  })
)
