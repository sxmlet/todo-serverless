import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'
import { createTodo } from '../../helpers/todos'
import { newAPIGatewayProxyResult, RESPONSE_CREATED } from '../../helpers/response'
import { TodoItem } from '../../models/TodoItem.js'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const userId: string = getUserId(event)
    let todo: TodoItem;
    try {
      todo = await createTodo(userId, newTodo)
    } catch (e) {
      return newAPIGatewayProxyResult(JSON.stringify({
        error: {
          message: e,
        }
      }));
    }

    return newAPIGatewayProxyResult(JSON.stringify(todo), {}, RESPONSE_CREATED)
  }
)

handler.use(
  cors({
    credentials: true
  })
)
