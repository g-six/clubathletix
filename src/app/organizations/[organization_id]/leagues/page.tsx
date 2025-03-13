import { Stat } from '@/app/stat'
import { Badge } from '@/components/badge'
import { Card } from '@/components/card'

import { Heading, Subheading } from '@/components/heading'
import { CreateLeagueDialog } from '@/components/organizations/league.dialog'
import { TeamDialog } from '@/components/organizations/team.dialog'
import { Select } from '@/components/select'

import { findLeagues } from '@/models/league'
import { Prisma } from '@prisma/client'
import Link from 'next/link'

export default async function Leagues({ params }: { params: Promise<unknown> }) {
  const { organization_id } = (await params) as { [k: string]: string }
  const leagues = await findLeagues(
    {
      organization_id,
    },
    {
      teams: true,
    }
  )
  const teams: unknown[] = []
  leagues?.forEach((league) => {
    if (league.teams) teams.push(...league.teams)
  })

  return (
    <>
      <div className="flex justify-between">
        <Heading>Leagues</Heading>
        <CreateLeagueDialog>Create a league</CreateLeagueDialog>
      </div>
      <div className="mt-8 flex items-end justify-between">
        <Subheading>Overview</Subheading>
        <div>
          <Select name="period">
            <option value="last_week">Last wseek</option>
            <option value="last_two">Last two weeks</option>
            <option value="last_month">Last month</option>
            <option value="last_quarter">Last quarter</option>
          </Select>
        </div>
      </div>
      <div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        <Card
          title="Teams"
          href={teams.length > 0 ? `/organizations/${organization_id}/teams` : undefined}
          CreateDialog={
            <div>
              <TeamDialog
                organization-id={organization_id}
                leagues={(leagues || []) as unknown as Prisma.LeagueUncheckedCreateInput[]}
                skeleton
              >
                New team
              </TeamDialog>
            </div>
          }
          contents={
            <div className="flex flex-col gap-0 text-xs/5 text-zinc-500">
              {(teams as Prisma.TeamUncheckedCreateInput[]).map((record) => (
                <Link
                  href={`/organizations/${organization_id}/teams/${record.team_id}`}
                  className="group flex flex-wrap sm:gap-1"
                  key={record.team_id}
                >
                  <Badge color="lime" text-size="text-xs/5 sm:text-[0.65rem]/3">
                    {record?.age_group}
                  </Badge>
                  <span className="h-2 w-full sm:hidden" />
                  <Badge color="pink" text-size="text-xs/5 sm:text-[0.65rem]/3">
                    Div {record?.division}
                  </Badge>
                  <span className="h-2 w-full sm:hidden" />
                  <span className="font-boldgroup-hover:text-lime-500">{record?.name}</span>
                </Link>
              ))}
              {teams.length === 0 && <span>No teams</span>}
            </div>
          }
        />
        <Stat title="Cancelled matches" value="$455" change="-0.5%" />
        <Stat title="Rescheduled matches" value="5,888" change="+4.5%" />
        <Stat title="Fouls" value="823,067" change="+21.2%" />
      </div>
    </>
  )
}
