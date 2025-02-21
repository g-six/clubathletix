import { createSession } from '@/models/session'
import { createTraining } from '@/models/training'
import { prisma } from '@/prisma'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
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
                    phone: true,
                    timezone: true,
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

    const payload = await request.json()
    const match = await createTraining({
        ...payload,
        created_by: session.user_id
    })
    return Response.json(match)
}