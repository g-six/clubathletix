import { createSession } from '@/models/session'
import { prisma } from '@/prisma'
import { cookies } from 'next/headers'
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const cookieStore = await cookies()
    const { id: organization_id } = await params
    const user_id = cookieStore.get('user_id')?.value
    if (user_id) {
        const session = await createSession(user_id)
        if (session && session.user_id) {
            const userOrganization = await prisma.userOrganization.findFirst({
                where: {
                    user_id,
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
    }

    return Response.json({
        success: false,

    }, {
        status: 401
    })
}