import { getPresignedUrlWithClient } from '@/models/file'
import { updateMatchEvent } from '@/models/match-event'
import { headers } from 'next/headers'
import { NextRequest } from 'next/server'

export async function PATCH(request: NextRequest, { params }: {
    params: Promise<{ match_id: string }>
}) {
    const match_event_id = await request.headers.get('x-match-event-id')
    const upload_link = await request.headers.get('x-upload-link')
    const video_url = await request.headers.get('x-file-name')
    const content = await request.blob()

    if (match_event_id && video_url && upload_link) {
        const r = await fetch(upload_link, {
            body: content,
            method: 'PUT',
        })
        if (r.ok) {
            const record = await updateMatchEvent(match_event_id, { video_url })
            console.log('updated')
            return Response.json({
                message: 'Video uploaded successfully',
                record,
            })
        }
    }
    return Response.json({
        message: 'Failed to upload video',
    }, { status: 400 })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ match_id: string }> }) {
    const { match_id } = await params
    const { title, extension } = await request.json()
    // Remove all non-alphanumeric characters from the title to create a unique, consistent key,
    // except for dashes ("-", which are allowed)
    const Key = [
        'videos/matches',
        match_id,
        title.split(' ').join('-').toLowerCase().replace(/[^a-zA-Z0-9-]/g, '')
    ].join('/') + `.${extension}`
    const upload_link = await getPresignedUrlWithClient(Key, 'PUT')

    return Response.json({ match_id, upload_link, Key })
}