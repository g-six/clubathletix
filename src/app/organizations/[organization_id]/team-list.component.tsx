'use client'
import { Avatar } from '@/components/avatar'
import { Subheading } from '@/components/heading'
import { FutbolSpinner } from '@/components/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { formatYmdHm } from '@/lib/date-helper'
import { SessionTeam } from '@/typings/team'
import { useEffect, useState } from 'react'
export default function TeamList({ data, ...props }: { 'data-organization': string; data: SessionTeam[] }) {
  const [records, setRecords] = useState<typeof data>([])
  const [isLoading, toggleLoading] = useState(true)

  useEffect(() => {
    setRecords(data)
    toggleLoading(false)
  }, [])

  return (
    <div data-organization={props['data-organization']}>
      <Subheading className="mt-14">Teams</Subheading>
      {isLoading && (
        <div className="my-6 flex items-center gap-2 text-xs font-bold italic">
          <FutbolSpinner twSize="w-4" />
          <span>Loading...</span>
        </div>
      )}
      {!isLoading && (
        <Table className="mt-4 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
          <TableHead>
            <TableRow>
              <TableHeader>Date established</TableHeader>

              <TableHeader>Name</TableHeader>
              <TableHeader>Coach</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => (
              <TableRow
                key={record.team_id}
                href={`/organizations/${props['data-organization']}/teams/${record.team_id}`}
                title={record.team_id.name}
              >
                <TableCell className="w-48 font-mono text-xs text-zinc-500">
                  {formatYmdHm(record.created_at).substring(0, 12)}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={record.logo ? `/api/files/${record.logo}` : null}
                      initials={
                        record.short_name ||
                        record.name
                          .split(' ')
                          .map((w: string) => w[0].toUpperCase())
                          .filter((w: string) => w && isNaN(Number(w)))
                          .join('')
                      }
                      className="size-6"
                      center
                    />
                    {record.name}
                  </div>
                </TableCell>
                <TableCell className="flex flex-col text-right text-xs capitalize">
                  {record.members
                    .filter((m) => m.role.toLowerCase().includes('coach'))
                    .map((m) => (
                      <span key={m?.user.user_id}>
                        {m?.user.last_name}, {m?.user.first_name}
                      </span>
                    ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
