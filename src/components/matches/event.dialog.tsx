'use client'

import { Button } from '@/components/button'
import { Dialog, DialogActions, DialogBody, DialogTitle } from '@/components/dialog'
import { Field, FieldGroup, Label } from '@/components/fieldset'
import { Input } from '@/components/input'
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
    match: EventMatch
    event: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'save'
    side?: 'home' | 'away'
    onSubmit(payload: { [k: string]: string | undefined }): void
  } & React.ComponentPropsWithoutRef<typeof Button>
) {
  let [isOpen, setIsOpen] = useState(false)
  let [isLoading, toggleLoader] = useState(false)
  const [sideClicked, setSideClicked] = useState<'home' | 'away'>()

  const [events, setEvents] = useState<{
    goals: {
      jersey_number?: string
      player_id?: string
      assist?: {
        jersey_number?: string
        player_id?: string
      }
      side: 'home' | 'away'
    }[]
    yellow_cards: {
      jersey_number?: string
      player_id?: string
      side: 'home' | 'away'
    }[]
    red_cards: {
      jersey_number?: string
      player_id?: string
      side: 'home' | 'away'
    }[]
    saves: {
      jersey_number?: string
      player_id?: string
      side: 'home' | 'away'
    }[]
  }>({
    goals: [],
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
        <Button type="button" onClick={() => setIsOpen(true)} {...others}>
          {events.goals.filter((yc) => yc.side === side).length}
        </Button>
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
                  name="jersey_number"
                  disabled={isLoading}
                  placeholder="00"
                  invalid={!payload.jersey_number}
                  onChange={(evt) => {
                    setPayload({
                      ...payload,
                      jersey_number: evt.currentTarget.value,
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
              if (props.event === 'yellow_card' && payload.jersey_number) {
                setEvents((prev) => ({
                  ...prev,
                  yellow_cards: [
                    ...(prev.yellow_cards || []),
                    {
                      jersey_number: payload.jersey_number as string,
                      side: sideClicked as 'home' | 'away',
                    },
                  ],
                }))
              } else if (props.event === 'red_card' && payload.jersey_number) {
                setEvents((prev) => ({
                  ...prev,
                  red_cards: [
                    ...(prev.red_cards || []),
                    {
                      jersey_number: payload.jersey_number as string,
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
                      jersey_number: payload.jersey_number ? (payload.jersey_number as string) : undefined,
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
