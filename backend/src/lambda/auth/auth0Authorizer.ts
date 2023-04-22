import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import { JWK } from '../../auth/JWK.js'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-d2mjz3ehsqoecv3g.us.auth0.com/.well-known/jwks.json';

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader);
  const jwt: Jwt = decode(token, { complete: true }) as Jwt;

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  const keys = await getKeys();
  const key = keys.filter(k => {
    return k.kid === jwt.header.kid;
  });
  const cert = key[0]['x5c'][0];
  console.log(cert);
  const cert2 = '-----BEGIN CERTIFICATE-----\n' +
    'MIIDHTCCAgWgAwIBAgIJCnrfnpn1qpV3MA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV\n' +
    'BAMTIWRldi1kMm1qejNlaHNxb2VjdjNnLnVzLmF1dGgwLmNvbTAeFw0yMzA0MTcx\n' +
    'OTU4NDFaFw0zNjEyMjQxOTU4NDFaMCwxKjAoBgNVBAMTIWRldi1kMm1qejNlaHNx\n' +
    'b2VjdjNnLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC\n' +
    'ggEBAKE4SrA8TM3iR212eELN70zSm+7E8Qj4yNiBdvGS+Z/yi5nGfe63BYCUai24\n' +
    'S6nX1rWIGU3iIvdOLW7r6/Oj1+rnWIqEJHFgxcN0r8paSCWgQRjImMDFffu0vTAT\n' +
    '0sB9ZXyHWiWL3wsZg5X91US23cYaw25eZh/QmB/KT3+yvRUD2CvyMoneVEOApeWm\n' +
    '5ECU+ZsQnZ9uwObQnOE55PN5oHb+42wkZZXP0NSQZKKtKGzGNiryOwHeXC9laWMw\n' +
    'Lvnlv63C7JI4JpAH+eghufzGCWFtIzwW2bPHYEZ5FadkZGAd5bl5Ou7vLHZnwc56\n' +
    '0C7vtGKNifxkoZUKpM1Z48GY+KECAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd\n' +
    'BgNVHQ4EFgQU4rFCMmP1qUgtHzU8YS43aYAQDwgwDgYDVR0PAQH/BAQDAgKEMA0G\n' +
    'CSqGSIb3DQEBCwUAA4IBAQAeZVUNsRhMEFqdfo3KQoftEZ7v+jbz9VSbw+14hKEu\n' +
    'AqmAoBQZIDpeQu1B9bJ6W/GAL+ZiOsf9sftQUXyWoRUHobN3b0QLmhnrijtGXvWA\n' +
    'v5jIJ56Lfz4OIR5FmG90LJM3wwm5INA41zdzoRb7e8MvG70KZzSlbV/VeGhl0ils\n' +
    'BxNTdz5Sw6LBH/kFUAnObtYD/DcQHwdwzxubjTXp13IU/5hkzxkmtinEGWH/LTL8\n' +
    'Kwzn/pd333Mpg/vM+bradvisfee3+LNAT+610WmNez3B1qTBHuSub+MiruBc7Kxg\n' +
    'sp596rGq0CYNPO6Orzylxcpyq1tziExq26B5atV11LrC\n' +
    '-----END CERTIFICATE-----'
  return verify(token, cert2, { algorithms: ['RS256'] }) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

async function getKeys(): Promise<JWK[]>{
  const resp = await Axios.get(jwksUrl, {});
  return resp.data.keys;
}
