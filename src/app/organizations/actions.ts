import { prisma } from '@/prisma'
import { cookies } from 'next/headers'

export async function list() {
    const cookiesList = await cookies()
    const session_id = cookiesList.get('session_id')?.value || ''
    const session = await prisma.session.findUnique({
        where: {
            session_id
        },
        include: {
            user: {
                select: {
                    user_id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    phone: true,
                    role: true,
                }
            },
        }
    })

    console.log({ session_id, session })

    return {
        success: session !== null,
        ...session
    }
}