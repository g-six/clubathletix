'use client'
import { Alert } from '@/components/alert'
import { Button } from '@/components/button'
import { Checkbox, CheckboxField } from '@/components/checkbox'
import { Divider } from '@/components/divider'
import { Field, Label } from '@/components/fieldset'
import { Heading, Subheading } from '@/components/heading'
import { Input } from '@/components/input'
import { Text } from '@/components/text'
import { getProfile } from '@/services/user.service'
import { useCallback, useEffect, useState } from 'react'
import { updateAccount } from './actions'

export default function Settings() {
  const [user, setUser] = useState<{ [k: string]: string }>({})
  const [loading, toggleLoader] = useState(false)
  const [message, setMessage] = useState<string>('')
  const cb = useCallback(async () => {
    return await getProfile()
  }, [])

  useEffect(() => {
    cb().then(setUser)
  }, [])

  console.log(user)

  return (
    <form
      className="mx-auto max-w-4xl"
      action={() => {
        toggleLoader(true)
        updateAccount(user)
          .then(() => {
            setMessage('Account successfully updated.')
          })
          .finally(() => {
            toggleLoader(false)
          })
      }}
    >
      <Alert
        open={Boolean(message)}
        onClose={() => {
          setMessage('')
        }}
      >
        {message}
      </Alert>
      <Heading>Settings</Heading>
      <Divider className="my-10 mt-6" />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Name</Subheading>
          <Text>This will be displayed on your public profile.</Text>
        </div>
        <div>
          <div className="flex gap-1">
            <Field>
              <Label>First name</Label>
              <Input
                aria-label="First name"
                name="first_name"
                defaultValue={user.first_name}
                onChange={(evt) => {
                  setUser((prev: { [k: string]: string }) => ({
                    ...prev,
                    [evt.target.name]: evt.target.value,
                  }))
                }}
              />
            </Field>
            <Field>
              <Label>Last name</Label>
              <Input
                aria-label="Last name"
                name="last_name"
                defaultValue={user.last_name}
                onChange={(evt) => {
                  setUser((prev: { [k: string]: string }) => ({
                    ...prev,
                    [evt.target.name]: evt.target.value,
                  }))
                }}
              />
            </Field>
          </div>
        </div>
      </section>
      {/* 
      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Organization Bio</Subheading>
          <Text>This will be displayed on your public profile. Maximum 240 characters.</Text>
        </div>
        <div>
          <Textarea aria-label="Organization Bio" name="bio" />
        </div>
      </section> */}

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Email</Subheading>
          <Text>This is your account email address.</Text>
        </div>
        <Field className="space-y-4">
          <Input type="email" aria-label="Organization Email" name="email" defaultValue={user.email} readOnly />
          <CheckboxField>
            <Checkbox name="email_is_public" defaultChecked />
            <Label>Show email on public profile</Label>
          </CheckboxField>
        </Field>
      </section>

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Password</Subheading>
          <Text>Enter your new password</Text>
        </div>
        <Field>
          <Input
            aria-label="Password"
            name="password"
            type="password"
            onChange={(evt) => {
              setUser((prev: { [k: string]: string }) => ({
                ...prev,
                [evt.target.name]: evt.target.value,
              }))
            }}
          />
        </Field>
      </section>
      {/* <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Address</Subheading>
          <Text>This is where your organization is registered.</Text>
        </div>
        <Address />
      </section> */}

      {/* <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Currency</Subheading>
          <Text>The currency that your organization will be collecting.</Text>
        </div>
        <div>
          <Select aria-label="Currency" name="currency" defaultValue="cad">
            <option value="cad">CAD - Canadian Dollar</option>
            <option value="usd">USD - United States Dollar</option>
          </Select>
        </div>
      </section> */}

      <Divider className="my-10" soft />

      <div className="flex items-center justify-end gap-4">
        <Button type="submit" className="flex w-38 items-center justify-center">
          {loading ? (
            <>
              <img src="/loaders/default.gif" alt="loading" className="h-4 w-4 rounded-full bg-white" />
              Please wait
            </>
          ) : (
            'Save changes'
          )}
        </Button>
      </div>
    </form>
  )
}
