import { cookies } from 'next/headers'

import { Avatar } from '@/components/avatar'
import { Badge } from '@/components/badge'
import { Card } from '@/components/card'
import { Heading, Subheading } from '@/components/heading'
import { CreateLeagueDialog } from '@/components/organizations/league.dialog'
import { InviteMemberDialog } from '@/components/organizations/member.dialog'
import { CreateOrganizationForm } from '@/components/organizations/organization.form'
import { TeamDialog } from '@/components/organizations/team.dialog'
import { Select } from '@/components/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
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
  let members = organization?.members || []

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
          title="Upcoming matches / trainings"
          CreateDialog={<span />}
          href={`/organizations/${organization_id}/matches`}
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
        {cookieStore.get('role')?.value === 'owner' && (
          <Card
            href={leagues.length > 0 ? `/organizations/${organization_id}/leagues` : undefined}
            title="Leagues"
            CreateDialog={
              <CreateLeagueDialog skeleton organization-id={organization_id} className="!text-zinc-500">
                Create another league
              </CreateLeagueDialog>
            }
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
        )}

        {cookieStore.get('role')?.value === 'owner' && (
          <Card
            href={teams.length > 0 ? `/organizations/${organization_id}/teams` : undefined}
            title="Teams"
            CreateDialog={
              <TeamDialog skeleton organization-id={organization_id} className="!text-zinc-500" leagues={leagues}>
                Add another team
              </TeamDialog>
            }
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
        )}
        {cookieStore.get('role')?.value &&
          ['owner', 'root'].includes(cookieStore.get('role')?.value.toLowerCase() as string) && (
            <Card
              title="Organization Members"
              href={`/organizations/${organization_id}/members`}
              CreateDialog={
                <InviteMemberDialog className="!text-zinc-500" skeleton organization-id={organization_id}>
                  Invite another member
                </InviteMemberDialog>
              }
              contents={
                <div className="flex flex-col gap-0 text-xs/5 text-zinc-500">
                  {members.map((rec) => (
                    <Link
                      href={`/organizations/${organization_id}/members/${rec.team_member_id}`}
                      className="group flex gap-1"
                      key={rec.team_member_id}
                    >
                      <Avatar
                        src={rec.user.image ? `/api/files/${rec.user.image}` : null}
                        initials={rec.user.image ? undefined : [rec.user.first_name[0], rec.user.last_name[0]].join('')}
                        className="size-4"
                        center
                      />
                      <span>{[rec.user.last_name, rec.user.first_name].filter(Boolean).join(', ')}</span>
                      <span className="flex-1 font-bold capitalize group-hover:text-lime-500"></span>
                      <Badge color="lime" text-size="text-xs/5 sm:text-[0.65rem]/3 capitalize">
                        {(teams.find((team) => team.team_id === rec.team_id) || {})?.name?.toLowerCase()}{' '}
                      </Badge>
                      <Badge color="zinc" text-size="text-xs/5 sm:text-[0.65rem]/3">
                        <span className="capitalize">{rec.role.toLowerCase()}</span>
                      </Badge>
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
          )}
      </div>
      <Subheading className="mt-14">Recent registrations</Subheading>
      <Table className="mt-4 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Registration date</TableHeader>

            <TableHeader>Name</TableHeader>
            <TableHeader className="text-right">Amount</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {members.map((record) => (
            <TableRow
              key={record.team_member_id}
              href={`/organizations/${organization.organization_id}/members/${record.team_member_id}`}
              title={record.user.first_name}
            >
              <TableCell className="w-48 text-zinc-500">{formatDateTime(record.user.created_at)}</TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar
                    src={record.user.image ? `/api/files/${record.user.image}` : null}
                    initials={
                      record.user.image ? undefined : [record.user.first_name[0], record.user.last_name[0]].join('')
                    }
                    className="size-6"
                    center
                  />
                  <span>{record.user.first_name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right capitalize">{record.role.toLowerCase()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
