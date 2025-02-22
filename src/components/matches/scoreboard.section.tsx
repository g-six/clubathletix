'use client'
import SpinningSoccer from '@/images/soccer.gif'
import { CreateMatch } from '@/services/match.service'
import Image from 'next/image'
import { useCallback } from 'react'
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

  const onSubmit = useCallback((jersey_number: string, assist?: string) => {
    console.log({ jersey_number, assist, match })
  }, [])

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
            >
              {homeSide.score || 0}
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
              onSubmit={console.log}
            >
              {awaySide.score || 0}
            </EventDialog>
          </div>
          <div className="mb-2 text-xs font-bold lg:text-xs">{awaySide.team}</div>
        </section>
      </div>
      <div className="mt-6 flex justify-center gap-4 text-center">
        <section className="flex w-1/2 flex-col gap-1 text-right">
          <EventRow name="E. Kyle" minute="17'" event="goal" />
        </section>
        <section className="flex w-1/2 flex-col gap-1 text-left">
          <EventRow name="E. Liam" minute="20'" event="yellow_card" away />
          <EventRow name="E. Mattéo" minute="32'" event="goal" away />
        </section>
      </div>

      <Divider className="my-8" />
      <section className="text-center">
        <Subheading>Yellow Cards</Subheading>

        <EventDialog plain match={match} event="yellow_card" className="!px-0" onSubmit={console.log}>
          <span className="relative w-full text-left">
            <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-amber-400"></span>
          </span>
        </EventDialog>
      </section>
      <Divider className="my-8" />
      <section className="text-center">
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
}: {
  name: string
  minute: string
  event: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'save'
  away?: boolean
}) {
  return (
    <div
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
    </div>
  )
}
