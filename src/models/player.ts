import { prisma } from '@/prisma'
import { Prisma } from '@prisma/client'

export async function createPlayer(input: Prisma.PlayerCreateInput) {
    try {
        const data = Prisma.validator<Prisma.PlayerCreateInput>()({
            ...input
        })
        const player = await prisma.player.create({ data })
        if (player) return player
    } catch (error) {
        console.log('error', { input })
        console.error(JSON.stringify(error))
    }
}

export async function updatePlayer(player_id: string, input: Prisma.PlayerUpdateInput) {

    try {
        const data = Prisma.validator<Prisma.PlayerUpdateInput>()(input)
        const results = await prisma.player.update({
            where: {
                player_id
            },
            data
        })

        return results
    } catch (error) {
        console.log('error', { input })
        console.error(JSON.stringify(error))
    }
}

export async function findPlayers(input: Prisma.PlayerWhereInput, include?: Prisma.PlayerInclude): Promise<Player[] | undefined> {
    try {
        const where = Prisma.validator<Prisma.PlayerWhereInput>()({
            ...input
        })
        const results = await prisma.player.findMany({ where, include })

        return results
    } catch (error) {
        console.log('error', { input })
        console.error(JSON.stringify(error))
    }
}

export async function getPlayer(player_id: string) {
    try {
        const where = Prisma.validator<Prisma.PlayerWhereInput>()({
            player_id
        })
        const player = await prisma.player.findUnique({
            where,
            select: {
                teams: {
                    select: {
                        team: true
                    }
                }
            }
        })

        return player
    } catch (error) {
        console.log('error', { player_id })
        console.error(JSON.stringify(error))
    }
}

type TeamPlayer = Prisma.Args<typeof prisma.teamPlayer, 'create'>['data']
type Team = Prisma.Args<typeof prisma.team, 'create'>['data']
export type Player = Prisma.Args<typeof prisma.player, 'create'>['data'] & {
    teamsIn?: (TeamPlayer & { team?: Team })[]
}