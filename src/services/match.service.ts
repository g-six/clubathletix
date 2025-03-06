import { prisma } from '@/prisma'
import { League, Match, Player, Prisma, Team, TeamMember, TeamPlayer, User } from '@prisma/client'

export async function createMatch(payload: unknown) {
    const {
        team_id,
        organization_id,
        opponent,
        location,
        home_or_away,
        league_id,
    } = payload as CreateMatch
    const { year, month, day, hour, minute } = payload as {
        [k: string]: string
    }
    const today = new Date()
    const match_date = [[
        year ? Number(year) : today.getFullYear(),
        month ? Number(month) : today.getMonth() + 1,
        day ? Number(day) : today.getDate()
    ].map(num => num < 10 ? `0${num}` : num).join('-'),
    [
        hour ? Number(hour) : 8,
        minute ? Number(minute) : 30].map(num => num < 10 ? `0${num}` : num).join(':')
    ].join('T')
    try {
        const res = await fetch('/api/matches', {
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
        if (res.ok)
            return await res.json()
    } catch (error) {
        console.log('error')
    }

    return null
}

export async function createMatchEvent(payload: unknown) {
    const {
        match_id,
        side,
        opponent_number,
        player_id,
        event,
        assist,
        logged_at
    } = payload as {
        [k: string]: string
    }

    try {
        if (event === 'goal') {
            const results = await fetch(`/api/matches/${match_id}/${event}`, {
                method: 'POST',
                body: JSON.stringify({
                    logged_at,
                    side,
                    opponent_number,
                    player_id,
                    assist
                })
            })

            if (results.ok) return await results.json()
        }

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
        if (match.ok) {

            return await match.json()
        }
        return {
            statusText: match.statusText,
            status: match.status,
        }
    } catch (error) {
        console.log('error')
        console.log(error)
    }
}

export async function startMatch(match_id: string, localized_time: string, reason: 'start 1st half' | 'start 2nd half' | 'start match' = 'start match') {
    if (!match_id) {
        console.log('Invalid match id', match_id)
        return
    }
    try {
        const match = await fetch(`/api/matches/${match_id}/start`, {
            method: 'PUT',
            body: JSON.stringify({
                localized_time,
                reason
            })
        })
        return await match.json()
    } catch (error) {
        console.log('error')
        console.log(error)
    }
}

export async function stopMatch(
    match_id: string,
    localized_time: string,
    reason: 'end 1st half' | 'end 2nd half' | 'end match' = 'end match'
) {
    if (!match_id) {
        console.log('Invalid match id', match_id)
        return
    }
    try {
        const match = await fetch(`/api/matches/${match_id}/stop`, {
            method: 'PUT',
            body: JSON.stringify({
                localized_time,
                reason
            })
        })
        return await match.json()
    } catch (error) {
        console.log('error')
        console.log(error)
    }
}

export async function createVideo({
    match_id,
    match_event_id,
    title,
    file,
}: {
    size: number
    match_id: string
    match_event_id: string
    title: string
    file: File
}) {
    const signing = await fetch(`/api/matches/${match_id}/upload`, {
        method: 'PUT',
        body: JSON.stringify({ title, type: file.type, extension: file.name.split('.').pop() }),
        headers: {
            'Content-Type': 'application/json',
        }
    })

    const res = await signing.json()
    if (res.upload_link) {
        const upload = await fetch(`/api/matches/${match_id}/upload`, {
            method: 'PATCH',
            body: file,
            headers: {
                'Content-Type': 'application/octet-stream',
                'X-Upload-Link': res.upload_link,
                'X-File-Name': res.Key,
                'X-Match-Event-Id': match_event_id
            }
        })

        if (upload.ok) {
            const results = await upload.json()
            return {
                results,
                Key: res.Key
            }
        }
    }
}

export type CreateMatch = Prisma.Args<typeof prisma.match, 'create'>['data']
export type MatchRecord = Match & {
    league: League
    team: Team & {
        members: (TeamMember & {
            user: User
        })[]
        players: (TeamPlayer & {
            player: Player & {
                user?: User
            }
        })[]
    }
    events: (CreateMatchEvent & {
        player: Player
        opponent_number?: string
    })[]
}
export type CreateMatchEvent = Prisma.Args<typeof prisma.matchEvent, 'create'>['data']