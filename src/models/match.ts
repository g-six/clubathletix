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

export type CreateMatch = Prisma.Args<typeof prisma.Match, 'create'>['data']