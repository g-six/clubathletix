export type SessionUser = Pick<User, 'user_id', 'email' | 'first_name' | 'last_name' | 'image' | 'phone'> & {
    organizations: (SessionOrganizationUser & {
        organization: SessionOrganization & {
            leagues: SesssionLeague[]
        }
    })[]
    team_members: (SessionTeamMember & {
        team: SessionTeam & {
            matches: SessionMatch[]
        }
    })[]
}