import { getAuthForOperation } from '@/models/auth'
import { createSession } from '@/models/session'
import { createTeam } from '@/models/team'
import { prisma } from '@/prisma'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
    const session = await getAuthForOperation()

    if (!session.user_id) return Response.json({
        error: 'User is not authorized'
    }, {
        status: 401
    })

    const payload = await request.json()

    const team = await createTeam({
        ...payload,
        created_by: session.user_id,
    })

    if (team) {
        return Response.json(team, { status: 201 })
    }


    return Response.json({ session, payload }, { status: 400 })
}