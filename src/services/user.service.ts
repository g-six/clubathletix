export async function inviteUser(
    payload: { [k: string]: unknown },
    {
        organization_id,
        team_id,
        ...config
    }: {
        role: string
        organization_id: string
        team_id?: string
    }) {
    const res = await fetch(`/api/organizations/${organization_id}/invite`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...payload,
            ...config,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })
    })

    return await res.json()
}
export async function getProfile() {
    const res = await fetch('/api/profile')

    return await res.json()
}
