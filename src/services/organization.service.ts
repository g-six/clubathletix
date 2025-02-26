
export async function setActiveOrganization(organization_id: string) {
    const organization = await fetch('/api/organizations/' + organization_id)

    return await organization.json()
}

export async function createOrganization(payload: unknown) {
    const organization = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })

    return await organization.json()
}