import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodosForUser as getTodosForUser } from '../../helpers/todos'
import { getUserId } from '../utils';
import { newAPIGatewayProxyResult } from '../../helpers/response'


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todos = await getTodosForUser(getUserId(event))
    return newAPIGatewayProxyResult(JSON.stringify({items:todos}));
  });

handler.use(
  cors({
    credentials: true
  })
)
