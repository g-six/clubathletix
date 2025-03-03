'use client'
import SpinningSoccer from '@/images/soccer.gif'
import { createMatchEvent, MatchRecord, startMatch, stopMatch } from '@/services/match.service'
import { PauseCircleIcon, PlayCircleIcon, XCircleIcon } from '@heroicons/react/20/solid'
import { MatchEvent, Player } from '@prisma/client'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '../button'
import { Dialog, DialogBody } from '../dialog'
import { Divider } from '../divider'
import { Subheading } from '../heading'
import { VideoUploader } from '../video-uploader'
import { EventDialog } from './event.dialog'

type MatchEventWithPlayer = MatchEvent & {
  opponent_number: string
  player: Player & {
    first_name: string
    last_name: string
  }
}
export default function ScoreBoardSection({ match }: { match: MatchRecord }) {
  const homeSide = {
    score: match.home_or_away === 'home' ? match.goals_for : match.goals_against,
    team: match.home_or_away === 'home' ? match.team.name : match.opponent,
  }
  const awaySide = {
    score: match.home_or_away === 'away' ? match.goals_for : match.goals_against,
    team: match.home_or_away === 'away' ? match.team.name : match.opponent,
  }

  const teamAdmin = match.team?.members?.find((member) => member.role !== 'parent')

  const [events, setEvents] = useState<MatchEventWithPlayer[]>(
    match.events.map((matchEvent) => {
      const player = match.team.players.find((player) => matchEvent.player_id === player.player_id)

      return {
        ...matchEvent,
        player: {
          ...player,
          first_name: player?.player.first_name,
          last_name: player?.player.last_name,
          player: undefined,
        },
      } as unknown as MatchEventWithPlayer
    })
  )

  let [timeElapsed, setTimeElapsed] = useState<string>('0')

  const logEvent = useCallback(
    async (payload: { [k: string]: string }) => {
      const res = await createMatchEvent({
        ...payload,
        logged_at: timeElapsed,
      })
    },
    [match, timeElapsed]
  )

  useEffect(() => {
    if (match.fh_end && match.sh_end && !match.otfh_start) return

    const intervalId = setInterval(() => {
      let num = 0
      let pad = 0
      if (match.fh_start && match.fh_end && match.sh_start && !match.sh_end) {
        pad = match.regular_length || 0
        num = Date.now() - new Date(match.sh_start).getTime()
      } else if (match.fh_start && !match.fh_end) num = Date.now() - new Date(match.fh_start).getTime()
      else if (match.fh_end && !match.sh_start) {
        if (match.sizing === 'halves') num = (match.regular_length || 0) * 60000
      } else if (match.sh_start && match.sh_end) {
        if (match.sizing === 'halves') num = (match.regular_length || 0) * 120000
      }

      const minutes = Math.floor(num / 60000) + pad
      const seconds = Math.floor(num / 1000) % 60
      setTimeElapsed(`${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [timeElapsed])

  return (
    <>
      <div className="flex items-center justify-center gap-4 text-center">
        <section className="flex w-1/5 flex-col gap-2 sm:w-2/5">
          <div className="mx-auto w-full overflow-hidden rounded-full">
            <EventDialog
              plain
              match={match}
              event="goal"
              side="home"
              className="font-mono !text-2xl sm:!text-8xl"
              onSubmit={(payload: unknown) => {
                logEvent(payload as { [k: string]: string })
              }}
              disabled={!teamAdmin}
            >
              0
            </EventDialog>
          </div>
          <div className="mb-2 text-xs font-bold lg:text-xs">{homeSide.team}</div>
        </section>
        <section>
          <GameActionButton match={match} write-mode={Boolean(teamAdmin)} />
        </section>
        <section className="flex w-1/5 flex-col gap-2 sm:w-2/5">
          <div className="mx-auto w-full overflow-hidden rounded-full">
            <EventDialog
              plain
              match={match}
              event="goal"
              side="away"
              className="font-mono !text-2xl sm:!text-8xl"
              onSubmit={(payload: unknown) => {
                logEvent(payload as { [k: string]: string })
              }}
              disabled={!teamAdmin}
            >
              0
            </EventDialog>
          </div>
          <div className="mb-2 text-xs font-bold lg:text-xs">{awaySide.team}</div>
        </section>
      </div>
      <div className="mt-6 flex justify-center gap-4 text-center">
        <section className="flex w-1/2 flex-col gap-1 text-right">
          {events
            .filter((me) => me.logged_at && (match.home_or_away === 'home' ? me.player_id : me.opponent_number))
            .map((matchEvent) => (
              <EventRow
                key={[
                  matchEvent.player_id || matchEvent.opponent_number || '',
                  matchEvent.event_type,
                  matchEvent.logged_at,
                ]
                  .map(Boolean)
                  .join('-')}
                name={matchEvent.player.first_name || `${match.opponent} #${matchEvent.opponent_number}`}
                at={matchEvent.logged_at || ''}
                video-url={matchEvent.video_url}
                match={match}
                match-event-id={matchEvent.match_event_id as string}
                event={matchEvent.event_type as 'goal' | 'yellow_card' | 'red_card'}
              />
            ))}
        </section>
        <section className="flex w-1/2 flex-col gap-1 text-left">
          {match.home_or_away === 'away' &&
            events
              .filter((me) => me.logged_at && (match.home_or_away === 'away' ? me.player_id : me.opponent_number))
              .map((matchEvent) => (
                <EventRow
                  key={[
                    matchEvent.player_id || matchEvent.opponent_number || '',
                    matchEvent.event_type,
                    matchEvent.logged_at,
                  ]
                    .filter(Boolean)
                    .join('-')}
                  match-event-id={matchEvent.match_event_id as string}
                  name={matchEvent.player.first_name || `${match.opponent} #${matchEvent.opponent_number}`}
                  at={matchEvent.logged_at || ''}
                  video-url={matchEvent.video_url}
                  match={match}
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
  at,
  event,
  away,
  match,
  'match-event-id': match_event_id,
  'video-url': video_url,
}: {
  name: string
  at: string
  event: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'save'
  away?: boolean
  match: MatchRecord
  'match-event-id': string
  'video-url'?: string | null
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
          {name} {Number(at.split(':')[0])}'
        </span>
        {event === 'goal' && (
          <span className="h-3 w-3 overflow-hidden rounded-full bg-white">
            <Image src={SpinningSoccer} width={12} height={12} alt="goal" />
          </span>
        )}
        {event === 'yellow_card' && <div className="mx-0.5 h-3 w-2 rotate-12 rounded-xs bg-yellow-500" />}
        {event === 'red_card' && <div className="mx-0.5 h-3 w-2 rotate-12 rounded-xs bg-red-500" />}
      </button>

      {
        <Dialog
          size="3xl"
          open={isOpen}
          onClose={() => {
            setIsOpen(false)
          }}
          className="relative overflow-hidden !p-0"
        >
          <DialogBody className={`relative !my-0 !p-0 ${video_url ? '' : 'bg-black'}`}>
            {video_url ? (
              <div className="-mx-28 -my-12">
                <video width="1920" height="auto" id="event-video" ref={video} loop>
                  <source src={`/api/files/${video_url}`} />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="relative flex aspect-video w-[720px] flex-col items-center justify-center">
                <div className="absolute top-1/2 ml-12 w-full -translate-y-1/2">
                  <VideoUploader
                    name="video"
                    className="bg-transparent"
                    label={`Upload a video for ${name}'s ${at.split(':')?.[0] ? `${Number(at.split(':')?.[0])}' ` : ''}${event}`.trim()}
                    data={{
                      match_id: match?.match_id,
                      match_event_id,
                      title:
                        `${name?.[0].toUpperCase()}${name.slice(1)}'s ${at.split(':')?.[0] ? `${Number(at.split(':')?.[0])}' ` : ''}${event}`.trim(),
                    }}
                  />
                </div>
              </div>
            )}
          </DialogBody>
          {Boolean(video_url) && (
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
          )}
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
      }
    </>
  )
}

function GameActionButton(props: { match: MatchRecord; 'write-mode': boolean }) {
  let [timeElapsed, setTimeElapsed] = useState<string>('0')
  const [match, setMatch] = useState(props.match)
  let [buttonLabel, setButtonLabel] = useState<
    'start match' | 'end 1st half' | 'end 2nd half' | 'start 2nd half' | 'end match'
  >('start match')

  function updateLabel() {
    if (match.fh_start && !match.fh_end) {
      setButtonLabel('end 1st half')
    } else if (match.fh_end && !match.sh_start) {
      setButtonLabel('start 2nd half')
    } else if (match.sh_start && !match.sh_end) {
      setButtonLabel('end 2nd half')
    }
  }

  function updateInterval() {
    let num = 0
    let pad = 0
    if (match.fh_start && match.fh_end && match.sh_start && !Boolean(match.sh_end)) {
      pad = match.regular_length || 0
      num = Date.now() - new Date(match.sh_start).getTime()
    } else if (match.fh_start && !Boolean(match.fh_end)) num = Date.now() - new Date(match.fh_start).getTime()
    else if (match.fh_end && !Boolean(match.sh_start)) {
      if (match.sizing === 'halves') num = (match.regular_length || 0) * 60000
    } else if (match.sh_start && match.sh_end) {
      if (match.sizing === 'halves') num = (match.regular_length || 0) * 120000
    }

    const minutes = Math.floor(num / 60000) + pad
    const seconds = Math.floor(num / 1000) % 60
    setTimeElapsed(`${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`)
  }

  useEffect(() => {
    if (match.fh_end && match.sh_end && !match.otfh_start) return

    const intervalId = setInterval(() => {
      updateInterval()
    }, 1000)

    return () => clearInterval(intervalId)
  }, [timeElapsed])

  useEffect(() => {
    updateInterval()
    updateLabel()
  }, [match])

  return (
    <section className="flex-1 text-xs font-bold">
      {props['write-mode'] && match.result === 'pending' ? (
        <>
          <Button
            type="button"
            onClick={() => {
              switch (buttonLabel.toLowerCase()) {
                case 'start match':
                case 'start 2nd half':
                  startMatch(
                    match.match_id,
                    new Date().toISOString(),
                    buttonLabel.toLowerCase() as 'start match' | 'start 2nd half'
                  )
                    .then(setMatch)
                    .finally(updateLabel)
                  break
                case 'end 1st half':
                case 'end 2nd half':
                case 'end match':
                  stopMatch(
                    match.match_id,
                    new Date().toISOString(),
                    buttonLabel.toLowerCase() as 'end 1st half' | 'end 2nd half' | 'end match'
                  )
                    .then(setMatch)
                    .finally(updateLabel)
              }
            }}
            className="!text-xs capitalize sm:!text-sm"
          >
            {buttonLabel}
          </Button>
        </>
      ) : (
        <Subheading className="capitalize">{match.result}</Subheading>
      )}
      <p className="mt-2 font-mono text-sm font-black">{timeElapsed === '0' ? '--:--' : timeElapsed}</p>
    </section>
  )
}
