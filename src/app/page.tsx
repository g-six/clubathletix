import { Stat } from '@/app/stat'
import { Subheading } from '@/components/heading'
import { CreateOrganizationForm } from '@/components/organizations/organization.form'
import { Select } from '@/components/select'
import { getOrganizationsByUserId } from '@/models/organization'

import Greeting from '@/components/greeting'
import { getAuthForOperation } from '@/models/auth'

export default async function Home() {
  const session = await getAuthForOperation()

  if (!session?.user_id) {
    return <div>Please sign in</div>
  }
  let organizations = await getOrganizationsByUserId(session.user_id)

  if (!organizations.length) return <CreateOrganizationForm />
  return (
    <>
      <Greeting />
      <div className="mt-8 flex items-end justify-between">
        <Subheading>Overview</Subheading>
        <div>
          <Select name="period">
            <option value="last_week">Last week</option>
            <option value="last_two">Last two weeks</option>
            <option value="last_month">Last month</option>
            <option value="last_quarter">Last quarter</option>
          </Select>
        </div>
      </div>
      <div className="mt-4 hidden gap-8 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Total revenue" value="$2.6M" change="+4.5%" />
        <Stat title="Average order value" value="$455" change="-0.5%" />
        <Stat title="Tickets sold" value="5,888" change="+4.5%" />
        <Stat title="Pageviews" value="823,067" change="+21.2%" />
      </div>
    </>
  )
}
