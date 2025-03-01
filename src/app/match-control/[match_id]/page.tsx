'use client'

import { Divider } from '@/components/divider'
import { Subheading } from '@/components/heading'
import ScoreBoardSection from '@/components/matches/scoreboard.section'
import Spinner from '@/components/spinner'
import { formatDateTime } from '@/lib/date-helper'
import { getMatch, MatchRecord } from '@/services/match.service'
import { CalendarIcon, MapPinIcon } from '@heroicons/react/16/solid'
import { notFound, useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export default function MatchControlPage() {
  const params = useParams()
  const [errorCode, setErrorCode] = useState<number>()
  const [match, setMatch] = useState<MatchRecord>()

  const loadMatch = useCallback(async () => {
    const res = await getMatch(params.match_id as string)
    if (res.status > 299) {
      setErrorCode(res.status)
    }
    setMatch(res)
    //   .catch((err) => {
    //     console.log('err', err.message)
    //     setErrorCode(404)
    //   })
  }, [params.match_id])

  useEffect(() => {
    loadMatch()
  }, [])

  if (errorCode) notFound()

  return (
    <div>
      {match?.league ? (
        <div className="mt-4 lg:mt-8">
          <div className="mb-4 flex items-center justify-center gap-4 text-xs font-bold text-zinc-400">
            {match.league.name}
          </div>
          <ScoreBoardSection match={match} />
          <Divider className="my-8" />
          <section className="text-center">
            <Subheading>Game Information</Subheading>
            <div className="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4 text-xs">
              <div className="flex w-full flex-wrap items-center justify-center gap-x-10 gap-y-4 py-1.5">
                <span className="flex items-center gap-3 text-zinc-950 dark:text-white">
                  <MapPinIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
                  <span>{match.location}</span>
                </span>
                <span className="flex items-center gap-3 text-zinc-950 dark:text-white">
                  <CalendarIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
                  <span>{formatDateTime(new Date(match.match_date))}</span>
                </span>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <Spinner />
      )}
    </div>
  )
}
