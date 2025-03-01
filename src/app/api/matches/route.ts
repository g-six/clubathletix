import { auth } from '@/auth'
import { createMatch } from '@/models/match'
import { createSession } from '@/models/session'
import { prisma } from '@/prisma'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
    const cookieStore = await cookies()
    const session = await auth()
    if (session?.user?.email) {
        const user = await prisma.user.findUnique({
            where: {
                email: session.user.email
            },
            select: {
                user_id: true
            }
        })
        if (user?.user_id) {
            const payload = await request.json()

            if (session) {
                const match = await createMatch({
                    ...payload,
                    organization_id: cookieStore.get('organization_id')?.value,
                    created_by: user.user_id
                })
                return Response.json(match)
            }
        }


    }


    return Response.json({
        error: 'Unauthorized',
    }, {
        status: 401
    })
}