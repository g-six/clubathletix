import { Stat } from '@/app/stat'
import { Subheading } from '@/components/heading'
import { CreateOrganizationForm } from '@/components/organizations/organization.form'

import { Avatar } from '@/components/avatar'
import { Badge } from '@/components/badge'
import { Card } from '@/components/card'
import Greeting from '@/components/greeting'
import { Link } from '@/components/link'
import { CreateLeagueDialog } from '@/components/organizations/league.dialog'
import { MatchDialog } from '@/components/organizations/match.dialog'
import { InviteMemberDialog } from '@/components/organizations/member.dialog'
import { TeamDialog } from '@/components/organizations/team.dialog'
import { formatDateTime } from '@/lib/date-helper'
import { getAuthForOperation } from '@/models/auth'
import { SesssionLeague } from '@/typings/league'
import { SessionMatch } from '@/typings/match'
import { SessionTeam } from '@/typings/team'
import { SessionTeamMember } from '@/typings/team-member'
import { SessionOrganizationUser } from '@/typings/user-organization'
import { Organization } from '@prisma/client'
import { cookies } from 'next/headers'

export default async function Home() {
  const session = await getAuthForOperation()
  const cookieJar = await cookies()
  const { organization: selectedOrganization, role } = (cookieJar.get('organization_id')?.value
    ? session.organizations.find(
        ({ organization_id }: { organization_id: string }) =>
          organization_id === cookieJar.get('organization_id')?.value
      )
    : session.organizations[0]) as unknown as {
    organization?: Organization & { leagues: SesssionLeague[]; members: SessionOrganizationUser[] }
    role?: string
  }
  const leagues = selectedOrganization?.leagues || []
  const matches: SessionMatch[] = []
  const manageableTeams: {
    team_id: string
    name: string
    role: string
    league_id?: string
  }[] = []
  const teams = (session.team_members as (SessionTeamMember & { team: SessionTeam })[]).map((tm) => {
    if (['coach', 'assistant coach', 'team manager'].includes(tm.role))
      manageableTeams.push({
        team_id: tm.team_id,
        role: tm.role,
        name: tm.team.name,
        league_id: tm.team.league_id || undefined,
      })
    return {
      ...tm,
      team: undefined,
      ...tm.team,
    }
  })
  console.log(selectedOrganization?.members)
  if (!session?.user_id) {
    return <div>Please sign in</div>
  }

  if (!session.organizations.length) return <CreateOrganizationForm />
  return (
    <>
      <Greeting />
      {selectedOrganization && (
        <>
          <div className="mt-8 flex items-end justify-between gap-1">
            <Subheading>{selectedOrganization.name} Overview</Subheading>
          </div>
          <div className="mt-4 grid gap-8 lg:grid-cols-2">
            <Card
              title="Upcoming matches"
              CreateDialog={
                manageableTeams.length ? (
                  <MatchDialog
                    skeleton
                    teams={manageableTeams.filter(Boolean).map(({ league_id, team_id, name }) => ({
                      team_id,
                      name,
                      league_id,
                      league: leagues.find((l) => l.league_id === league_id),
                    }))}
                  >
                    Add match
                  </MatchDialog>
                ) : (
                  <span />
                )
              }
              href={`/organizations/${selectedOrganization?.organization_id}/matches`}
              contents={
                <div className="flex flex-col gap-0 text-xs/5 text-zinc-500">
                  {matches.map((match) => (
                    <Link
                      href={`/match-control/${match.match_id}`}
                      className="group flex flex-wrap gap-1"
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
              href={leagues.length > 0 ? `/organizations/${selectedOrganization.organization_id}/leagues` : undefined}
              title="Leagues"
              CreateDialog={
                <CreateLeagueDialog
                  skeleton
                  organization-id={selectedOrganization.organization_id}
                  className="!text-zinc-500"
                >
                  Create another league
                </CreateLeagueDialog>
              }
              contents={
                <div className="flex flex-col gap-0 text-xs/5 text-zinc-500">
                  {leagues.map((record) => (
                    <Link
                      href={`/organizations/${selectedOrganization.organization_id}/teams/${record.league_id}`}
                      className="group flex gap-1"
                      key={record.league_id}
                    >
                      <span className="flex-1 font-bold group-hover:text-lime-500">{record.name}</span>
                    </Link>
                  ))}
                  {leagues.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                      <span>No league yet</span>

                      <CreateLeagueDialog
                        plain
                        organization-id={selectedOrganization.organization_id}
                        className="!text-xs/4 underline"
                      >
                        + Create one
                      </CreateLeagueDialog>
                    </div>
                  )}
                </div>
              }
            />

            {/* Create a team */}
            <Card
              href={teams.length > 0 ? `/organizations/${selectedOrganization.organization_id}/teams` : undefined}
              title="Teams"
              CreateDialog={
                <TeamDialog
                  skeleton
                  organization-id={selectedOrganization.organization_id}
                  className="!text-zinc-500"
                  leagues={leagues}
                >
                  Add another team
                </TeamDialog>
              }
              contents={
                <div className="flex flex-col gap-0 text-xs/5 text-zinc-500">
                  {teams.map((team) => (
                    <Link
                      href={`/organizations/${selectedOrganization.organization_id}/teams/${team.team_id}`}
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
                        organization-id={selectedOrganization.organization_id}
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
                        organization-id={selectedOrganization.organization_id}
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
              title="Organization Members"
              href={`/organizations/${selectedOrganization.organization_id}/members`}
              CreateDialog={
                <InviteMemberDialog
                  className="!text-zinc-500"
                  skeleton
                  organization-id={selectedOrganization.organization_id}
                >
                  Invite another member
                </InviteMemberDialog>
              }
              contents={
                <div className="flex flex-col gap-0 text-xs/5 text-zinc-500">
                  {selectedOrganization.members.map((rec) => (
                    <Link
                      href={`/organizations/${selectedOrganization.organization_id}/members/${rec.user_id}`}
                      className="group flex gap-1"
                      key={rec.user_id}
                    >
                      <Avatar
                        src={rec.user.image ? `/api/files/${rec.user.image}` : null}
                        initials={rec.user.image ? undefined : [rec.user.first_name[0], rec.user.last_name[0]].join('')}
                        className="size-4"
                        center
                      />
                      <span>{[rec.user.last_name, rec.user.first_name].filter(Boolean).join(', ')}</span>
                      <span className="flex-1 font-bold capitalize group-hover:text-lime-500"></span>

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
                        organization-id={selectedOrganization.organization_id}
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
        </>
      )}
      <div className="mt-4 hidden gap-8 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Total revenue" value="$2.6M" change="+4.5%" />
        <Stat title="Average order value" value="$455" change="-0.5%" />
        <Stat title="Tickets sold" value="5,888" change="+4.5%" />
        <Stat title="Pageviews" value="823,067" change="+21.2%" />
      </div>
    </>
  )
}
