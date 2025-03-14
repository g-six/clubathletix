import { getAuthForOperation } from '@/models/auth'
import { SessionTeam } from '@/typings/team'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id: organization_id } = await params
    const session = await getAuthForOperation()
    const created_by = session.user_id

    if (created_by) {
        if (session?.user_id) {
            const teams = session.team_members.filter((membership: { team: SessionTeam }) => membership.team.organization_id === organization_id).map((membership: { team: SessionTeam }) => membership.team)

            return Response.json(teams)
        }
    }

    return Response.json([], {
        status: 401
    })
}