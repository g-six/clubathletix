import { Heading } from '@/components/heading'
import { CreateOrganizationForm } from '@/components/organizations/organization.form'

import { getMySessionAndOrganization } from '@/models/organization'
import RegisteredUsersTable from './registered-users.component'
import TeamList from './team-list.component'

export default async function OrganizationPage(props: { params: Promise<unknown> }) {
  const { organization_id } = (await props.params) as { organization_id: string }
  const my = await getMySessionAndOrganization(organization_id)

  if (!my?.organization_id) return <CreateOrganizationForm />

  let members = my?.members || []
  const isOwner = members.find((m) => m.user_id === my.session.user_id && m.role.toLowerCase() === 'owner')

  console.log(my.teams)
  return (
    <>
      <Heading>
        <span className="hidden sm:inline-block">{my.name}</span> Overview
      </Heading>

      <div className="grid gap-2 sm:grid-cols-2">
        {isOwner && <RegisteredUsersTable data={members} data-organization={my.organization_id} />}
        {isOwner && <TeamList data={my.teams || []} data-organization={my.organization_id} />}
      </div>
    </>
  )
}
