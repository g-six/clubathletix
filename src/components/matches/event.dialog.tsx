'use client'

import { Button } from '@/components/button'
import { Dialog, DialogActions, DialogBody, DialogTitle } from '@/components/dialog'
import { Field, FieldGroup, Label } from '@/components/fieldset'
import { Input } from '@/components/input'
import { MatchRecord } from '@/services/match.service'
import Image from 'next/image'
import { useState } from 'react'
import { Listbox, ListboxLabel, ListboxOption } from '../listbox'

interface EventMatch {
  match_id: string
  goals_against?: number
  goals_for?: number
  home_or_away: 'home' | 'away'
  league: {
    name: string
  }
  opponent: string
  events: {
    match_event_id: string
    player_id: string
    event_type: string
    logged_at: string
  }[]
  team: {
    age_group: string
    division: string
    name: string
    players: {
      jersey_number: string
      position: string
      player_id: string
      player: {
        first_name: string
        last_name: string
      }
    }[]
  }
}
export function EventDialog(
  props: {
    match: MatchRecord
    event: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'save'
    side?: 'home' | 'away'
    onSubmit(payload: { [k: string]: string | undefined }): void
  } & React.ComponentPropsWithoutRef<typeof Button>
) {
  let [isOpen, setIsOpen] = useState(false)
  let [isLoading, toggleLoader] = useState(false)
  const [sideClicked, setSideClicked] = useState<'home' | 'away'>()

  let goals: {
    jersey_number?: string
    player_id?: string
    assist?: {
      jersey_number?: string
      player_id?: string
    }
    side: 'home' | 'away'
  }[] = []
  props.match.events.forEach((event) => {
    if (props.match.home_or_away && props.event === 'goal' && event.player_id && event.event_type === 'goal') {
      goals.push({
        player_id: event.player_id,
        side: props.match.home_or_away as 'home' | 'away',
      })
    }
  })

  for (let i = 0; i < Number(props.match.goals_against || 0); i++) {
    goals.push({
      opponent_number: undefined,
      side: props.match.home_or_away === 'home' ? 'away' : 'home',
    })
  }
  const [events, setEvents] = useState<{
    goals: {
      opponent_number?: string
      player_id?: string
      assist?: {
        opponent_number?: string
        player_id?: string
      }
      side: 'home' | 'away'
    }[]
    yellow_cards: {
      opponent_number?: string
      player_id?: string
      side: 'home' | 'away'
    }[]
    red_cards: {
      opponent_number?: string
      player_id?: string
      side: 'home' | 'away'
    }[]
    saves: {
      opponent_number?: string
      player_id?: string
      side: 'home' | 'away'
    }[]
  }>({
    goals,
    yellow_cards: [],
    red_cards: [],
    saves: [],
  })

  const [payload, setPayload] = useState<{
    [k: string]: string | undefined
  }>({
    match_id: props.match.match_id,
    side: props.side,
    event: props.event,
  })

  let { side, ...others } = props
  let bothSides = events.yellow_cards
  let homeSide = events.yellow_cards.filter((card) => card.side === 'home')
  let awaySide = events.yellow_cards.filter((card) => card.side === 'away')

  if (others.event === 'goal') {
    bothSides = events.goals
    homeSide = events.goals.filter((evt) => evt.side === 'home')
    awaySide = events.goals.filter((evt) => evt.side === 'away')
  } else if (others.event === 'red_card') {
    bothSides = events.red_cards
    homeSide = events.red_cards.filter((evt) => evt.side === 'home')
    awaySide = events.red_cards.filter((evt) => evt.side === 'away')
  }

  let bias = 0
  if (homeSide.length && !awaySide.length) bias = 9
  else if (awaySide.length && !homeSide.length) bias = 1
  else if (awaySide.length === homeSide.length) bias = 5
  else {
    bias = Math.floor((homeSide.length / bothSides.length) * 10)
  }

  return (
    <>
      {side ? (
        <>
          {props.match.team.logo && side === props.match.home_or_away ? (
            <Image
              alt={props.match.team.name}
              priority
              src={`/api/files/${props.match.team.logo}`}
              width={80}
              height={80}
              title={props.match.team.name}
              className="mx-auto w-12 rounded-full sm:w-24"
            />
          ) : (
            <GenericTeamLogo className="mx-auto aspect-square w-12 text-zinc-500 sm:w-24" />
          )}
          <span className="h-8 w-full" />
          <Button type="button" onClick={() => setIsOpen(true)} {...others}>
            {events.goals.filter((g) => g.side === side).length}
          </Button>
        </>
      ) : (
        <div className="relative flex w-full gap-1">
          <div className="relative w-1/2 text-left">
            <Button
              type="button"
              onClick={() => {
                setSideClicked('home')
                setIsOpen(true)
              }}
              {...others}
            >
              <span>{events.yellow_cards.filter((yc) => yc.side === 'home').length}</span>
              {others.children}
            </Button>
          </div>
          <div className="relative w-1/2 text-right">
            <Button
              type="button"
              onClick={() => {
                setSideClicked('away')
                setIsOpen(true)
              }}
              {...others}
            >
              <span className="w-full text-right">{events.yellow_cards.filter((yc) => yc.side === 'away').length}</span>
              {others.children}
            </Button>
          </div>
          <div className="absolute bottom-0 h-1 w-full rounded-full bg-amber-400">
            <div className={`absolute left-1/10 h-1 w-1 -translate-x-1/2 bg-zinc-900 ${bias === 1 ? '' : 'hidden'}`} />
            <div className={`absolute left-1/5 h-1 w-1 -translate-x-1/2 bg-zinc-900 ${bias === 2 ? '' : 'hidden'}`} />
            <div className={`absolute left-3/10 h-1 w-1 -translate-x-1/2 bg-zinc-900 ${bias === 3 ? '' : 'hidden'}`} />
            <div className={`absolute left-2/5 h-1 w-1 -translate-x-1/2 bg-zinc-900 ${bias === 4 ? '' : 'hidden'}`} />
            <div className={`absolute left-1/2 h-1 w-1 -translate-x-1/2 bg-zinc-900 ${bias === 5 ? '' : 'hidden'}`} />
            <div className={`absolute left-3/5 h-1 w-1 -translate-x-1/2 bg-zinc-900 ${bias === 6 ? '' : 'hidden'}`} />
            <div className={`absolute left-7/10 h-1 w-1 -translate-x-1/2 bg-zinc-900 ${bias === 7 ? '' : 'hidden'}`} />
            <div className={`absolute left-4/5 h-1 w-1 -translate-x-1/2 bg-zinc-900 ${bias === 8 ? '' : 'hidden'}`} />
            <div className={`absolute left-9/10 h-1 w-1 -translate-x-1/2 bg-zinc-900 ${bias === 9 ? '' : 'hidden'}`} />
          </div>
        </div>
      )}

      <Dialog
        size="xs"
        open={isOpen}
        onClose={() => {
          toggleLoader(false)
          setIsOpen(false)
        }}
      >
        <DialogTitle className="capitalize">
          {props.side} {props.event}
        </DialogTitle>
        <DialogBody>
          <FieldGroup>
            <Field>
              <Label>{props.match.home_or_away === (side || sideClicked) ? 'Player' : 'Jersey #'}</Label>
              {props.match.home_or_away === (side || sideClicked) ? (
                <Listbox
                  aria-label={`Who got the ${props.event}`}
                  name="player_id"
                  placeholder={`Who got the ${props.event}`}
                  by="player_id"
                  value={props.match.team.players.find((teamPlayer) => teamPlayer.team_player_id === props.event)}
                  onChange={(teamPlayer) => {
                    setPayload({
                      ...payload,
                      player_id: teamPlayer.player_id,
                    })
                  }}
                  className="col-span-2"
                >
                  {props.match.team.players
                    .sort((a, b) => {
                      if (a.player.first_name < b.player.first_name) return -1
                      if (a.player.first_name > b.player.first_name) return 1
                      return 0
                    })
                    .map((teamPlayer) => (
                      <ListboxOption key={teamPlayer.player_id} value={teamPlayer}>
                        {/* <img className="w-5 sm:w-4" src={country.flagUrl} alt="" /> */}
                        <ListboxLabel>{teamPlayer.player.first_name}</ListboxLabel>
                      </ListboxOption>
                    ))}
                </Listbox>
              ) : (
                <Input
                  name="opponent_number"
                  disabled={isLoading}
                  placeholder="00"
                  invalid={!payload.opponent_number}
                  onChange={(evt) => {
                    setPayload({
                      ...payload,
                      opponent_number: evt.currentTarget.value,
                    })
                  }}
                  autoFocus
                />
              )}
            </Field>
          </FieldGroup>
        </DialogBody>
        <DialogActions>
          <Button
            plain
            onClick={() => {
              setIsOpen(false)
              toggleLoader(false)
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            className="flex items-center gap-2"
            onClick={() => {
              if (props.event === 'yellow_card' && payload.opponent_number) {
                setEvents((prev) => ({
                  ...prev,
                  yellow_cards: [
                    ...(prev.yellow_cards || []),
                    {
                      player_id: payload.player_id ? (payload.player_id as string) : undefined,
                      opponent_number: payload.opponent_number as string,
                      side: sideClicked as 'home' | 'away',
                    },
                  ],
                }))
              } else if (props.event === 'red_card' && payload.opponent_number) {
                setEvents((prev) => ({
                  ...prev,
                  red_cards: [
                    ...(prev.red_cards || []),
                    {
                      player_id: payload.player_id ? (payload.player_id as string) : undefined,
                      opponent_number: payload.opponent_number as string,
                      side: sideClicked as 'home' | 'away',
                    },
                  ],
                }))
              } else if (props.event === 'goal') {
                setEvents((prev) => ({
                  ...prev,
                  goals: [
                    ...(prev.goals || []),
                    {
                      player_id: payload.player_id ? (payload.player_id as string) : undefined,
                      opponent_number: payload.opponent_number ? (payload.opponent_number as string) : undefined,
                      side: (side || sideClicked) as 'home' | 'away',
                    },
                  ],
                }))
              }
              props.onSubmit({
                ...payload,
                event: props.event,
                side: props.side || sideClicked,
              })
              setIsOpen(false)
            }}
          >
            {isLoading ? (
              <>
                <img src="/loaders/default.gif" className="size-4 rounded-full bg-white" />
                <span>Creating...</span>
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export function GenericTeamLogo(props: { className?: string }) {
  return (
    <svg viewBox="0 0 166 166" fill="none" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m78.091 0 5.967 5.676c15.038 14.306 35.323 23.067 57.663 23.067.356 0 .711-.002 1.065-.006l6.363-.08 1.988 6.072a102.026 102.026 0 0 1 5.045 31.782c0 47.391-32.269 87.19-75.928 98.477l-2.163.559-2.163-.559C32.27 153.701 0 113.902 0 66.511c0-11.085 1.769-21.772 5.045-31.782l1.988-6.072 6.363.08c.354.004.71.006 1.065.006 22.34 0 42.625-8.761 57.664-23.067L78.09 0ZM19.846 46.033a84.814 84.814 0 0 0-2.492 20.478c0 38.459 25.662 70.919 60.737 81.006 35.075-10.087 60.738-42.547 60.738-81.006 0-7.071-.866-13.93-2.493-20.478-22.009-1.16-42.166-9.387-58.245-22.453-16.079 13.066-36.235 21.293-58.245 22.453Z"
        fill="currentColor"
      ></path>
    </svg>
  )
}
