import { prisma } from '@/prisma'
import { Match, Prisma } from '@prisma/client'
import { getAuthForOperation } from './auth'

export async function createMatch(payload: unknown) {
    const {
        team_id,
        organization_id,
        league_id,
        match_date,
        opponent,
        location,
        home_or_away,
        created_by,
    } = payload as unknown as {
        [k: string]: string
    }
    try {
        return await prisma.match.create({
            data: {
                organization_id,
                league_id,
                team_id,
                opponent,
                match_date,
                home_or_away,
                created_by,
                location,
            }
        })
    } catch (error) {
        console.log(error)
        console.log('error')
    }
}

export async function updateMatch({ match_id, ...payload }: Match) {
    if (!match_id) throw new Error('Missing match id')
    if (!payload.updated_by) throw new Error('Missing updated by')
    try {
        return await prisma.match.update({
            where: {
                match_id,
            },
            data: payload
        })
    } catch (error) {
        console.log(error)
        console.log('error')
    }
}

export async function getMatch(match_id: string) {
    try {
        const session = await getAuthForOperation()
        if (!session?.user_id) return
        return await prisma.match.findUnique({
            where: {
                match_id,
            },
            include: {
                team: {
                    select: {
                        name: true,
                        age_group: true,
                        division: true,
                        logo: true,
                        players: {
                            select: {
                                player_id: true,
                                jersey_number: true,
                                position: true,
                                player: {
                                    select: {
                                        first_name: true,
                                        last_name: true,
                                    }
                                }
                            }
                        },

                        members: session.user_id ? {
                            where: {
                                user_id: session.user_id
                            },
                            select: {
                                role: true,
                                user_id: true,
                                user: {
                                    select: {
                                        first_name: true,
                                        last_name: true,
                                        email: true,
                                        phone: true,
                                    }
                                }

                            }
                        } : false,
                    }
                },
                events: {
                    select: {
                        match_event_id: true,
                        event_type: true,
                        player_id: true,
                        video_url: true,
                        logged_at: true,
                    }
                },
                league: {
                    select: {
                        name: true,
                    }
                }
            }
        })
    } catch (error) {
        console.log(error)
        console.log('Error in models/match.ts:getMatch')
    }
}

export async function getMatchesByOrganizationId(organization_id: string, limit = 3) {
    const matches = await prisma.match.findMany({
        where: {
            organization_id,
        },
        take: limit,
        orderBy: {
            match_date: 'desc',
        }
    })

    return matches
}

export type CreateMatch = Prisma.Args<typeof prisma.match, 'create'>['data']