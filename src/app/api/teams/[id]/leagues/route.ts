import { createSession } from '@/models/session'
import { prisma } from '@/prisma'
import { cookies } from 'next/headers'
import { getTeam } from '@/models/team'
import { NextRequest } from 'next/server'


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id: team_id } = await params
    const cookieStore = await cookies()
    const session_id = cookieStore.get('session_id')?.value
    let [session, team] = await Promise.all([prisma.session.findUnique({
        where: {
            session_id
        },
        include: {
            user: {
                select: {
                    first_name: true,
                    last_name: true,
                    email: true,
                    phone: true
                }
            }
        }
    }), getTeam(team_id)])

    if (session?.user_id) {
        session = await createSession(session?.user_id)
    }


    return Response.json(team)
}