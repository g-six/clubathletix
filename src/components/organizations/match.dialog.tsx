'use client'

import { Button } from '@/components/button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/dialog'
import { Field, FieldGroup, Label } from '@/components/fieldset'
import { Input } from '@/components/input'
import { Select } from '@/components/select'
import { Switch } from '@/components/switch'
import { getAvailableLeaguesForTeam } from '@/services/league.service'
import { createMatch } from '@/services/match.service'
import { SesssionLeague } from '@/typings/league'
import { useCallback, useEffect, useState } from 'react'
import DateField from '../date'

export function MatchDialog(
  props: {
    'team-id'?: string
    teams?: { team_id: string; league?: SesssionLeague; name: string }[]
  } & React.ComponentPropsWithoutRef<typeof Button>
) {
  let [isOpen, setIsOpen] = useState(false)
  let [isLoading, toggleLoader] = useState(false)
  let [isInitiating, setIsInitiating] = useState(!props?.teams?.length)
  const tomorrow = new Date()
  tomorrow.setTime(tomorrow.getTime() + 24 * 60 * 60 * 1000)
  const [payload, setPayload] = useState<{
    [k: string]: string | undefined
  }>({
    year: tomorrow.getFullYear().toString(),
    month: (tomorrow.getMonth() + 1).toString(),
    day: tomorrow.getDate().toString(),
    team_id: props['team-id'],
    home_or_away: 'home',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const currentDate = new Date()
  const nextWeek = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000)
  const nextTwoWeeks = new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000)

  const availableMonths = [months[currentDate.getMonth()]]
  if (!availableMonths.includes(months[nextWeek.getMonth()])) {
    availableMonths.push(months[nextWeek.getMonth()])
  }
  if (!availableMonths.includes(months[nextTwoWeeks.getMonth()])) {
    availableMonths.push(months[nextTwoWeeks.getMonth()])
  }

  const handleSubmit = useCallback(async () => {
    toggleLoader(true)
    const match = await createMatch(payload)
    if (match?.created_at) location.reload()

    toggleLoader(false)
  }, [payload])

  const getLeagueOptions = useCallback(async (team_id: string) => {
    const leagues = await getAvailableLeaguesForTeam(team_id)
    setIsInitiating(false)
    return leagues
  }, [])

  useEffect(() => {
    if (payload.team_id && isOpen) {
      getLeagueOptions(payload.team_id).then((teamLeague) => {
        setPayload((prev) => ({
          ...prev,
          league_id: teamLeague.league_id,
          organization_id: teamLeague.organization_id,
        }))
      })
    }
  }, [getLeagueOptions, isOpen])
  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)} {...props} />
      <Dialog
        open={isOpen}
        onClose={() => {
          toggleLoader(false)
          setIsInitiating(true)
          setIsOpen(false)
        }}
        size="xl"
      >
        <DialogTitle>Create a team match</DialogTitle>

        {isInitiating && isOpen ? (
          <>
            <div className="flex items-center gap-2">
              <img src="/loaders/default.gif" className="mt-1 size-4 rounded-full bg-white" />{' '}
              <DialogDescription>Loading league information...</DialogDescription>
            </div>
          </>
        ) : (
          <>
            <DialogDescription>Enter the details of the match you are creating</DialogDescription>
            <DialogBody>
              <FieldGroup className="grid gap-x-1 sm:grid-cols-4">
                {Boolean(props.teams?.length) && (
                  <>
                    <Field className="sm:col-span-2">
                      <Label>Team</Label>
                      <Select
                        name="team_id"
                        defaultValue=""
                        disabled={isLoading}
                        onChange={(evt) => {
                          setPayload({
                            ...payload,
                            [evt.currentTarget.name]: evt.currentTarget.value,
                          })
                        }}
                      >
                        <option value="" disabled>
                          Select team&hellip;
                        </option>
                        {props.teams?.map((team) => (
                          <option value={team.team_id} key={team.team_id}>
                            {team.name}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field className="sm:col-span-2">
                      <Label>League</Label>
                      <Select
                        name="league_id"
                        defaultValue=""
                        disabled={!payload.team_id}
                        onChange={(evt) => {
                          setPayload({
                            ...payload,
                            [evt.currentTarget.name]: evt.currentTarget.value,
                          })
                        }}
                      >
                        <option value="" disabled>
                          Select league&hellip;
                        </option>
                        {props.teams?.map((team) => (
                          <option value={team.league?.league_id} key={team.league?.league_id}>
                            {team.league?.name}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </>
                )}
                <Field className="sm:col-span-2">
                  <Label>Opponent</Label>
                  <Input
                    name="opponent"
                    disabled={isLoading}
                    placeholder="Enter team name..."
                    invalid={!payload.opponent}
                    onChange={(evt) => setPayload({ ...payload, opponent: evt.currentTarget.value })}
                    autoFocus
                  />
                </Field>
                <Field className="sm:col-span-2">
                  <Label>Venue</Label>
                  <Input
                    name="location"
                    required
                    disabled={isLoading}
                    invalid={!payload.location}
                    placeholder="Enter match venue..."
                    onChange={(evt) => setPayload({ ...payload, location: evt.currentTarget.value })}
                  />

                  <div className="mt-2 flex items-center justify-end gap-2">
                    <div
                      className={`text-xs capitalize ${payload.home_or_away === 'home' ? 'text-lime-500' : 'text-pink'}`}
                    >
                      {payload.home_or_away || 'Home'}
                    </div>

                    <Switch
                      name="home_or_away"
                      defaultChecked
                      color="lime"
                      onChange={(isHome) => setPayload({ ...payload, home_or_away: isHome ? 'home' : 'away' })}
                    />
                  </div>
                </Field>
                <div className="sm:col-span-3">
                  <DateField
                    label="Date"
                    onChange={(val) => {
                      const [year, month, day] = val.split('-')
                      setPayload({ ...payload, year, month, day })
                    }}
                    future-only
                  />
                </div>
                <div className="sm:col-span-1">
                  <div className="flex flex-1 justify-end gap-1">
                    <Field className="w-16">
                      <Label>Hour</Label>
                      <Input
                        disabled={isLoading}
                        name="hour"
                        type="number"
                        max={23}
                        invalid={Boolean(payload.hour && Number(payload.hour) > 23)}
                        placeholder="17"
                        onChange={(evt) =>
                          setPayload({
                            ...payload,
                            hour: `${Number(evt.currentTarget.value) > 9 ? '' : '0'}${Number(evt.currentTarget.value)}`,
                          })
                        }
                      />
                    </Field>
                    <Field className="w-16">
                      <Label>Minute</Label>
                      <Input
                        disabled={isLoading}
                        name="minute"
                        type="number"
                        placeholder="30"
                        max={59}
                        invalid={Boolean(payload.minute && Number(payload.minute) > 59)}
                        onChange={(evt) =>
                          setPayload({
                            ...payload,
                            minute: `${Number(evt.currentTarget.value) > 9 ? '' : '0'}${Number(evt.currentTarget.value)}`,
                          })
                        }
                      />
                    </Field>
                  </div>
                </div>
              </FieldGroup>
            </DialogBody>
            <DialogActions>
              <Button
                plain
                onClick={() => {
                  setIsOpen(false)
                  toggleLoader(false)
                  setIsInitiating(true)
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                className="flex items-center gap-2"
                onClick={() => {
                  handleSubmit()
                }}
              >
                {isLoading ? (
                  <>
                    <img title="loading" src="/loaders/default.gif" className="size-4 rounded-full bg-white" />
                    <span>Creating...</span>
                  </>
                ) : (
                  'Create match'
                )}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  )
}
