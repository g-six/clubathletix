'use client'

import { Button } from '@/components/button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/dialog'
import { Field, FieldGroup, Label } from '@/components/fieldset'
import { Input } from '@/components/input'
import { createLeague, updateLeague } from '@/services/league.service'
import { Prisma } from '@prisma/client'
import { useCallback, useState } from 'react'
import DateField from '../date'

export function CreateLeagueDialog(props: React.ComponentPropsWithoutRef<typeof Button>) {
  let [isOpen, setIsOpen] = useState(false)
  let [isLoading, toggleLoader] = useState(false)

  const [payload, setPayload] = useState<{
    name: string
    start_date: Date
    end_date: Date
  }>({
    name: '',
    start_date: new Date(),
    end_date: new Date(),
  })

  const handleSubmit = useCallback(async () => {
    toggleLoader(true)
    if (payload.name) {
      const league = await createLeague(payload)
      toggleLoader(false)
      location.reload()
    }
  }, [payload])

  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)} {...props} />
      <Dialog
        open={isOpen}
        onClose={() => {
          toggleLoader(false)
          setIsOpen(false)
        }}
      >
        <DialogTitle>Create a league</DialogTitle>

        <DialogDescription>Enter the details of the league you are creating</DialogDescription>
        <DialogBody>
          <FieldGroup>
            <Field>
              <Label>Name</Label>
              <Input
                name="name"
                disabled={isLoading}
                placeholder="Enter league name..."
                onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
                autoFocus
              />
            </Field>
          </FieldGroup>

          <DateField
            disabled={isLoading}
            label="Start date"
            onChange={(value) =>
              setPayload({ ...payload, start_date: new Date(value.year, value.month - 1, value.day) })
            }
          />

          <DateField
            disabled={isLoading}
            label="End date"
            onChange={(value) => setPayload({ ...payload, end_date: new Date(value.year, value.month - 1, value.day) })}
          />
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
              handleSubmit()
            }}
          >
            {isLoading ? (
              <>
                <img src="/loaders/default.gif" className="size-4 rounded-full bg-white" />
                <span>Creating...</span>
              </>
            ) : (
              'Create league'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
export function EditLeagueDialog(
  props: { data: Prisma.LeagueUncheckedUpdateInput } & React.ComponentPropsWithoutRef<typeof Button>
) {
  let [isOpen, setIsOpen] = useState(false)
  let [isLoading, toggleLoader] = useState(false)
  let [message, setMessage] = useState('')

  const [payload, setPayload] = useState<Prisma.LeagueUncheckedUpdateInput>(props.data)

  const handleSubmit = useCallback(async () => {
    toggleLoader(true)
    if (payload.name) {
      const { league_id, name, start_date, end_date } = payload
      updateLeague({
        league_id,
        name,
        start_date,
        end_date,
      })
        .then(() => {
          setMessage('Updates saved')
          setTimeout(() => {
            setMessage('')
            setIsOpen(false)
          }, 3500)
        })
        .finally(() => {
          toggleLoader(false)
        })
    }
  }, [payload])
  const [sy, sm, sd] = `${payload.start_date}`.split('-').map(Number)
  const start_date = new Date(sy, sm - 1, sd)
  const [ey, em, ed] = `${payload.end_date}`.split('-').map(Number)
  const end_date = new Date(ey, em - 1, ed)

  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)} {...props} />
      <Dialog
        open={isOpen}
        onClose={() => {
          toggleLoader(false)

          setIsOpen(false)
        }}
      >
        <DialogTitle>Edit league</DialogTitle>

        <DialogDescription>
          {message ? (
            <p className="mt-4 rounded bg-black/20 px-2 py-1 font-bold text-lime-500">{message}</p>
          ) : (
            'Enter the details of the league you are creating'
          )}
        </DialogDescription>

        <DialogBody>
          <FieldGroup>
            <Field>
              <Label>Name</Label>
              <Input
                name="name"
                defaultValue={payload.name as string}
                disabled={isLoading}
                placeholder="Enter league name..."
                onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
                autoFocus
              />
            </Field>
          </FieldGroup>

          <DateField
            disabled={isLoading}
            label="Start date"
            defaultValue={start_date}
            onChange={(v) => setPayload({ ...payload, start_date: v })}
          />

          <DateField
            disabled={isLoading}
            label="End date"
            defaultValue={end_date}
            onChange={(v) => setPayload({ ...payload, end_date: v })}
          />
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
              handleSubmit()
            }}
          >
            {isLoading ? (
              <>
                <img src="/loaders/default.gif" className="size-4 rounded-full bg-white" />
                <span>Updating...</span>
              </>
            ) : (
              'Update'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
