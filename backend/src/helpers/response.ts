import { APIGatewayProxyResult } from 'aws-lambda'

type header = {
  [header: string]: boolean | number | string;
}

export const RESPONSE_CREATED = 201;

export function newAPIGatewayProxyResult(body: string, headers: header = {}, statusCode: number = 200): APIGatewayProxyResult {
  return {
    statusCode: statusCode,
    body: body,
    headers: headers
  }
}