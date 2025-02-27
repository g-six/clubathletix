'use client'

import { Button } from '@/components/button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/dialog'
import { Field, FieldGroup, Label } from '@/components/fieldset'
import { Input } from '@/components/input'
import { onFileChange } from '@/lib/file-helper'
import { getOrganizationTeams } from '@/services/team.service'
import { inviteUser } from '@/services/user.service'
import { UserCircleIcon } from '@heroicons/react/20/solid'
import { Prisma, Team } from '@prisma/client'
import Cookies from 'js-cookie'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import DateField from '../date'
import { Select } from '../select'

export function InviteMemberDialog(
  props: { 'team-id'?: string; 'organization-id'?: string } & React.ComponentPropsWithoutRef<typeof Button>
) {
  let [isOpen, setIsOpen] = useState(false)
  let [isLoading, toggleLoader] = useState(false)
  const params = useParams()
  const [teams, setTeams] = useState<Team[]>([])
  const [team_id, selectTeamId] = useState<string | undefined>(
    (params.team_id as string) || props['team-id'] || undefined
  )
  const organization_id = `${params.organization_id}` || Cookies.get('organization_id') || ''

  const [file, setFile] = useState<string>()
  const [payload, setPayload] = useState<{
    first_name: string
    last_name: string
    email: string
    phone: string
    organization_id: string
    team_id?: string
    team_name?: string
    imageUrl?: string
    role: 'Coach' | 'Parent' | 'Assistant Coach'
  }>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    team_id,
    role: 'Parent',
    organization_id,
  })

  console.log(payload)

  useEffect(() => {
    if (!Boolean(team_id)) {
      getOrganizationTeams(organization_id).then(setTeams)
    }
  }, [team_id])

  useEffect(() => {
    if (teams.length === 1) {
      selectTeamId(teams[0].team_id)
      setPayload((prev) => ({
        ...prev,
        team_id: teams[0].team_id,
        team_name: teams[0].name,
      }))
    }
  }, [teams])

  const handleSubmit = useCallback(async () => {
    if (payload.first_name && payload.last_name && organization_id) {
      toggleLoader(true)
      const { role, ...u } = payload
      inviteUser(u, {
        organization_id,
        role,
        team_id,
      })
        .then(() => {
          setIsOpen(false)
        })
        .finally(() => {
          toggleLoader(false)
        })
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
        <DialogTitle>Invite team member</DialogTitle>

        <DialogDescription>Enter member information</DialogDescription>
        <DialogBody>
          <label
            htmlFor="file-upload"
            className="relative flex h-16 items-center justify-center text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white"
          >
            <span className="text-xs/3 font-bold text-lime-600 hover:opacity-100">Upload</span>
            <input
              type="file"
              title="upload a photo"
              id="file-upload"
              name="file-upload"
              className="!sr-only"
              onChange={(evt) => {
                onFileChange(evt).then((result) => {
                  result && setFile(result)
                  result &&
                    setPayload((p) => ({
                      ...p,
                      imageUrl: result,
                    }))
                })
              }}
              accept="image/png,image/jpg,image/jpeg"
            />
            {file ? (
              <img
                src={file}
                alt=""
                className="absolute top-1/2 left-1/2 aspect-square size-16 -translate-1/2 rounded-full object-cover"
              />
            ) : (
              <UserCircleIcon
                aria-hidden="true"
                className="absolute top-1/2 left-1/2 size-16 -translate-1/2 text-gray-300 opacity-10"
              />
            )}
          </label>

          <FieldGroup className="mt-4 grid gap-x-4 sm:grid-cols-3">
            {teams.length && (
              <>
                <Field className="sm:col-span-2">
                  <Label>Team</Label>
                  <Select
                    name="team_id"
                    defaultValue={payload.team_id}
                    disabled={isLoading}
                    onChange={(evt) => {
                      selectTeamId(evt.currentTarget.value)
                      const team_name = teams.find((team) => team.team_id === evt.currentTarget.value)?.name
                      setPayload({
                        ...payload,
                        [evt.currentTarget.name]: evt.currentTarget.value,
                        team_name,
                      })
                    }}
                  >
                    <option value="" disabled>
                      Select team
                    </option>
                    {teams.map((team) => (
                      <option key={team.team_id} value={team.team_id}>
                        {team.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </>
            )}

            <Field>
              <Label>Role</Label>
              <Select
                name="role"
                defaultValue={payload.role}
                disabled={isLoading}
                onChange={(evt) => {
                  setPayload({
                    ...payload,
                    [evt.currentTarget.name]: evt.currentTarget.value,
                  })
                }}
              >
                <option value="" disabled>
                  Select role&hellip;
                </option>

                <option value="Coach">Coach</option>
                <option value="Parent">Parent</option>
                <option value="Assistant Coach">Assistant Coach</option>
                <option value="Team Manager">Team Manager</option>
              </Select>
            </Field>
          </FieldGroup>

          <FieldGroup className="mt-4 grid gap-x-4 sm:grid-cols-2">
            <Field className="!mb-0">
              <Label>First name</Label>
              <Input
                name="first_name"
                disabled={isLoading}
                placeholder="First name..."
                onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
                autoFocus
              />
            </Field>
            <Field>
              <Label>Last name</Label>
              <Input
                name="last_name"
                disabled={isLoading}
                placeholder="Last name..."
                onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
                autoFocus
              />
            </Field>

            <Field>
              <Label>E-mail address</Label>
              <Input
                name="email"
                disabled={isLoading}
                placeholder="brad@clubathletix.com"
                onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
              />
            </Field>

            <Field>
              <Label>Phone</Label>
              <Input
                name="phone"
                type="tel"
                disabled={isLoading}
                placeholder="236 810 1983"
                onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
              />
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
                <img title="loading" src="/loaders/default.gif" className="size-4 rounded-full bg-white" />
                <span>Emailing...</span>
              </>
            ) : (
              'Send invite'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
export function EditMemberDialog(
  props: { data: Prisma.PlayerUncheckedUpdateInput } & React.ComponentPropsWithoutRef<typeof Button>
) {
  let [isOpen, setIsOpen] = useState(false)
  let [isLoading, toggleLoader] = useState(false)
  let [message, setMessage] = useState('')

  const [payload, setPayload] = useState<Prisma.PlayerUncheckedUpdateInput>(props.data)

  const handleSubmit = useCallback(async () => {
    toggleLoader(true)
    if (payload.first_name && payload.last_name && payload.birth_day && payload.birth_month && payload.birth_year) {
      const { player_id, ...rest } = payload

      if (player_id)
        updatePlayer(`${player_id}`, rest)
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
        <DialogTitle>Edit player</DialogTitle>

        <DialogDescription>
          {message && <p className="mt-4 rounded bg-black/20 px-2 py-1 font-bold text-lime-500">{message}</p>}
        </DialogDescription>

        <DialogBody>
          <FieldGroup>
            <Field>
              <Label>First name</Label>
              <Input
                name="first_name"
                defaultValue={payload.first_name as string}
                disabled={isLoading}
                placeholder="First name"
                onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
                autoFocus
              />
            </Field>
            <Field>
              <Label>Last name</Label>
              <Input
                name="last_name"
                defaultValue={payload.last_name as string}
                disabled={isLoading}
                placeholder="Last name"
                onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
                autoFocus
              />
            </Field>
          </FieldGroup>

          <DateField
            disabled={isLoading}
            label="Birth date"
            onChange={(value) => {
              const [birth_year, birth_month, birth_day] = value.split('-').map(Number)
              setPayload({ ...payload, birth_day, birth_month, birth_year })
            }}
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
                <img title="loading" src="/loaders/default.gif" className="size-4 rounded-full bg-white" />
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
