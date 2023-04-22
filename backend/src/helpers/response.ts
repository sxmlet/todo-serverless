import { APIGatewayProxyResult } from 'aws-lambda'

type header = {
  [header: string]: boolean | number | string;
}

export const RESPONSE_CREATED = 201;
export const RESPONSE_SUCCESS = 200;

export function newAPIGatewayProxyResult(body: string, headers: header = {}, statusCode: number = RESPONSE_SUCCESS): APIGatewayProxyResult {
  return {
    statusCode: statusCode,
    body: body,
    headers: headers
  }
}