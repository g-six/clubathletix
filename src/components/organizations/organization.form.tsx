'use client'

import { Button } from '@/components/button'
import { DialogActions } from '@/components/dialog'
import { Field, Label } from '@/components/fieldset'
import { Input } from '@/components/input'
import { Select } from '@/components/select'
import { useCallback, useState } from 'react'
import { Divider } from '../divider'
import { Heading, Subheading } from '../heading'

export function CreateOrganizationForm() {
  let [isOpen, setIsOpen] = useState(true)
  let [isLoading, toggleLoader] = useState(false)

  const [payload, setPayload] = useState<{
    [k: string]: string
  }>({
    name: '',
    description: '',
  })

  const handleSubmit = useCallback(async () => {
    toggleLoader(true)
  }, [payload])

  return (
    <>
      <div className="mx-auto xl:max-w-lg">
        <Heading>Create an organization</Heading>
        <Subheading>Enter the details of the organization you are creating</Subheading>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <Field className="lg:col-span-2">
            <Label>Type</Label>
            <Select
              name="organization_type"
              defaultValue="academy"
              disabled={isLoading}
              onChange={(evt) => {
                setPayload({
                  ...payload,
                  [evt.currentTarget.name]: evt.currentTarget.value,
                })
              }}
            >
              <option value="" disabled>
                Select organization type&hellip;
              </option>

              <option value="academy">Academy</option>
              <option value="club">Club</option>
              <option value="club">School</option>
            </Select>
          </Field>

          <span className="col-span-2 lg:col-span-3" />
          <Field className="col-span-2">
            <Label>Name</Label>
            <Input
              name="name"
              disabled={isLoading}
              placeholder="Enter name..."
              invalid={!payload.name}
              onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
              autoFocus
            />
          </Field>

          <Field>
            <Label>Short name</Label>
            <Input
              name="short_name"
              required
              disabled={isLoading}
              invalid={!payload.short_name}
              placeholder="Short name..."
              onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
            />
          </Field>

          <Divider className="col-span-2 lg:col-span-3" />

          <Field className="col-span-2 lg:col-span-1">
            <Label>First name</Label>
            <Input
              name="contact_first_name"
              disabled={isLoading}
              autoComplete="off"
              placeholder="Enter contact name..."
              invalid={!payload.contact_first_name}
              onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
            />
          </Field>
          <Field className="col-span-2 lg:col-span-1">
            <Label>Last name</Label>
            <Input
              name="contact_last_name"
              required
              autoComplete="off"
              disabled={isLoading}
              invalid={!payload.contact_last_name}
              placeholder="Contact name..."
              onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
            />
          </Field>

          <Divider className="col-span-2 lg:col-span-3" />

          <Field className="col-span-2 lg:col-span-2">
            <Label>Email</Label>
            <Input
              name="email"
              required
              type="email"
              autoComplete="email"
              disabled={isLoading}
              invalid={!payload.email}
              placeholder="Official email address..."
              onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
            />
          </Field>
          <Field className="col-span-2 lg:col-span-1">
            <Label>Phone</Label>
            <Input
              name="phone"
              type="tel"
              autoComplete="phone"
              disabled={isLoading}
              placeholder="Enter business phone..."
              invalid={!payload.contact_first_name}
              onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
            />
          </Field>
        </div>

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
            disabled={
              !payload.contact_first_name ||
              !payload.contact_last_name ||
              !payload.email ||
              !payload.phone ||
              !payload.short_name ||
              !payload.name
            }
            onClick={() => {
              handleSubmit()
            }}
          >
            {isLoading ? (
              <>
                <img src="/loaders/default.gif" className="size-4 rounded-full bg-white" />
                <span className="w-40">Please wait...</span>
              </>
            ) : (
              <span className="w-48">Create organization</span>
            )}
          </Button>
        </DialogActions>
      </div>
    </>
  )
}
