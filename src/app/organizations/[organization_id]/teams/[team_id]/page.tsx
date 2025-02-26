import { Stat } from '@/app/stat'
import { Avatar } from '@/components/avatar'
import { Heading } from '@/components/heading'
import { InviteMemberDialog } from '@/components/organizations/member.dialog'
import { CreatePlayerDialog } from '@/components/organizations/player.dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { getOrganization, Player } from '@/models/organization'
import type { Metadata } from 'next'
import { getTeam } from '../actions'
import { TeamDropdown } from '../dropdown'

export const metadata: Metadata = {
  title: 'Members',
}

export default async function TeamPage(props: { params: Promise<unknown> }) {
  const { organization_id, team_id } = (await props.params) as { organization_id: string; team_id: string }
  const [organization, team] = await Promise.all([getOrganization(organization_id), team_id ? getTeam(team_id) : null])

  return (
    <>
      <div>
        <div className="relative flex w-1/3">
          <TeamDropdown data={organization.teams || []} anchor="bottom start" className="w-56" selected={team_id} />
        </div>
        <div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          <Stat title="Goals scored" value="36" change="0.5%" />
          <Stat title="Assists" value="25" change="0.5%" />
          <Stat title="Clean sheets" value="12" change="+4.5%" />
          <Stat title="Fouls" value="22" change="+21.2%" />
        </div>
      </div>
      <div className="my-12" />
      <div className="mt-24 flex justify-between">
        <Heading>Coaches / Parents</Heading>

        <InviteMemberDialog team-id={team_id}>Invite</InviteMemberDialog>
      </div>
      <Table className="mt-8 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
        <TableHead>
          <TableRow>
            <TableHeader>First name</TableHeader>
            <TableHeader>Last name</TableHeader>
            <TableHeader className="text-right">Role</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {team?.members.map((record) => {
            return (
              <TableRow
                key={record.team_member_id}
                href={`${record.team_id}/member/${record.team_member_id}`}
                title={`${record.team_member_id}`}
              >
                <TableCell>{record.user.first_name}</TableCell>
                <TableCell>
                  <span>{record.user.last_name}</span>
                </TableCell>
                <TableCell className="text-right capitalize">{record.role}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <div className="mt-24 flex justify-between">
        <Heading>Players</Heading>
        <CreatePlayerDialog team-id={team_id}>Add player</CreatePlayerDialog>
      </div>
      <Table className="mt-8 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
        <TableHead>
          <TableRow>
            <TableHeader>
              <div className="flex items-center gap-4">
                <span className="w-6" />
                <span>Jersey #</span>
              </div>
            </TableHeader>
            <TableHeader>Name</TableHeader>
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
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar src={`/api/files/${record.player.photo}`} className="size-6" />
                    {record.jersey_number}
                  </div>
                </TableCell>
                <TableCell>
                  {record.player.last_name}, {record.player.first_name}
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
