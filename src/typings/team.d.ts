import { SessionPlayer } from './player'

export type SessionTeam = Pick<Team, 'team_id' | 'name' | 'age_group' | 'division' | 'logo' | 'short_name'> & {
    matches: (SessionMatch & {
        team: {
            team_id: string
            name: string
            players: SessionPlayer & {
                matches: {
                    jersey_number?: number
                    goals?: number
                    assists?: number
                    yellow_cards?: number
                    position?: string
                }
            }
        }
    })[]
}