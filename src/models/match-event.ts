import { prisma } from '@/prisma'
import { MatchEvent, Prisma } from '@prisma/client'
import { getAuthForOperation } from './auth'

export async function createMatchEvent(payload: unknown) {
    const session = await getAuthForOperation()
    if (!session?.user_id) return

    const created_by = session.user_id
    const {
        match_id,
        player_id,
        event_type,
        logged_at,
    } = payload as CreateMatchEvent
    const data = {
        match_id,
        player_id,
        event_type,
        logged_at,
        created_by,
    } as unknown
    try {
        return await prisma.matchEvent.create({
            data: data as Prisma.MatchEventCreateInput
        })
    } catch (error) {
        console.log('createMatchEvent error', JSON.stringify(data, null, 2))
    }
}

export async function getMatchEvents(match_id: string) {
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

export async function updateMatchEvent(match_event_id: string, updates: Prisma.MatchEventUpdateInput) {
    try {
        const matchEvent = await prisma.matchEvent.update({
            where: {
                match_event_id,
            },
            data: updates
        })

        return matchEvent
    } catch (error) {
        console.log('Error in models/match.ts:updateMatchEvent')
    }
}

export type CreateMatchEvent = Prisma.Args<typeof prisma.matchEvent, 'create'>['data']