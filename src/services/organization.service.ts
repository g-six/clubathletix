
export async function setActiveOrganization(organization_id: string) {
    const organization = await fetch('/api/organizations/' + organization_id)

    return await organization.json()
}