import { prisma } from '@/prisma'
import { getAuthForOperation } from './auth'

export async function addPlayerParent(user_id: string, player_id: string) {
    const session = await getAuthForOperation()
    const playerParent = await prisma.playerParent.create({
        data: {
            user_id,
            player_id,
            created_by: session.user_id
        }
    })

    return playerParent
}