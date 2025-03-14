'use client'

import { Badge } from '@/components/badge'
import { Card } from '@/components/card'
import { MatchDialog } from '@/components/organizations/match.dialog'
import { formatDateTime } from '@/lib/date-helper'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function MatchesCard() {
  const params = usePathname()
  const [records, setRecords] = useState<{ [k: string]: string }[]>([])
  const [selectedOrganization, selectOrganization] = useState<{ [k: string]: string }>({})
  console.log(params)
  return (
    <Card
      title="Upcoming matches"
      CreateDialog={
        <MatchDialog skeleton teams={[]}>
          Add match
        </MatchDialog>
      }
      href={`/organizations/${selectedOrganization?.organization_id}/matches`}
      contents={
        <div className="flex flex-col gap-0 text-xs/5 text-zinc-500">
          {records.map((record) => (
            <Link
              href={`/match-control/${record.match_id}`}
              className="group flex flex-wrap gap-1"
              key={record.match_id}
            >
              <span className="font-bold underline group-hover:text-lime-500">{record.team.name}</span>
              <span>vs.</span>
              <span className="flex-1 group-hover:text-zinc-200">{record.opponent}</span>
              <span className="w-full sm:hidden" />
              <Badge color="pink" text-size="text-xs/5 sm:text-[0.65rem]/3">
                {formatDateTime(new Date(record.match_date))}
              </Badge>
              <span className="h-2 w-full sm:hidden" />
            </Link>
          ))}
          {/* {matches.length === 0 && <span>No upcoming matches</span>} */}
        </div>
      }
    />
  )
}
