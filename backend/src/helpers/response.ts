import { APIGatewayProxyResult } from 'aws-lambda'

type header = {
  [header: string]: boolean | number | string;
}

export const RESPONSE_SUCCESS = 200;
export const RESPONSE_CREATED = 201;
export const RESPONSE_BAD_REQUEST = 400;
export const RESPONSE_INTERNAL_SERVER_ERROR = 500;

export function newAPIGatewayProxyResult(body: {[key: string]: any}, statusCode: number = RESPONSE_SUCCESS, headers: header = {}): APIGatewayProxyResult {
  return {
    statusCode: statusCode,
    body: JSON.stringify(body),
    headers: headers
  }
}