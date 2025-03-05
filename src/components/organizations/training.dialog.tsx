'use client'

import { Button } from '@/components/button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/dialog'
import { Field, FieldGroup, Label } from '@/components/fieldset'
import { Input } from '@/components/input'
import { Select } from '@/components/select'
import { getAvailableLeaguesForTeam } from '@/services/league.service'
import { createTraining } from '@/services/training.service'
import { SesssionLeague } from '@/typings/league'
import { ArrowRightIcon } from '@heroicons/react/20/solid'
import { useCallback, useEffect, useState } from 'react'
import DateField from '../date'

export function TrainingDialog(
  props: {
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

    const training = await createTraining({
      team_id: payload.team_id,
      location: payload.location,
      session_start: `${payload.year}-${payload.month}-${payload.day} ${payload.hour}:${payload.minute} ${payload.timezone}`,
      session_end: `${payload.year}-${payload.month}-${payload.day} ${payload.to_hour}:${payload.to_minute} ${payload.timezone}`,
    })
    if (training?.ok) location.reload()

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
        <DialogTitle>Schedule training</DialogTitle>

        {isInitiating && isOpen ? (
          <>
            <div className="flex items-center gap-2">
              <img src="/loaders/default.gif" className="mt-1 size-4 rounded-full bg-white" />{' '}
              <DialogDescription>Loading league information...</DialogDescription>
            </div>
          </>
        ) : (
          <>
            <DialogDescription>Enter the details below</DialogDescription>
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
                      <Label>Venue</Label>
                      <Input
                        name="location"
                        required
                        disabled={isLoading}
                        invalid={!payload.location}
                        placeholder="Enter match venue..."
                        onChange={(evt) => setPayload({ ...payload, location: evt.currentTarget.value })}
                      />
                    </Field>
                  </>
                )}

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
                <div className="sm:col-span-1" />
                <div className="sm:col-span-1">
                  <div className="flex flex-1 justify-end gap-1">
                    <Field className="w-16">
                      <Input
                        disabled={isLoading}
                        name="hour"
                        type="number"
                        min={4}
                        max={21}
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

                <div className="sm:col-span-2">
                  <div className="flex flex-1 items-center justify-start gap-1">
                    <ArrowRightIcon className="size-5 opacity-50" />
                    <Field className="w-16">
                      <Input
                        disabled={isLoading}
                        name="to_hour"
                        type="number"
                        min={4}
                        max={21}
                        invalid={Boolean(payload.to_hour && Number(payload.to_hour) > 23)}
                        placeholder="19"
                        onChange={(evt) =>
                          setPayload({
                            ...payload,
                            [evt.currentTarget.name]:
                              `${Number(evt.currentTarget.value) > 9 ? '' : '0'}${Number(evt.currentTarget.value)}`,
                          })
                        }
                      />
                    </Field>
                    <Field className="w-16">
                      <Input
                        disabled={isLoading}
                        name="to_minute"
                        type="number"
                        placeholder="00"
                        max={59}
                        invalid={Boolean(payload.to_minute && Number(payload.to_minute) > 59)}
                        onChange={(evt) =>
                          setPayload({
                            ...payload,
                            [evt.currentTarget.name]:
                              `${Number(evt.currentTarget.value) > 9 ? '' : '0'}${Number(evt.currentTarget.value)}`,
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
                  'Schedule training'
                )}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  )
}
