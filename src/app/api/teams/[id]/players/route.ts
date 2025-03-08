import { auth } from '@/auth'
import { createEmailNotification, TEAM_INVITATION_TEMPLATE } from '@/models/notifications'
import { addPlayerParent } from '@/models/player-parent'
import { getUserByEmail } from '@/models/user'
import { prisma } from '@/prisma'
import { Prisma } from '@prisma/client'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const team_id = (await params).id
    if (!team_id) return Response.json({
        message: 'Invalid team id'
    }, { status: 400 })

    const session = await auth()
    if (!session?.user?.email) return Response.json({
        message: 'Unauthorized'
    }, { status: 401 })

    const user = await getUserByEmail(session.user.email)
    if (!user) return Response.json({
        message: 'Unauthorized'
    }, { status: 401 })

    const { team_members: member_of, user_id: created_by } = user
    const teamMembership = member_of.find((m) => m.team_id === team_id)
    // if (!created_by || user?.role !== 'admin') return Response.json({
    //     message: 'Unauthorized'
    // }, { status: 401 })
    const payload = await req.json()
    if (teamMembership?.organization_id
        && ['owner', 'coach', 'admin', 'assistant coach'].includes(
            teamMembership.role
        )) {
        const input: Prisma.TeamPlayerUncheckedCreateInput = {
            team_id: payload.team_id,
            player_id: payload.player_id,
            position: payload.position,
            jersey_number: payload.jersey_number,
            organization_id: teamMembership.organization_id,
            created_by,
        }
        const teamPlayer = await prisma.teamPlayer.create({
            data: input
        })
        const team = await prisma.team.findUnique({
            where: {
                team_id: payload.team_id
            },
            select: {
                name: true,
                division: true,
                age_group: true,
            }
        })

        if (payload.parent && payload.relationship) {
            const playerParent = await addPlayerParent(payload.parent, payload.player_id)
            if (!playerParent) return Response.json({
                message: 'Invalid parent id'
            }, { status: 400 })
        }

        const added = await prisma.teamPlayer.findUnique({
            where: {
                team_player_id: teamPlayer.team_player_id,
            },
            select: {
                player: {
                    select: {
                        first_name: true,
                        user: {
                            select: {
                                first_name: true,
                                last_name: true,
                                email: true,
                            }
                        },
                        parents: {
                            select: {
                                relationship: true,
                                user: {
                                    select: {
                                        first_name: true,
                                        last_name: true,
                                        email: true,
                                    }
                                }
                            }
                        }
                    }
                },
            }
        })
        if (!added) return Response.json({
            message: 'Invalid player id'
        }, { status: 400 })


        const receivers: {
            name: string
            email: string
        }[] = []

        if (added?.player?.user) {
            receivers.push({
                name: added?.player?.user?.first_name,
                email: added?.player?.user?.email,
            })
        } else {
            added?.player?.parents?.forEach((parent) => {
                if (parent?.user) {
                    receivers.push({
                        name: parent.user.first_name as string,
                        email: parent.user?.email as string,
                    })
                }
            })
        }
        const mails = await Promise.all(receivers.map((receiver) => {
            return createEmailNotification({
                sender: {
                    name: user.first_name,
                    email: user.email,
                },
                receiver,
                TemplateId: TEAM_INVITATION_TEMPLATE,
                TemplateModel: {
                    sender: user.first_name,
                    name: receiver.name,
                    who: added?.player?.user?.first_name || 'you',
                    track_who: added?.player?.user?.first_name ? 'your' : `${added?.player.first_name || 'your child'}'s`,
                    team: team?.name || 'a team',
                    domain: 'ClubAthletix',
                }
            })
        }))

        return Response.json({
            teamPlayer,
            added,
            mails
        }, {
            status: 200
        })
    }

    return Response.json({
        ...payload,
        teamMembership,
        created_by,
        team_id
    }, {
        status: 200
    })
}