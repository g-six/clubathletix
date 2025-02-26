import { cookies } from 'next/headers'

import { Avatar } from '@/components/avatar'
import { Badge } from '@/components/badge'
import { Card } from '@/components/card'
import { Heading, Subheading } from '@/components/heading'
import { CreateLeagueDialog } from '@/components/organizations/league.dialog'
import { CreateOrganizationForm } from '@/components/organizations/organization.form'
import { TeamDialog } from '@/components/organizations/team.dialog'
import { Select } from '@/components/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { getRecentMembers } from '@/data'
import { formatDateTime } from '@/lib/date-helper'
import { getOrganization } from '@/models/organization'
import { Prisma } from '@prisma/client'
import Link from 'next/link'

export default async function Home(props: { params: Promise<unknown> }) {
  const cookieStore = await cookies()
  const { organization_id } = (await props.params) as { organization_id: string }
  const organization = await getOrganization(organization_id)

  if (!organization?.organization_id) return <CreateOrganizationForm />

  const teams: Prisma.TeamUncheckedCreateInput[] = organization?.teams || []

  let matches: Prisma.MatchUncheckedCreateInput[] = organization?.matches || []
  let leagues: Prisma.LeagueUncheckedCreateInput[] = organization?.leagues || []
  let orders = await getRecentMembers()

  return (
    <>
      <Heading>
        Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
        {cookieStore.get('first_name')?.value}
      </Heading>
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
      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <Card
          title="Upcoming matches"
          href={matches.length > 0 ? `/organizations/${organization_id}/matches` : undefined}
          contents={
            <div className="flex flex-col gap-0 text-xs/5 text-zinc-500">
              {matches.map((match) => (
                <Link
                  href={`/organizations/${organization_id}/teams/${match.team_id}/matches/${match.match_id}`}
                  className="group flex flex-wrap sm:gap-1"
                  key={match.match_id}
                >
                  <span className="font-bold underline group-hover:text-lime-500">
                    {teams.find((t) => t.team_id === match.team_id)?.name}
                  </span>
                  <span>vs.</span>
                  <span className="flex-1 group-hover:text-zinc-200">{match.opponent}</span>
                  <span className="w-full sm:hidden" />
                  <Badge color="pink" text-size="text-xs/5 sm:text-[0.65rem]/3">
                    {formatDateTime(new Date(match.match_date))}
                  </Badge>
                  <span className="h-2 w-full sm:hidden" />
                </Link>
              ))}
              {matches.length === 0 && <span>No upcoming matches</span>}
            </div>
          }
        />
        <Card
          href="/matches/new"
          title="Recent notifications"
          contents={
            <div className="flex flex-col gap-0 text-xs/5 text-zinc-500">
              <Link href={'/matches/new'} className="group flex justify-between">
                <span className="group-hover:text-zinc-200">Schedule updated</span>
                <Badge color="pink" text-size="text-xs/5 sm:text-[0.65rem]/3">
                  Team A v Team B
                </Badge>
              </Link>
            </div>
          }
        />
        <Card
          href={leagues.length > 0 ? `/organizations/${organization_id}/leagues` : undefined}
          title="Leagues"
          contents={
            <div className="flex flex-col gap-0 text-xs/5 text-zinc-500">
              {leagues.map((record) => (
                <Link
                  href={`/organizations/${organization_id}/teams/${record.league_id}`}
                  className="group flex gap-1"
                  key={record.league_id}
                >
                  <span className="flex-1 font-bold group-hover:text-lime-500">{record.name}</span>
                </Link>
              ))}
              {leagues.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <span>No league yet</span>

                  <CreateLeagueDialog plain organization-id={organization_id} className="!text-xs/4 underline">
                    + Create one
                  </CreateLeagueDialog>
                </div>
              )}
            </div>
          }
        />

        <Card
          href="/matches/new"
          title="Standings"
          contents={
            <div className="flex flex-col gap-0 text-xs/5 text-zinc-500">
              <Link href={'/matches/new'} className="group flex justify-between">
                <span className="group-hover:text-zinc-200">U15 Titans</span>
                <Badge color="lime" text-size="text-xs/5 sm:text-[0.65rem]/3">
                  #3 - 14 pts
                </Badge>
              </Link>
              <Link href={'/matches/new'} className="group flex justify-between">
                <span className="group-hover:text-zinc-200">U14 Selects</span>
                <Badge color="lime" text-size="text-xs/5 sm:text-[0.65rem]/3">
                  #2 - 15 pts
                </Badge>
              </Link>
            </div>
          }
        />

        <Card
          href={teams.length > 0 ? `/organizations/${organization_id}/teams` : undefined}
          title="My teams"
          contents={
            <div className="flex flex-col gap-0 text-xs/5 text-zinc-500">
              {teams.map((team) => (
                <Link
                  href={`/organizations/${organization_id}/teams/${team.team_id}`}
                  className="group flex gap-1"
                  key={team.team_id}
                >
                  <span className="flex-1 font-bold group-hover:text-lime-500">{team.name}</span>
                  <Badge color="pink" text-size="text-xs/5 sm:text-[0.65rem]/3">
                    {team.age_group}
                  </Badge>
                  {team.division && (
                    <Badge
                      color={team.division.includes('1') ? 'lime' : 'zinc'}
                      text-size="text-xs/5 sm:text-[0.65rem]/3"
                    >
                      Div {team.division}
                    </Badge>
                  )}
                </Link>
              ))}
              {teams.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <span>No teams yet</span>

                  <TeamDialog
                    plain
                    organization-id={organization_id}
                    leagues={leagues}
                    className="!text-xs/4 underline"
                  >
                    + Create one
                  </TeamDialog>
                </div>
              )}

              {teams.length > 0 && (
                <div className="my-1 flex w-full justify-end">
                  <TeamDialog
                    skeleton
                    organization-id={organization_id}
                    leagues={leagues}
                    className="!bg-none !text-zinc-400 hover:!text-lime-500"
                  >
                    + New team
                  </TeamDialog>
                </div>
              )}
            </div>
          }
        />
        <Card
          href={teams.length > 0 ? `/organizations/${organization_id}/teams` : undefined}
          title="My teams"
          contents={
            <div className="flex flex-col gap-0 text-xs/5 text-zinc-500">
              {teams.map((team) => (
                <Link
                  href={`/organizations/${organization_id}/teams/${team.team_id}`}
                  className="group flex gap-1"
                  key={team.team_id}
                >
                  <span className="flex-1 font-bold group-hover:text-lime-500">{team.name}</span>
                  <Badge color="pink" text-size="text-xs/5 sm:text-[0.65rem]/3">
                    {team.age_group}
                  </Badge>
                  {team.division && (
                    <Badge
                      color={team.division.includes('1') ? 'lime' : 'zinc'}
                      text-size="text-xs/5 sm:text-[0.65rem]/3"
                    >
                      Div {team.division}
                    </Badge>
                  )}
                </Link>
              ))}
              {teams.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <span>No teams yet</span>

                  <TeamDialog
                    plain
                    organization-id={organization_id}
                    leagues={leagues}
                    className="!text-xs/4 underline"
                  >
                    + Create one
                  </TeamDialog>
                </div>
              )}
            </div>
          }
        />
      </div>
      <Subheading className="mt-14">Recent registrations</Subheading>
      <Table className="mt-4 hidden [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
        <TableHead>
          <TableRow>
            <TableHeader>ID</TableHeader>
            <TableHeader>Registration date</TableHeader>
            <TableHeader>Customer</TableHeader>
            <TableHeader>Age group</TableHeader>
            <TableHeader className="text-right">Amount</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} href={order.url} title={`Member #${order.id}`}>
              <TableCell>{order.id}</TableCell>
              <TableCell className="text-zinc-500">{order.date}</TableCell>
              <TableCell>{order.customer.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar src={order.event.thumbUrl} className="size-6" />
                  <span>{order.event.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">US{order.amount.usd}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
