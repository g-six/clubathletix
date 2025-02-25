'use client'

import { Button } from '@/components/button'
import { Checkbox, CheckboxField } from '@/components/checkbox'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/dialog'
import { Field, FieldGroup, Label } from '@/components/fieldset'
import { Input } from '@/components/input'
import { Select } from '@/components/select'
import { Switch } from '@/components/switch'
import { getAvailableLeaguesForTeam } from '@/services/league.service'
import { createMatch } from '@/services/match.service'
import { useCallback, useEffect, useState } from 'react'

export function TrainingDialog(props: { 'team-id': string } & React.ComponentPropsWithoutRef<typeof Button>) {
  let [isOpen, setIsOpen] = useState(false)
  let [isLoading, toggleLoader] = useState(false)
  let [isInitiating, setIsInitiating] = useState(true)
  const [payload, setPayload] = useState<{
    [k: string]: string
  }>({
    year: new Date().getFullYear().toString(),
    team_id: props['team-id'],
    home_or_away: 'home',
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
    availableMonths.push(months[nextWeek.getMonth()], months[nextTwoWeeks.getMonth()])
  } else if (!availableMonths.includes(months[nextTwoWeeks.getMonth()])) {
    availableMonths.push(months[nextTwoWeeks.getMonth()])
  }

  const handleSubmit = useCallback(async () => {
    toggleLoader(true)

    const match = await createMatch(payload)
    location.reload()
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
      >
        <DialogTitle>Create a match</DialogTitle>

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
              <FieldGroup>
                <Field>
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
                <Field>
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
                <div className="flex flex-wrap items-center gap-2">
                  <Field className="w-48">
                    <Label>Month</Label>
                    <Select
                      name="month"
                      defaultValue=""
                      disabled={isLoading}
                      onChange={(evt) => {
                        let year = currentDate.getFullYear()
                        if (
                          nextWeek.getFullYear() > currentDate.getFullYear() &&
                          Number(evt.currentTarget.value) !== currentDate.getMonth()
                        ) {
                          year++
                        }
                        setPayload({
                          ...payload,
                          year: year.toString(),
                          month: `${Number(evt.currentTarget.value) > 8 ? '' : '0'}${Number(evt.currentTarget.value) + 1}`,
                        })
                      }}
                    >
                      <option value="" disabled>
                        Select month&hellip;
                      </option>
                      {availableMonths.map((month, index) => (
                        <option value={index + 1} key={month}>
                          {month}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field className="w-20">
                    <Label>Day</Label>
                    <Input
                      disabled={isLoading}
                      name="day"
                      placeholder="Day"
                      onChange={(evt) =>
                        setPayload({
                          ...payload,
                          day: `${Number(evt.currentTarget.value) > 9 ? '' : '0'}${Number(evt.currentTarget.value)}`,
                        })
                      }
                    />
                  </Field>
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
                <CheckboxField disabled={isLoading}>
                  <Checkbox name="notify" defaultChecked disabled={isLoading} />
                  <Label>Add all players of the team to this match</Label>
                </CheckboxField>
              </FieldGroup>
            </DialogBody>
            <div className="mt-4 w-full text-zinc-400">
              <span className="text-xs/4">A notification will be sent to each player / parent / guardian.</span>
            </div>
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
                    <img src="/loaders/default.gif" className="size-4 rounded-full bg-white" />
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
