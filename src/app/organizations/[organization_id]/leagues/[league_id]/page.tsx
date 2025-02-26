import { Stat } from '@/app/stat'

import { Heading, Subheading } from '@/components/heading'
import { CreateLeagueDialog, EditLeagueDialog } from '@/components/organizations/league.dialog'
import { Select } from '@/components/select'

import { getLeague } from '@/models/league'
import { PencilSquareIcon } from '@heroicons/react/16/solid'
import { notFound } from 'next/navigation'

export default async function League({ params }: { params: Promise<unknown> }) {
  const { league_id, organization_id } = (await params) as {
    organization_id: string
    league_id: string
  }

  const league = await getLeague(league_id)

  if (!league) return notFound
  return (
    <>
      <div className="flex justify-between">
        <section className="flex flex-1 items-center gap-2">
          <Heading>{league.name}</Heading>
          <EditLeagueDialog data={league} skeleton slot="icon">
            <PencilSquareIcon className="size-6" />
          </EditLeagueDialog>
        </section>
        <CreateLeagueDialog>Create a league</CreateLeagueDialog>
      </div>
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
      <div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Total matches" value="$2.6M" change="+4.5%" />
        <Stat title="Cancelled matches" value="$455" change="-0.5%" />
        <Stat title="Rescheduled matches" value="5,888" change="+4.5%" />
        <Stat title="Fouls" value="823,067" change="+21.2%" />
      </div>
    </>
  )
}
