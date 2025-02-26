import { findLeagues } from '@/models/league'
import { createSession } from '@/models/session'
import { prisma } from '@/prisma'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id: organization_id } = await params

    const created_by = request.cookies.get('user_id')?.value

    if (created_by) {
        const session = await createSession(created_by)
        if (session?.user_id) {
            const teams = await prisma.team.findMany({
                where: {
                    organization_id,
                },
            })

            return Response.json(teams)
        }
    }

    return Response.json([], {
        status: 401
    })
}