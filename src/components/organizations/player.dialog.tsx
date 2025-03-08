'use client'

import { Button } from '@/components/button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/dialog'
import { Field, FieldGroup, Label } from '@/components/fieldset'
import { Input } from '@/components/input'
import { onFileChange } from '@/lib/file-helper'
import { updatePlayer } from '@/models/player'
import { createPlayer, findPlayers } from '@/services/player.service'
import { addTeamPlayer, getParents } from '@/services/team.service'
import { XCircleIcon } from '@heroicons/react/16/solid'
import { UserCircleIcon } from '@heroicons/react/20/solid'
import { Player, Prisma, TeamMember, User } from '@prisma/client'
import { useCallback, useEffect, useState } from 'react'
import DateField from '../date'
import { Select } from '../select'

export function FindPlayerDialog(
  props: {
    'team-id': string
  } & React.ComponentPropsWithoutRef<typeof Button>
) {
  let [isOpen, setIsOpen] = useState(false)
  let [isLoading, toggleLoader] = useState(false)
  let [players, setPlayers] = useState<Player[]>([])
  let [parents, setParents] = useState<(TeamMember & { user: User })[]>([])
  let [isAdult, setIsAdult] = useState(false)

  const [file, setFile] = useState<string>()
  const [payload, setPayload] = useState<{
    first_name: string
    last_name: string
    team_id: string
    relationship?: string
    player_id?: string
    parent?: string
    position?: string
    jersey_number?: string
  }>({
    first_name: '',
    last_name: '',
    team_id: props['team-id'],
  })

  const handleSearch = useCallback(async () => {
    if (payload.first_name || payload.last_name) {
      toggleLoader(true)
      let search: {
        first_name?: string
        last_name?: string
      } = {}
      if (payload.first_name) search.first_name = payload.first_name
      if (payload.last_name) search.last_name = payload.last_name
      findPlayers(search)
        .then(setPlayers)
        .finally(() => {
          toggleLoader(false)
        })
    }
  }, [payload])

  const handleSubmit = useCallback(async () => {
    if (payload.player_id) {
      toggleLoader(true)

      addTeamPlayer({
        team_id: payload.team_id,
        player_id: payload.player_id,
        position: payload.position,
        jersey_number: payload.jersey_number,
        relationship: payload.relationship,
        parent: payload.parent,
      })
        .then((res) => {
          setIsOpen(false)
          location.reload()
        })
        .finally(() => {
          toggleLoader(false)
        })
    }
  }, [payload])

  useEffect(() => {
    if (payload.player_id) {
      const p = players.find((p) => p.player_id === payload.player_id)
      setIsAdult(Boolean(p?.birth_year && new Date().getFullYear() - p.birth_year >= 18))
    }
  }, [payload.player_id])
  useEffect(() => {
    getParents(props['team-id']).then(setParents).catch(console.error).finally()
  }, [])

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
        <DialogTitle>Find a player</DialogTitle>

        <DialogDescription>Enter player information</DialogDescription>
        <DialogBody>
          {players.length ? (
            <Field className="relative mb-12 pr-6 sm:col-span-2">
              <Label>Choose a player to add to this team</Label>
              <Select
                name="player_id"
                disabled={isLoading}
                defaultValue=""
                onChange={(evt) => {
                  setPayload({
                    ...payload,
                    [evt.currentTarget.name]: evt.currentTarget.value,
                  })
                }}
              >
                <option value="" disabled>
                  Select from {players.length} player(s) &hellip;
                </option>

                {players.map((player) => (
                  <option key={player.player_id} value={player.player_id}>
                    {player.first_name} {player.last_name}
                  </option>
                ))}
              </Select>
              <XCircleIcon
                className="absolute bottom-2 left-full size-6 -translate-x-4 cursor-pointer opacity-50 hover:opacity-90"
                role="button"
                title="Clear and redo search"
                onClick={() => {
                  setPlayers([])
                }}
              />
            </Field>
          ) : (
            <FieldGroup className="mt-4 grid gap-x-4 sm:grid-cols-2">
              <Field>
                <Label>Last name</Label>
                <Input
                  name="last_name"
                  type="search"
                  disabled={isLoading}
                  placeholder="Last name..."
                  onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
                  autoFocus
                />
              </Field>
              <Field className="!mb-0">
                <Label>First name</Label>
                <Input
                  name="first_name"
                  disabled={isLoading}
                  type="search"
                  placeholder="First name..."
                  onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
                />
              </Field>
            </FieldGroup>
          )}

          <FieldGroup className="grid gap-x-4 sm:grid-cols-4">
            <Field>
              <Label>Position</Label>
              <Input
                name="position"
                disabled={isLoading}
                placeholder="CB"
                onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
              />
            </Field>
            <Field>
              <Label>Jersey No.</Label>
              <Input
                name="jersey_number"
                disabled={isLoading}
                placeholder="10"
                onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
              />
            </Field>
          </FieldGroup>
          <FieldGroup className="mt-4 grid gap-x-4 sm:grid-cols-3">
            <Field className="sm:col-span-2">
              <Label>Parent / Guardian</Label>
              <Select
                name="parent"
                defaultValue=""
                disabled={isLoading}
                onChange={(evt) => {
                  setPayload({
                    ...payload,
                    [evt.currentTarget.name]: evt.currentTarget.value,
                  })
                }}
              >
                <option value="">Select&hellip;</option>

                {parents &&
                  parents?.map((record) => (
                    <option key={record.user_id} value={record.user_id}>
                      {record.user.first_name} {record.user.last_name}
                    </option>
                  ))}
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
              players.length ? handleSubmit() : handleSearch()
            }}
          >
            {isLoading ? (
              <>
                <img title="loading" src="/loaders/default.gif" className="size-4 rounded-full bg-white" />
                <span>{players.length ? 'Adding' : 'Searching'}&hellip;</span>
              </>
            ) : players.length ? (
              'Add player'
            ) : (
              'Search'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
export function CreatePlayerDialog(
  props: {
    'team-id': string
    members: (TeamMember & { user: { first_name: string; last_name: string } })[]
  } & React.ComponentPropsWithoutRef<typeof Button>
) {
  let [isOpen, setIsOpen] = useState(false)
  let [isLoading, toggleLoader] = useState(false)

  const [file, setFile] = useState<string>()
  const [payload, setPayload] = useState<{
    first_name: string
    last_name: string
    birth_day?: number
    birth_month?: number
    birth_year?: number
    team_id: string
    parent?: string
  }>({
    first_name: '',
    last_name: '',
    team_id: props['team-id'],
  })

  const handleSubmit = useCallback(async () => {
    if (payload.first_name && payload.last_name) {
      toggleLoader(true)

      createPlayer(payload)
        .then(() => {
          setIsOpen(false)
          location.reload()
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
        <DialogTitle>Add a player</DialogTitle>

        <DialogDescription>Enter player information</DialogDescription>
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
                      photo: result,
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
              />
            </Field>
          </FieldGroup>

          <DateField
            disabled={isLoading}
            label="Birth date"
            maxYear={new Date().getFullYear() - 5}
            minYear={new Date().getFullYear() - 40}
            onChange={(value) => {
              const [birth_year, birth_month, birth_day] = value.split('-').map(Number)
              setPayload({ ...payload, birth_day, birth_month, birth_year })
            }}
          />

          <FieldGroup className="mt-4 grid gap-x-4 sm:grid-cols-4">
            <Field>
              <Label>Position</Label>
              <Input
                name="position"
                disabled={isLoading}
                placeholder="CB"
                onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
              />
            </Field>
            <Field>
              <Label>Jersey No.</Label>
              <Input
                name="jersey_number"
                disabled={isLoading}
                placeholder="10"
                onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
              />
            </Field>
            <Field className="sm:col-span-2">
              <Label>Parent / Guardian.</Label>
              <Select
                name="parent"
                defaultValue=""
                disabled={isLoading}
                onChange={(evt) => {
                  setPayload({
                    ...payload,
                    [evt.currentTarget.name]: evt.currentTarget.value,
                  })
                }}
              >
                <option value="">Select&hellip;</option>

                {props.members.map((member) => (
                  <option key={member.user_id} value={member.user_id}>
                    {member.user.first_name} {member.user.last_name}
                  </option>
                ))}
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
                <img title="loading" src="/loaders/default.gif" className="size-4 rounded-full bg-white" />
                <span>Adding...</span>
              </>
            ) : (
              'Add player'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
export function EditPlayerDialog(
  props: { data: Prisma.PlayerUncheckedUpdateInput; members: TeamMember[] } & React.ComponentPropsWithoutRef<
    typeof Button
  >
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
