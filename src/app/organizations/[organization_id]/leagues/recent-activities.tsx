'use client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { getAvailableLeaguesForOrganization } from '@/services/league.service'
import { useEffect, useState } from 'react'
export default function RecentActivities(props: { 'organization-id': string }) {
  const [isLoading, toggleLoading] = useState(true)
  const [leagues, setLeagues] = useState<
    {
      league_id: string
      name: string
      start_date: string
      end_date: string
    }[]
  >([])

  useEffect(() => {
    getAvailableLeaguesForOrganization(props['organization-id'])
      .then(setLeagues)
      .finally(() => {
        toggleLoading(false)
      })
  }, [])
  return (
    <>
      <Table className="mt-4 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
        <TableHead>
          <TableRow>
            <TableHeader>League</TableHeader>
            <TableHeader>Begins</TableHeader>
            <TableHeader>Ends</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {leagues
            .filter((league) => new Date(league.end_date) > new Date())
            .map((league, idx) => (
              <TableRow
                key={`${league.league_id || idx}`}
                href={`leagues/${league.league_id}`}
                title={`${league.name}`}
              >
                <TableCell className="w-2/3">{league.name}</TableCell>
                <TableCell>{league.start_date}</TableCell>
                <TableCell>{league.end_date}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {isLoading && (
        <p className="w-full py-8 text-center text-xs/3 text-zinc-400">
          <img title="loading" src="/loaders/default.gif" className="mx-auto size-8 rounded-full bg-white" />
          <br />
          <span>Loading...</span>
        </p>
      )}
    </>
  )
}
