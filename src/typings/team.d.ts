import { SesssionLeague } from './league'
import { SessionPlayer } from './player'
import { SessionTeamMember } from './team-member'
import { SessionUser } from './user'

export type SessionTeam = Pick<Team, 'team_id' | 'league_id' | 'organization_id' | 'name' | 'age_group' | 'division' | 'logo' | 'short_name' | 'created_at'> & {
    members: (SessionTeamMember & { user: SessionUser })[]
    matches: (SessionMatch & {
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
    )[]
}