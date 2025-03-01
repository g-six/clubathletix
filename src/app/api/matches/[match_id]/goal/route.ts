import { getAuthForOperation } from '@/models/auth'
import { createMatchEvent } from '@/models/match-event'
import { createSession } from '@/models/session'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ match_id: string }> }) {
    const cookieStore = await cookies()
    let session = await createSession(cookieStore.get('user_id')?.value || '')
    const { match_id } = await params
    return Response.json({
        match_id,
        session,
    })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ match_id: string }> }) {
    const session = await getAuthForOperation()
    const { match_id } = await params


    if (session?.user_id) {
        const payload = await request.json()
        const match = await createMatchEvent({
            match_id,
            event_type: 'goal',
            ...payload,
        })
        return Response.json(match)
    }

    return Response.json({
        error: 'Unauthorized',
    }, { status: 401 })
}