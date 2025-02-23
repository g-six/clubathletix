import { prisma } from '@/prisma'
import { Prisma } from '@prisma/client'
import { cookies } from 'next/headers'

export async function createMatchEvent(payload: unknown) {
    const cookieStore = await cookies()
    const created_by = cookieStore.get('user_id')?.value
    const {
        match_id,
        player_id,
        event_type,
        event_time,
    } = payload as CreateMatchEvent
    const data = {
        match_id,
        player_id,
        event_type,
        event_time,
        created_by,
    }
    try {
        return await prisma.matchEvent.create({
            data
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

export type CreateMatchEvent = Prisma.Args<typeof prisma.matchEvent, 'create'>['data']