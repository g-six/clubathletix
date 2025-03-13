'use client'
import { Avatar } from '@/components/avatar'
import { Subheading } from '@/components/heading'
import { FutbolSpinner } from '@/components/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { formatYmdHm } from '@/lib/date-helper'
import { User } from '@prisma/client'
import { useEffect, useState } from 'react'
export default function RegisteredUsersTable({
  data,
  ...props
}: {
  'data-organization': string
  data: {
    team_member_id: string
    user_id: string
    team_id: string
    role: string
    user: Pick<User, 'first_name' | 'last_name' | 'email' | 'phone' | 'image' | 'created_at'>
  }[]
}) {
  const [records, setRecords] = useState<typeof data>([])
  const [isLoading, toggleLoading] = useState(true)

  useEffect(() => {
    setRecords(data)
    toggleLoading(false)
  }, [])

  return (
    <div data-organization={props['data-organization']}>
      <Subheading className="mt-14">Recent registrations</Subheading>
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
              <TableHeader>Date registered</TableHeader>

              <TableHeader>Name</TableHeader>
              <TableHeader className="text-right">Role</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {records
              .sort((a, b) => new Date(`${b.user.created_at}`).getTime() - new Date(`${a.user.created_at}`).getTime())
              .map((record) => (
                <TableRow
                  key={record.team_member_id}
                  href={`/organizations/${props['data-organization']}/members/${record.team_member_id}`}
                  title={record.user.first_name}
                >
                  <TableCell className="w-48 font-mono text-xs text-zinc-500">
                    {formatYmdHm(record.user.created_at)}
                  </TableCell>

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
                      <span>
                        {record.user.last_name || ''}
                        {record.user.last_name && ', '}
                        {record.user.first_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right capitalize">{record.role.toLowerCase()}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
