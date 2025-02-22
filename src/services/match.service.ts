import { prisma } from '@/prisma'
import { Prisma } from '@prisma/client'

export async function createMatch(payload: unknown) {
    const {
        team_id,
        organization_id,
        league_id,
        opponent,
        location,
        home_or_away,
    } = payload as CreateMatch
    const { year, month, day, hour, minute } = payload as {
        [k: string]: string
    }
    const today = new Date()
    const match_date = new Date(
        year ? Number(year) : today.getFullYear(),
        month ? Number(month) - 1 : today.getMonth(),
        day ? Number(day) : today.getDate(),
        hour ? Number(hour) : 8,
        minute ? Number(minute) : 30
    )
    try {
        await fetch('/api/matches', {
            method: 'POST',
            body: JSON.stringify({
                team_id,
                organization_id,
                league_id,
                opponent,
                location,
                match_date,
                home_or_away,
            })
        })
    } catch (error) {
        console.log('error')
    }
}

export async function getMatch(match_id: string) {
    if (!match_id) {
        console.log('Invalid match id', match_id)
        return
    }
    try {
        const match = await fetch(`/api/matches/${match_id}`)
        return await match.json()
    } catch (error) {
        console.log('error')
        console.log(error)
    }
}

export type CreateMatch = Prisma.Args<typeof prisma.Match, 'create'>['data']