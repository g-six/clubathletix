import { prisma } from '@/prisma'
import { Prisma } from '@prisma/client'

export async function createLeague(input: Prisma.LeagueCreateInput) {
    try {
        const data = Prisma.validator<Prisma.LeagueCreateInput>()({
            ...input
        })
        const results = await prisma.league.create({ data })

        return results
    } catch (error) {
        console.log('error', { input })
        console.error(JSON.stringify(error))
    }
}

export async function updateLeague(league_id: string, input: Prisma.LeagueUpdateInput) {

    try {
        const data = Prisma.validator<Prisma.LeagueUpdateInput>()(input)
        const results = await prisma.league.update({
            where: {
                league_id
            },
            data
        })

        return results
    } catch (error) {
        console.log('error', { input })
        console.error(JSON.stringify(error))
    }
}

export async function findLeagues(input: Prisma.LeagueWhereInput, include?: Prisma.LeagueInclude): Promise<League[] | undefined> {
    try {
        const where = Prisma.validator<Prisma.LeagueWhereInput>()({
            ...input
        })
        const results = await prisma.league.findMany({ where, include })

        return results
    } catch (error) {
        console.log('error', { input })
        console.error(JSON.stringify(error))
    }
}

export async function getLeague(league_id: string) {
    console.log({ league_id })
    try {
        const where = Prisma.validator<Prisma.LeagueWhereInput>()({
            league_id
        })
        const league = await prisma.league.findUnique({
            where,
            select: {
                teams: true
            }
        })

        return league
    } catch (error) {
        console.log('error', { league_id })
        console.error(JSON.stringify(error))
    }
}

type Team = Prisma.Args<typeof prisma.team, 'create'>['data']
export type League = Prisma.Args<typeof prisma.league, 'create'>['data'] & {
    teams?: Team[]
}