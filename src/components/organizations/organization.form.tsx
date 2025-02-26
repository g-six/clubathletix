'use client'

import { Button } from '@/components/button'
import { DialogActions } from '@/components/dialog'
import { Field, FieldGroup, Label } from '@/components/fieldset'
import { Input } from '@/components/input'
import { Select } from '@/components/select'
import { onFileChange } from '@/lib/file-helper'
import { createOrganization } from '@/services/organization.service'
import { ShieldExclamationIcon } from '@heroicons/react/20/solid'
import { Prisma } from '@prisma/client'
import { useCallback, useState } from 'react'
import { Divider } from '../divider'
import { Heading, Subheading } from '../heading'

export function CreateOrganizationForm() {
  let [isLoading, toggleLoader] = useState(false)

  const [payload, setPayload] = useState<{
    [k: string]: string
  }>({
    name: 'Whiterock United Football Club',
    short_name: 'WRU',
    email: 'wru@clubathletix.com',
    phone: '236 777 1283',
    contact_first_name: 'GR',
    contact_last_name: 'E',
    organization_type: 'academy',
  })

  const [file, setFile] = useState<string>()

  const handleSubmit = useCallback(async () => {
    toggleLoader(true)
    try {
      const organization: Prisma.OrganizationSelect = await createOrganization(payload)
      console.log(organization)
      if (organization.organization_id) {
        window.location.href = `/organizations/${organization.organization_id}`
      }
    } finally {
      toggleLoader(false)
    }
  }, [payload])

  return (
    <form action={handleSubmit}>
      <Heading>Create an organization</Heading>
      <Subheading>Enter the details of the organization you are creating</Subheading>

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-5">
        <Field className="sm:col-span-1">
          <label htmlFor="file-upload" className="block text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white">
            Upload a logo
            <input
              type="file"
              title="upload a logo"
              id="file-upload"
              name="file-upload"
              className="!sr-only"
              onChange={(evt) => {
                onFileChange(evt).then((result) => {
                  result && setFile(result)
                  result &&
                    setPayload((p) => ({
                      ...p,
                      logo: result,
                    }))
                })
              }}
              accept="image/png,image/jpg,image/jpeg"
            />
            {file ? (
              <img src={file} alt="" className="mt-3 size-8" />
            ) : (
              <ShieldExclamationIcon aria-hidden="true" className="mt-3 size-8 text-gray-300" />
            )}
          </label>
        </Field>

        <Field className="sm:col-span-1">
          <Label className="block">Type</Label>
          <Select
            name="organization_type"
            defaultValue={payload.organization_type}
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

        <FieldGroup className="grid grid-cols-1 gap-x-6 gap-y-8 sm:col-span-6 sm:grid-cols-5">
          <Field className="col-span-2">
            <Label>Name</Label>
            <Input
              name="name"
              disabled={isLoading}
              defaultValue={payload.name || ''}
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
              defaultValue={payload.short_name || ''}
              invalid={!payload.short_name}
              placeholder="Short name..."
              onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
            />
          </Field>
        </FieldGroup>
        <FieldGroup className="grid grid-cols-1 gap-x-6 gap-y-8 sm:col-span-5 sm:grid-cols-5">
          <Field className="col-span-2 sm:col-span-1">
            <Label>Email</Label>
            <Input
              name="email"
              required
              type="email"
              autoComplete="email"
              defaultValue={payload.email || ''}
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
              defaultValue={payload.phone || ''}
              invalid={!payload.phone}
              onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
            />
          </Field>
        </FieldGroup>

        <Divider className="col-span-6" />

        <Field className="col-span-2 sm:col-span-1">
          <Label>First name</Label>
          <Input
            name="contact_first_name"
            disabled={isLoading}
            autoComplete="off"
            defaultValue={payload.contact_first_name || ''}
            placeholder="Enter contact name..."
            invalid={!payload.contact_first_name}
            onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
          />
        </Field>
        <Field className="col-span-2 sm:col-span-1">
          <Label>Last name</Label>
          <Input
            name="contact_last_name"
            required
            defaultValue={payload.contact_last_name || ''}
            autoComplete="off"
            disabled={isLoading}
            invalid={!payload.contact_last_name}
            placeholder="Contact name..."
            onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
          />
        </Field>
      </div>

      <DialogActions>
        <Button
          plain
          onClick={() => {
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
          type="submit"
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
    </form>
  )
}
