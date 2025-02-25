import { createSession } from '@/models/session'
import { prisma } from '@/prisma'
import { cookies } from 'next/headers'
export async function POST(request: Request) {
    const cookieStore = await cookies()
    const session_id = cookieStore.get('user_id')?.value
    const session = createSession(session_id)

    return Response.json({
        success: false,
        session
    })
}