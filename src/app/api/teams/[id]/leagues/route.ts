import { createSession } from '@/models/session'
import { cookies } from 'next/headers'
import { getTeam } from '@/models/team'
import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/prisma'


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (session?.user?.email) {
        const { id: team_id } = await params

        const user = await prisma.user.findUnique({
            where: {
                email: session.user.email
            },
            select: {
                user_id: true,
                team_members: {
                    select: {
                        team: {
                            select: {
                                team_id: true,
                                name: true,
                                division: true,
                                age_group: true,
                                league_id: true,
                                league: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })


        if (user) {
            let created_by = user.user_id
            const memberTeam = user.team_members.find(m => m.team?.team_id === team_id)

            return Response.json({
                team_id,
                league_id: memberTeam?.team.league_id,
                session
            }, {
                status: 200
            })
        }
    }

    return Response.json({
        error: 'Unauthorized'
    }, {
        status: 401
    })


}