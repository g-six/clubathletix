import { Button } from '@/components/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { getMySessionAndOrganization, Player } from '@/models/organization'
import { Team, TeamMember } from '@prisma/client'
import type { Metadata } from 'next'
import { getTeam } from '../actions'
import { TeamDropdown } from '../dropdown'

export const metadata: Metadata = {
  title: 'Members',
}

export default async function TeamPage(props: { params: Promise<unknown> }) {
  const { organization_id, team_id } = (await props.params) as { organization_id: string; team_id: string }
  const [organization, team] = await Promise.all([
    getMySessionAndOrganization(organization_id),
    team_id ? getTeam(team_id) : null,
  ])
  const my_teams = organization.session.team_members
    .filter((m: TeamMember) => m.organization_id === organization_id)
    .map((m: TeamMember & { team: Team }) => m.team)
  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div className="relative flex w-1/3">
          <TeamDropdown data={my_teams || []} anchor="bottom start" className="w-56" selected={team_id} />
        </div>
        <Button className="-my-0.5">Add player</Button>
      </div>
      <Table className="mt-8 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Jersey #</TableHeader>
            <TableHeader>First name</TableHeader>
            <TableHeader>Last name</TableHeader>
            <TableHeader className="text-right">Position</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {team?.players.map((record: Player) => {
            return (
              <TableRow
                key={record.player_id}
                href={`${record.team_id}/player/${record.team_player_id}`}
                title={`Member #${record.player_id}`}
              >
                <TableCell>{record.jersey_number || <span className="text-xs text-zinc-600">N/A</span>}</TableCell>
                <TableCell>{record.player.first_name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {/* <Avatar src={record.event.thumbUrl} className="size-6" /> */}
                    <span>{record.player.last_name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">{record.position}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </>
  )
}
