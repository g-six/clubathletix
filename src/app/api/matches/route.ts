import { createMatch } from '@/models/match'
import { createSession } from '@/models/session'
import { prisma } from '@/prisma'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
    const cookieStore = await cookies()
    const user_id = cookieStore.get('user_id')?.value
    if (user_id) {
        const session = await createSession(user_id)
        const payload = await request.json()

        if (session) {
            const match = await createMatch({
                ...payload,
                created_by: session.user_id
            })
            return Response.json(match)
        }
    }

    return Response.json({
        error: 'Unauthorized',
    })
}