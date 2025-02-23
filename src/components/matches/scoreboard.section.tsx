'use client'
import SpinningSoccer from '@/images/soccer.gif'
import { getCookies } from '@/lib/cookie-cutter'
import { CreateMatch, createMatchEvent } from '@/services/match.service'
import { PauseCircleIcon, PlayCircleIcon, XCircleIcon } from '@heroicons/react/20/solid'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Dialog, DialogBody } from '../dialog'
import { Divider } from '../divider'
import { Subheading } from '../heading'
import { EventDialog } from './event.dialog'

export default function ScoreBoardSection({ match }: { match: CreateMatch }) {
  const homeSide = {
    score: match.home_or_away === 'home' ? match.goals_for : match.goals_against,
    team: match.home_or_away === 'home' ? match.team.name : match.opponent,
  }
  const awaySide = {
    score: match.home_or_away === 'away' ? match.goals_for : match.goals_against,
    team: match.home_or_away === 'away' ? match.team.name : match.opponent,
  }
  const cookieList = getCookies()

  const logEvent = useCallback(async (payload: { [k: string]: string }) => {
    const res = await createMatchEvent(payload)
  }, [])

  const events: {
    event_type: string
    player_id: string
    event_time: string
    video_url?: string
    player: {
      jersey_number: string
      player_id: string
      position: string
      first_name: string
      last_name: string
    }
  }[] = match.events.map(({ event_type, player_id, event_time, video_url }: { [k: string]: string }) => {
    const player = match.team.players.find((player: { [k: string]: string }) => player_id === player.player_id)
    return {
      event_type,
      player_id,
      event_time,
      video_url,
      player: {
        ...player,
        first_name: player.player.first_name,
        last_name: player.player.last_name,
        player: undefined,
      },
    }
  })

  return (
    <>
      <div className="flex items-center justify-center gap-4 text-center">
        <section className="flex w-2/5 flex-col gap-2">
          <div className="mx-auto w-full overflow-hidden rounded-full">
            <EventDialog
              plain
              match={match}
              event="goal"
              side="home"
              className="font-mono !text-8xl"
              onSubmit={console.log}
              disabled={!Boolean(cookieList.user_id)}
            >
              0
            </EventDialog>
          </div>
          <div className="mb-2 text-xs font-bold lg:text-xs">{homeSide.team}</div>
        </section>
        <section className="flex-1 text-xs font-bold">Halftime</section>
        <section className="flex w-2/5 flex-col gap-2">
          <div className="mx-auto w-full overflow-hidden rounded-full">
            <EventDialog
              plain
              match={match}
              event="goal"
              side="away"
              className="font-mono !text-8xl"
              onSubmit={(payload: unknown) => {
                logEvent(payload as { [k: string]: string })
              }}
              disabled={!Boolean(cookieList.user_id)}
            >
              0
            </EventDialog>
          </div>
          <div className="mb-2 text-xs font-bold lg:text-xs">{awaySide.team}</div>
        </section>
      </div>
      <div className="mt-6 flex justify-center gap-4 text-center">
        <section className="flex w-1/2 flex-col gap-1 text-right">
          {match.home_or_away === 'home' &&
            events.map((matchEvent) => (
              <EventRow
                key={[
                  matchEvent.player.player_id || matchEvent.player.jersey_number || '',
                  matchEvent.event_type,
                  matchEvent.event_time,
                ]
                  .map(Boolean)
                  .join('-')}
                name={matchEvent.player.first_name || `${match.opponent} player`}
                minute={matchEvent.event_time}
                video-url={matchEvent.video_url}
                event={matchEvent.event_type as 'goal' | 'yellow_card' | 'red_card'}
              />
            ))}
        </section>
        <section className="flex w-1/2 flex-col gap-1 text-left">
          {match.home_or_away === 'away' &&
            events.map((matchEvent) => (
              <EventRow
                key={[
                  matchEvent.player.player_id || matchEvent.player.jersey_number || '',
                  matchEvent.event_type,
                  matchEvent.event_time,
                ]
                  .filter(Boolean)
                  .join('-')}
                name={matchEvent.player.first_name || `${match.team.name} player`}
                minute={matchEvent.event_time}
                video-url={matchEvent.video_url}
                event={matchEvent.event_type as 'goal' | 'yellow_card' | 'red_card'}
                away
              />
            ))}
        </section>
      </div>

      <Divider className="my-8 hidden" />
      <section className="hidden text-center">
        <Subheading>Yellow Cards</Subheading>

        <EventDialog plain match={match} event="yellow_card" className="!px-0" onSubmit={console.log}>
          <span className="relative w-full text-left">
            <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-amber-400"></span>
          </span>
        </EventDialog>
      </section>
      <Divider className="my-8 hidden" />
      <section className="hidden text-center">
        <Subheading>Red Cards</Subheading>

        <EventDialog plain match={match} event="red_card" className="!px-0" onSubmit={console.log}>
          <span className="relative w-full text-left">
            <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-amber-400"></span>
          </span>
        </EventDialog>
      </section>
    </>
  )
}

function EventRow({
  name,
  minute,
  event,
  away,
  'video-url': video_url,
}: {
  name: string
  minute: string
  event: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'save'
  away?: boolean
  'video-url'?: string
}) {
  let [isOpen, setIsOpen] = useState(false)
  let [isPlaying, togglePlaying] = useState(false)
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (video?.current) {
      isPlaying ? video?.current?.play() : video?.current?.pause()
    }
  }, [isPlaying])
  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`flex w-full items-center justify-end gap-1 text-[0.65rem] font-bold ${away && 'flex-row-reverse'}`.trim()}
      >
        <span>
          {name} {minute}'
        </span>
        {event === 'goal' && (
          <span className="h-3 w-3 overflow-hidden rounded-full bg-white">
            <Image src={SpinningSoccer} width={12} height={12} alt="goal" />
          </span>
        )}
        {event === 'yellow_card' && <div className="mx-0.5 h-3 w-2 rotate-12 rounded-xs bg-yellow-500" />}
        {event === 'red_card' && <div className="mx-0.5 h-3 w-2 rotate-12 rounded-xs bg-red-500" />}
      </button>

      <Dialog
        size="3xl"
        open={isOpen}
        onClose={() => {
          setIsOpen(false)
        }}
        className="relative overflow-hidden !p-0"
      >
        <DialogBody className="relative !my-0 !p-0">
          <div className="-mx-28 -my-12">
            <video width="1920" height="auto" id="event-video" ref={video} loop>
              <source src={video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </DialogBody>
        <div className="absolute top-0 left-0 flex h-full w-full items-center justify-center opacity-0 hover:opacity-100">
          <button
            type="button"
            onClick={() => {
              togglePlaying(!isPlaying)
            }}
            className="w-24 font-bold text-white opacity-40"
            aria-label="play"
          >
            {isPlaying ? <PauseCircleIcon className="size-24" /> : <PlayCircleIcon className="size-24" />}
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false)
          }}
          className="absolute top-4 right-4 font-bold text-black opacity-40"
          aria-label="close"
        >
          <XCircleIcon className="size-8" />
        </button>
      </Dialog>
    </>
  )
}
