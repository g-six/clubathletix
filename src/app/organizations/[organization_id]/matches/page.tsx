import { Subheading } from '@/components/heading'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { formatDateTime } from '@/lib/date-helper'
import { getMatchesByOrganizationId } from '@/models/match'

export default async function OrganizationMatchesPage({ params }: { params: Promise<{ organization_id: string }> }) {
  const { organization_id } = await params

  const matches = await getMatchesByOrganizationId(organization_id)
  console.log(matches)
  return (
    <>
      <Subheading className="mt-12">{matches?.[0]?.organization?.name} Teams</Subheading>
      <Table className="mt-4 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Opponent</TableHeader>
            <TableHeader>Date & Time</TableHeader>
            <TableHeader className="text-right">Location</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {matches.map((record) => (
            <TableRow key={record.match_id} href={record.match_id} title={`${record.team_id} #${record.opponent}`}>
              <TableCell>{record.team.name}</TableCell>
              <TableCell>{record.opponent}</TableCell>
              <TableCell className="text-zinc-500">{formatDateTime(new Date(record.match_date))}</TableCell>
              <TableCell className="text-right">{record.location}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
