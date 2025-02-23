import { createMatch } from '@/models/match'
import { createMatchEvent } from '@/models/match-event'
import { createSession } from '@/models/session'
import { prisma } from '@/prisma'
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
    const cookieStore = await cookies()
    const { match_id } = await params
    const session_id = cookieStore.get('session_id')?.value || ''
    const user_id = cookieStore.get('user_id')?.value || ''
    if (user_id) {
        const session = await createSession(user_id)
        if (session && session_id && session_id !== session.session_id) {
            const payload = await request.json()
            const match = await createMatchEvent({
                match_id,
                event_type: 'goal',
                ...payload,
            })
            return Response.json(match)
        }
    }

    return Response.json({
        error: 'Unauthorized',
    })
}