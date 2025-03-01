export async function createTeam(payload: { [k: string]: unknown }) {
    const res = await fetch('/api/teams', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
    const json = await res.json()
    return json
}
export async function getOrganizationTeams(organization_id: string) {
    const res = await fetch('/api/organizations/' + organization_id + '/teams', {
        headers: {
            'Content-Type': 'application/json',
        },
    })
    return await res.json()
}

export async function getParents(team_id: string) {
    const res = await fetch(`/api/teams/${team_id}/parents`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    const json = await res.json()
    return json
}

export async function addTeamPlayer({
    team_id,
    player_id,
    jersey_number,
    position,
    parent,
    relationship,
}: {
    team_id: string,
    player_id: string,
    jersey_number?: string
    position?: string
    parent?: string
    relationship?: string
}) {
    const res = await fetch(`/api/teams/${team_id}/players`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            team_id,
            player_id,
            jersey_number,
            position,
            parent,
            relationship,
        })
    })
    return await res.json()
}