export async function getAvailableLeaguesForTeam(team_id: string) {
    const teamLeagues = await fetch('/api/teams/' + team_id + '/leagues')
    const { league, organization_id, league_id, ...team } = await teamLeagues.json()

    return {
        league_id,
        ...league,
        team,
        organization_id,
    }
}
export async function getAvailableLeaguesForOrganization(organization_id: string) {
    const leagues = await fetch('/api/organizations/' + organization_id + '/leagues')
    return await leagues.json()
}