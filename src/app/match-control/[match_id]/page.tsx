'use client'
import { Divider } from '@/components/divider'
import { Field, Label } from '@/components/fieldset'
import { Heading, Subheading } from '@/components/heading'
import ScoreBoardSection from '@/components/matches/scoreboard.section'
import { Select } from '@/components/select'
import Spinner from '@/components/spinner'
import { formatDateTime, getLengthInMinutes } from '@/lib/date-helper'
import { getMatch, MatchRecord } from '@/services/match.service'

import { CalendarIcon, ClockIcon, MapPinIcon } from '@heroicons/react/16/solid'
import { ArrowLeftIcon } from '@heroicons/react/20/solid'
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
  }, [params.match_id])

  useEffect(() => {
    loadMatch()
  }, [])

  if (errorCode) notFound()

  console.log(match)

  return (
    <div className="relative">
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
              <div className="flex w-full flex-col items-center justify-center gap-x-10 gap-y-4 py-1.5">
                <span className="flex items-center gap-3 text-zinc-950 dark:text-white">
                  <MapPinIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
                  <span>{match.location}</span>
                </span>
                <span className="flex items-center gap-3 text-zinc-950 dark:text-white">
                  <CalendarIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
                  <span>{formatDateTime(new Date(match.match_date))}</span>
                </span>
                {match.fh_start && match.fh_end && (
                  <span className="flex items-center gap-3 text-zinc-950 dark:text-white">
                    <ClockIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
                    <span>First half {getLengthInMinutes(`${match.fh_start}`, `${match.fh_end}`)}</span>
                  </span>
                )}
                {match.sh_start && match.sh_end && (
                  <span className="flex items-center gap-3 text-zinc-950 dark:text-white">
                    <ClockIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
                    <span>Second half {getLengthInMinutes(`${match.sh_start}`, `${match.sh_end}`)}</span>
                  </span>
                )}
              </div>
            </div>
          </section>
        </div>
      ) : (
        <Spinner />
      )}
      <section className="mt-6 flex">
        {match?.home_or_away === 'away' && <div className="w-1/2" />}
        <div className={`${match?.home_or_away === 'away' ? 'pl-6' : 'pr-6 text-right'} w-1/2`}>
          <Heading>Line-up</Heading>
          {match?.team.players.map((record) => (
            <div key={record.player_id}>
              <Field className="flex items-center gap-1">
                <Label className="flex-grow">{record.player.first_name}</Label>
                <Select name={record.player_id} className="!w-20">
                  <option disabled>Pos</option>
                  {[
                    'ST',
                    'CF',
                    'LW',
                    'RW',
                    'LM',
                    'RM',
                    'CAM',
                    'CM',
                    'CDM',
                    'RB',
                    'RWB',
                    'LB',
                    'LWB',
                    'CB',
                    'RCB',
                    'LCB',
                    'GK',
                    'SUB',
                  ].map((position) => (
                    <option key={position} className="capitalize">
                      {position}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          ))}
        </div>
      </section>
      <ArrowLeftIcon
        role="button"
        onClick={() => window.history.back()}
        className="absolute top-0 left-2 size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500"
      />
    </div>
  )
}
