import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl, updateTodo } from '../../helpers/todos'
import { getUserId } from '../utils'
import { newAPIGatewayProxyResult } from '../../helpers/response'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;
    const uid = getUserId(event);
    const objectKey = todoId+uid;
    const url = await createAttachmentPresignedUrl(objectKey)
    await updateTodo(uid, todoId, {
      attachmentUrl: `https://${process.env.ATTACHMENT_S3_BUCKET}.s3.amazonaws.com/${objectKey}`
    })
    
    return newAPIGatewayProxyResult(JSON.stringify({
      uploadUrl: url,
    }), {})
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
