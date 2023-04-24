import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

export class Attachment {

  constructor(
    private readonly client = new XAWS.S3({
      signatureVersion: 'v4'
    })
  ) {
  }

  public async getPresignedUrl(key: string) {
    return this.client.getSignedUrl('putObject', {
      Bucket: process.env.ATTACHMENT_S3_BUCKET,
      Key: key,
      Expires: process.env.SIGNED_URL_EXPIRATION,
    });
  }

}
