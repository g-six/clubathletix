import { createOrganization } from '@/models/organization'
import { createSession } from '@/models/session'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { cookies } from 'next/headers'

const createPresignedUrlWithClient = ({ Key }: { [k: string]: string }) => {
    const { AWS_ACCESS_KEY_ID: accessKeyId, AWS_SECRET_ACCESS_KEY: secretAccessKey, AWS_REGION: region, AWS_BUCKET: Bucket } = process.env as {
        [k: string]: string
    }
    const client = new S3Client({ region, credentials: { accessKeyId, secretAccessKey } })
    const command = new PutObjectCommand({ Bucket, Key })
    return getSignedUrl(client, command, { expiresIn: 3600 })
}
export async function POST(request: Request) {
    const cookieStore = await cookies()
    const created_by = cookieStore.get('user_id')?.value
    const payload = await request.json()
    let logo: string | undefined = undefined
    if (created_by) {
        const session = await createSession(created_by)
        if (payload.name) {
            const { logo: sourceLogo, ...args } = payload
            if (sourceLogo) {
                try {
                    const imageType = sourceLogo.split(';')[0].replace('data:', '')
                    const buf = Buffer.from(sourceLogo.replace(/^data:image\/\w+;base64,/, ""), 'base64')
                    const Key = `${args.short_name}-${Date.now()}.${imageType.split('/')[1].toLowerCase()}`

                    const putObjCommandUrl = await createPresignedUrlWithClient({ Key })

                    const uploaded = await fetch(putObjCommandUrl, {
                        method: 'PUT',
                        body: buf,
                        headers: {
                            'Content-Encoding': 'base64',
                            'Content-Type': imageType
                        }
                    })

                    if (uploaded.ok) {
                        logo = Key
                    }

                } catch (error) {
                    console.log('Error in logo')
                }
            }
            const organization = await createOrganization({
                ...args,
                logo,
                created_by,
            })
            return Response.json({
                success: true,
                ...organization
            }, {
                status: 201
            })
        }
        return Response.json({
            success: false,
            session,
            payload
        }, {
            status: 400
        })

    }
    return Response.json({
        error: 'Unauthorized'
    }, {
        status: 401
    })
}