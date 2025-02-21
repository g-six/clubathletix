import { createMatch } from '@/models/match'
import { createSession } from '@/models/session'
import { prisma } from '@/prisma'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id: organization_id } = await params
    const cookieStore = await cookies()
    const session_id = cookieStore.get('session_id')?.value
    let session = await prisma.session.findUnique({
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
    })

    if (session?.user?.user_id) {
        const new_session = await createSession(session?.user.user_id)
        session = {
            ...session,
            ...new_session
        }
    }

    const leagues = await prisma.league.findMany({
        where: {
            organization_id,
        },
    })
    return Response.json(leagues)
}