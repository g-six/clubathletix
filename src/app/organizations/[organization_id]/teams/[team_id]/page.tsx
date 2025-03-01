import { Stat } from '@/app/stat'
import { Avatar } from '@/components/avatar'
import { Button } from '@/components/button'
import { Field, Label } from '@/components/fieldset'
import { Heading } from '@/components/heading'
import { Input } from '@/components/input'
import { InviteMemberDialog } from '@/components/organizations/member.dialog'
import { CreatePlayerDialog, FindPlayerDialog } from '@/components/organizations/player.dialog'
import { PhotoUploader } from '@/components/photo-uploader'
import { Select } from '@/components/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { getOrganization, Player } from '@/models/organization'
import { updateTeam } from '@/models/team'
import { EllipsisVerticalIcon } from '@heroicons/react/16/solid'
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
      <div className="mt-24 flex flex-col justify-between gap-4">
        <Heading>Team information</Heading>
        <form
          className="flex flex-col items-end gap-4"
          action={async (formData) => {
            'use server'
            updateTeam(formData).then(console.log).catch(console.error)
          }}
        >
          <input type="hidden" name="team_id" value={team?.team_id} />
          <div className="mt-2 grid w-full grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3 xl:grid-cols-6">
            <div className="pt-1 xl:col-span-1">
              <div className="w-full">
                <PhotoUploader name="logo" data-default={team?.logo} />
              </div>
            </div>
            <Field className="xl:col-span-3">
              <Label>Name</Label>
              <Input name="name" defaultValue={team?.name} />
            </Field>
            <Field className="xl:col-span-1">
              <Label>Age Group</Label>
              <Select name="age_group" defaultValue={team?.age_group}>
                {Array.from({ length: 15 }, (_, i) => i + 7).map((x) => (
                  <option value={`U${x}`} key={`U${x}`}>{`U${x}`}</option>
                ))}
                <option value="adult">Adult</option>
              </Select>
            </Field>
            <Field className="xl:col-span-1">
              <Label>Division</Label>
              <Select name="division" defaultValue={team?.division}>
                <option value="PL">PL</option>
                <option value="1">1</option>
                <option value="1A">1A</option>
                <option value="1B">1B</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </Select>
            </Field>
          </div>
          <div>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
      <div className="my-12" />
      <div className="mt-24 flex justify-between">
        <Heading>Coaches / Parents</Heading>

        <InviteMemberDialog team-id={team_id}>Invite</InviteMemberDialog>
      </div>
      <Table className="mt-8 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
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
                <TableCell>
                  {record.user.image && (
                    <Avatar src={`/api/files/${record.user.image}`} className="mr-2 size-6 overflow-clip" />
                  )}
                  <span>{record.user.last_name}</span>
                  <span>
                    {record.user.last_name && record.user.first_name && ', '}
                    {record.user.first_name}
                  </span>
                </TableCell>
                <TableCell className="text-right capitalize">{record.role}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <div className="mt-24 flex justify-between">
        <Heading>Players</Heading>
        <div className="flex gap-4">
          <FindPlayerDialog team-id={team_id}>Add an existing player</FindPlayerDialog>
          <CreatePlayerDialog team-id={team_id} members={team?.members || []}>
            Add player
          </CreatePlayerDialog>
        </div>
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
                    {record.player.photo ? (
                      <Avatar src={`/api/files/${record.player.photo}`} className="size-6" />
                    ) : (
                      <EllipsisVerticalIcon className="mx-1 size-4" />
                    )}
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
