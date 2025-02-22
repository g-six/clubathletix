import { prisma } from '@/prisma'
import bcrypt from 'bcryptjs'
import { createSession } from '@/models/session'
import { cookies } from 'next/headers'

export async function DELETE(request: Request) {
    const cookieStore = await cookies()
    const session_id = cookieStore.get('session_id')?.value || ''
    if (session_id) {
        await prisma.session.delete({
            where: {
                session_id
            }
        })
    }
    for (const pair of cookieStore.getAll()) {
        if (pair.name !== 'organization_id') {
            cookieStore.delete(pair)
        }
    }

    return Response.json({
        success: true,
    })
}