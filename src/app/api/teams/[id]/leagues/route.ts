import { createSession } from '@/models/session'
import { cookies } from 'next/headers'
import { getTeam } from '@/models/team'
import { NextRequest } from 'next/server'


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id: team_id } = await params
    const cookieStore = await cookies()
    const created_by = cookieStore.get('user_id')?.value

    if (created_by) {
        const session = await createSession(created_by)
        await getTeam(team_id)
        return Response.json({
            team_id,
            session
        }, {
            status: 200
        })
    } else {
        return Response.json({
            error: 'Unauthorized'
        }, {
            status: 401
        })
    }


}