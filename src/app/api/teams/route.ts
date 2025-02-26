import { createSession } from '@/models/session'
import { createTeam } from '@/models/team'
import { prisma } from '@/prisma'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
    const cookieStore = await cookies()
    const created_by = cookieStore.get('user_id')?.value
    if (!created_by) return Response.json({
        user_id: created_by
    }, {
        status: 401
    })
    const session = await createSession(created_by)

    if (!session) return Response.json({
        created_by
    }, {
        status: 401
    })

    const payload = await request.json()

    const team = await createTeam({
        ...payload,
        created_by
    })

    if (team) {
        return Response.json(team, { status: 201 })
    }


    return Response.json({ session, payload }, { status: 400 })
}