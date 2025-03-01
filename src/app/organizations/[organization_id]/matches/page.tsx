import { getMatchesByOrganizationId } from '@/models/match'

export default async function OrganizationMatchesPage({ params }: { params: Promise<{ organization_id: string }> }) {
  const { organization_id } = await params

  const matches = await getMatchesByOrganizationId(organization_id)

  return <div>{organization_id}</div>
}
