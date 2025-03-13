import { cookies } from 'next/headers'

import { Badge } from '@/components/badge'
import { Card } from '@/components/card'
import Greeting from '@/components/greeting'
import { Subheading } from '@/components/heading'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { formatDateTime } from '@/lib/date-helper'
import { getMySessionAndOrganization, TeamMember, User } from '@/models/organization'
import Link from 'next/link'
import { MatchDialog } from './[team_id]/match.dialog'

export default async function ScheduleIndexPage(props: { params: Promise<unknown> }) {
  const cookieStore = await cookies()
  const { organization_id } = (await props.params) as { organization_id: string }
  const organization = await getMySessionAndOrganization(organization_id)

  const teams: {
    team_id: string
    name: string
    age_group: string
    members: (TeamMember & { user: User })[]

    players: {
      player_id: string
      jersey_number: string
      position: string
      player: {
        birth_date?: number
        birth_month?: number
        birth_year: number
        first_name: string
        last_name: string
        user_id?: string
      }
    }[]
  }[] = organization?.teams || []
  let matches: ({
    [k: string]: string
  } & {
    team: {
      [k: string]: string
    }
  })[] = organization?.matches || []

  teams.forEach((team) => {
    team.members = organization.members.filter((member: TeamMember) => member.team_id === team.team_id)
  })
  return (
    <>
      <Greeting />
      <div className="mt-8 flex items-end justify-between">
        <Subheading>Overview</Subheading>
      </div>
      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <Card
          href="/matches/new"
          title="Upcoming matches"
          contents={
            <div className="flex flex-col gap-0 text-xs/5 text-zinc-500">
              {matches.map((match) => (
                <Link href={`/matches/${match.match_id}`} className="group flex gap-1" key={match.match_id}>
                  <span className="font-bold underline group-hover:text-lime-500">{match.team.name}</span>
                  <span>vs.</span>
                  <span className="flex-1 group-hover:text-zinc-200">{match.opponent}</span>
                  <Badge color="pink" text-size="text-xs/5 sm:text-[0.65rem]/3">
                    {formatDateTime(new Date(match.match_date))}
                  </Badge>
                </Link>
              ))}
            </div>
          }
        />
      </div>
      <Subheading className="mt-14">Teams</Subheading>
      <Table className="mt-4 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Team</TableHeader>
            <TableHeader>Coach</TableHeader>
            <TableHeader>Upcoming match</TableHeader>
            <TableHeader className="w-8 text-right">&nbsp;</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {teams.map((team) => (
            <TableRow
              key={team.team_id}
              href={`/organizations/${organization_id}/teams/${team.team_id}`}
              title={`#${team.name} ${team.age_group}`}
            >
              <TableCell>
                {team.name} ({team.age_group})
              </TableCell>
              <TableCell>
                {team.members
                  .filter((m) => m.role.toLowerCase().includes('coach'))
                  .map((m) =>
                    [
                      m.user.first_name,
                      m.user.last_name,
                      !m.role.toLowerCase().startsWith('coach')
                        ? `(${m.role.replace('Coach', '', 'gi').trim().toLowerCase()})`
                        : undefined,
                    ]
                      .filter(Boolean)
                      .join(' ')
                  )
                  .sort((a, b) => a.indexOf('('))
                  .join(' • ')}
              </TableCell>
              <TableCell className="text-pink dark:text-pink-300">
                {matches?.find((m) => m.team_id === team.team_id)?.opponent || 'None scheduled'}
              </TableCell>
              <TableCell className="text-right">
                <MatchDialog outline team-id={team.team_id}>
                  Add Match
                </MatchDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
