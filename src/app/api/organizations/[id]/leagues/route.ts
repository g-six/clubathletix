import { findLeagues } from '@/models/league'
import { createSession } from '@/models/session'
import { prisma } from '@/prisma'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id: organization_id } = await params

    const created_by = request.cookies.get('user_id')?.value

    if (created_by) {

        const leagues = await prisma.league.findMany({
            where: {
                organization_id,
            },
        })
        return Response.json(leagues)
    }

    return Response.json([], {
        status: 401
    })
}