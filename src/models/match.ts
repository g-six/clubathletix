import { prisma } from '@/prisma'
import { Prisma } from '@prisma/client'

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
    } = payload as CreateMatch

    try {
        return await prisma.match.create({
            data: {
                team_id,
                organization_id,
                league_id,
                opponent,
                location,
                match_date,
                home_or_away,
                created_by,
            }
        })
    } catch (error) {
        console.log('error')
    }
}

export async function getMatch(match_id: string) {
    try {
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
                        }
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

export type CreateMatch = Prisma.Args<typeof prisma.Match, 'create'>['data']