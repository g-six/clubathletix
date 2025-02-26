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

export async function getLeagueTeams(league_id: string) {
    const leagues = await fetch('/api/leagues/' + league_id + '/teams')
    return await leagues.json()
}

export async function createLeague(league: { [k: string]: unknown }) {
    const res = await fetch('/api/leagues', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(league),
    })
    const json = await res.json()
    return json
}

export async function updateLeague(league: { [k: string]: unknown }) {
    const {
        league_id,
        ...rest
    } = league
    const res = await fetch(`/api/leagues/${league_id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(rest),
    })
    const json = await res.json()
    return json
}