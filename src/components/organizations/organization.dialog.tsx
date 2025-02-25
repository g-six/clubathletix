'use client'

import { Button } from '@/components/button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/dialog'
import { Field, FieldGroup, Label } from '@/components/fieldset'
import { Input } from '@/components/input'
import { Select } from '@/components/select'
import { useCallback, useState } from 'react'

export function CreateOrganizationDialog(props: React.ComponentPropsWithoutRef<typeof Button>) {
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
      <Dialog
        open={isOpen}
        onClose={() => {
          toggleLoader(false)
          setIsOpen(false)
        }}
      >
        <DialogTitle>Create an organization</DialogTitle>
        <DialogDescription>Enter the details of the match you are creating</DialogDescription>
        <DialogBody>
          <FieldGroup className="flex flex-wrap gap-x-3 gap-y-0">
            <Field className="w-full flex-1 sm:w-2/3 lg:w-3/4">
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
            <Field className="w-full sm:w-1/3 lg:w-1/4">
              <Label>Short name</Label>
              <Input
                name="short_name"
                required
                disabled={isLoading}
                invalid={!payload.location}
                placeholder="Short name..."
                onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
              />
            </Field>
          </FieldGroup>
          <FieldGroup>
            <div className="flex flex-wrap items-center gap-2">
              <Field className="w-48">
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
            </div>
          </FieldGroup>

          <FieldGroup className="mt-6 flex flex-wrap gap-x-3 gap-y-0">
            <Field className="w-full flex-1 sm:w-1/2">
              <Label>First name</Label>
              <Input
                name="contact_first_name"
                disabled={isLoading}
                placeholder="Enter contact name..."
                invalid={!payload.contact_first_name}
                onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
                autoFocus
              />
            </Field>
            <Field className="w-full sm:w-1/2">
              <Label>Last name</Label>
              <Input
                name="contact_last_name"
                required
                disabled={isLoading}
                invalid={!payload.contact_last_name}
                placeholder="Contact name..."
                onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
              />
            </Field>
            <Field className="w-full sm:w-1/2">
              <Label>Email</Label>
              <Input
                name="email"
                required
                type="email"
                disabled={isLoading}
                invalid={!payload.email}
                placeholder="Official email address..."
                onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
              />
            </Field>

            <Field className="w-full flex-1 sm:w-1/2">
              <Label>Phone</Label>
              <Input
                name="phone"
                disabled={isLoading}
                placeholder="Enter business phone..."
                invalid={!payload.contact_first_name}
                onChange={(evt) => setPayload({ ...payload, [evt.currentTarget.name]: evt.currentTarget.value })}
                autoFocus
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
                <span className="w-28">Please wait...</span>
              </>
            ) : (
              <span className="w-28">Create organization</span>
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
