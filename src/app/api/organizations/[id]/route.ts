import { createSession } from '@/models/session'
import { prisma } from '@/prisma'
import { cookies } from 'next/headers'
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const cookieStore = await cookies()
    const { id: organization_id } = await params
    const session_id = cookieStore.get('session_id')?.value
    if (!session_id) return Response.json({
        success: false,
        message: 'Unauthorized',
        statusCode: 401
    })
    if (!organization_id) return Response.json({
        success: false,
        message: 'Invalid organization ID',
        statusCode: 400
    })

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

    const userOrganization = await prisma.userOrganization.findFirst({
        where: {
            user_id: session.user_id,
            organization_id,
        },
        select: {
            role: true
        }
    })

    if (userOrganization?.role) {
        cookieStore.set({
            name: 'organization_id',
            value: organization_id,
            path: '/',
        })
    }

    return Response.json({
        success: false,
        session,
        userOrganization,
        ...request,
    })
}