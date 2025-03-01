import { getPresignedUrlWithClient } from '@/models/file'

export async function GET(req: Request, { params }: { params: Promise<{ segments: string[] }> }) {
    const { segments } = await params
    const url = await getPresignedUrlWithClient(segments.join('/'), 'GET')
    console.log({ url })
    return await fetch(url)
}