import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodosForUser as getTodosForUser } from '../../helpers/todos'
import { getUserId } from '../utils';
import { newAPIGatewayProxyResult } from '../../helpers/response'
import { HttpError } from 'http-errors'


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todos = await getTodosForUser(getUserId(event))
      return newAPIGatewayProxyResult(JSON.stringify({items:todos}));
    } catch (e) {
      const err = e as HttpError;
      return newAPIGatewayProxyResult(JSON.stringify({
        error: {
          message: err.message,
        }
      }), {}, err.statusCode);
    }
  });

handler.use(
  cors({
    credentials: true
  })
)
