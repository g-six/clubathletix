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