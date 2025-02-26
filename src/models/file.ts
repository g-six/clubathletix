import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'


export async function getPresignedUrlWithClient(Key: string, method: 'GET' | 'PUT' | 'DELETE') {
    const { AWS_REGION: region, AWS_ACCESS_KEY_ID: accessKeyId, AWS_SECRET_ACCESS_KEY: secretAccessKey, AWS_BUCKET: Bucket } = process.env as {
        [k: string]: string
    }
    const client = new S3Client({ region, credentials: { accessKeyId, secretAccessKey } })
    let command = new GetObjectCommand({ Bucket, Key })
    if (method === 'PUT') command = new PutObjectCommand({ Bucket, Key })
    if (method === 'DELETE') command = new DeleteObjectCommand({ Bucket, Key })
    return getSignedUrl(client, command, { expiresIn: 3600 })
}