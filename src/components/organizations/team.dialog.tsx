'use client'

import { Button } from '@/components/button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/dialog'
import { Field, FieldGroup, Label } from '@/components/fieldset'
import { Input } from '@/components/input'
import { createTeam } from '@/services/team.service'
import { Prisma } from '@prisma/client'
import { useCallback, useState } from 'react'
import { Select } from '../select'

export function TeamDialog(
  props: { 'organization-id': string; leagues: Prisma.LeagueUncheckedCreateInput[] } & React.ComponentPropsWithoutRef<
    typeof Button
  >
) {
  let [isOpen, setIsOpen] = useState(false)
  let [isLoading, toggleLoader] = useState(false)

  const [payload, setPayload] = useState<{
    [k: string]: string
  }>({
    organization_id: props['organization-id'],
    league_id: props.leagues?.[0]?.league_id || '',
    division: '2',
    age_group: 'U13',
  })

  const handleSubmit = useCallback(async () => {
    toggleLoader(true)

    const team = await createTeam(payload)
    // location.reload()
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
        <DialogTitle>Create a team</DialogTitle>

        <DialogDescription>Enter the details of the team you are creating</DialogDescription>
        <DialogBody>
          <FieldGroup>
            <Field>
              <Label>League</Label>

              <Select
                name="league_id"
                onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
              >
                {props.leagues.map((league) => (
                  <option key={league.league_id} value={league.league_id}>
                    {league.name}
                  </option>
                ))}
              </Select>
            </Field>
          </FieldGroup>
          <FieldGroup className="mt-6 grid gap-x-3 sm:grid-cols-5">
            <Field className="col-span-3">
              <Label>Team name</Label>
              <Input
                name="name"
                disabled={isLoading}
                placeholder="Enter team name..."
                onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
                autoFocus
              />
            </Field>
            <Field>
              <Label>Age group</Label>

              <Select
                name="age_group"
                defaultValue={payload.age_group}
                onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
              >
                {Array.from({ length: 15 }, (_, i) => i + 7).map((x) => (
                  <option value={`U${x}`} key={`U${x}`}>{`U${x}`}</option>
                ))}
                <option value="adult">Adult</option>
              </Select>
            </Field>
            <Field>
              <Label>Division</Label>

              <Select
                name="division"
                defaultValue={payload.division}
                onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
              >
                <option value="PL">PL</option>
                <option value="1">1</option>
                <option value="1A">1A</option>
                <option value="1B">1B</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </Select>
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
              handleSubmit()
            }}
          >
            {isLoading ? (
              <>
                <img src="/loaders/default.gif" className="size-4 rounded-full bg-white" />
                <span>Creating...</span>
              </>
            ) : (
              'Create team'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
