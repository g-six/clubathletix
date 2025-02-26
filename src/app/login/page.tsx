'use client'

import { Alert } from '@/components/alert'
import { Button } from '@/components/button'
import { Checkbox, CheckboxField } from '@/components/checkbox'
import { Divider } from '@/components/divider'
import { Label } from '@/components/fieldset'
import { Heading, Subheading } from '@/components/heading'
import { Input } from '@/components/input'
import { Text } from '@/components/text'
import Logo from '@/images/logos/mustang.png'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { FormEvent, useState } from 'react'
// import { Address } from './address'
function isValidEmail(email: string) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

export default function Login() {
  const pathname = usePathname()
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')

  if (pathname === '/') location.href = '/login'
  return (
    <form
      method="post"
      className="mx-auto max-w-2xl"
      onSubmit={(evt: FormEvent<HTMLFormElement>) => {
        evt.preventDefault()
        setLoading(true)
        const form = evt.currentTarget
        const elements = form.elements as typeof form.elements & {
          [k: string]: HTMLInputElement
        }
        const payload = {
          email: elements.email.value,
          password: elements.password.value,
        }
        fetch('/api/login', {
          headers: {
            contentType: 'application/json',
          },
          body: JSON.stringify(payload),
          method: 'POST',
        })
          .then((res) => {
            res.json().then((data) => {
              if (data.session_id) {
                if (data.organization_id) {
                  location.href = `/organizations/${data.organization_id}`
                } else location.href = '/dashboard'
              } else {
                setError('Invalid email or password')
              }
            })
          })
          .finally(() => {
            setLoading(false)
          })
      }}
    >
      <Heading className="text-center">
        <Image
          src={Logo}
          alt="ClubAthletix"
          className="mx-auto w-auto text-slate-900"
          sizes="(min-width: 1280px) 3rem, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 20vw"
          priority
        />
        Login to ClubAthletix
      </Heading>
      <Divider className="my-10 mt-6" />

      <section className="grid gap-x-8 gap-y-6 lg:grid-cols-3">
        <div className="space-y-1">
          <Subheading>Email</Subheading>
          <Text>Enter the email address used to sign-up for ClubAthletix.</Text>
        </div>
        <div className="space-y-4 lg:col-span-2">
          <Input
            type="email"
            aria-label="Organization Email"
            name="email"
            placeholder="info@example.com"
            autoComplete="off"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </section>

      {/* <Divider className="my-10" soft /> */}

      {/* <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Address</Subheading>
          <Text>This is where your organization is registered.</Text>
        </div>
        <Address />
      </section> */}

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 lg:grid-cols-3">
        <div className="space-y-1">
          <Subheading>Password</Subheading>
          <Text>Enter password.</Text>
        </div>
        <div className="space-y-2 lg:col-span-2">
          <Input type="password" aria-label="Password" name="password" placeholder="••••••••••••" />
          <CheckboxField>
            <Checkbox name="remember_me" defaultChecked />
            <Label>Remember me on this device</Label>
          </CheckboxField>
        </div>
      </section>

      <Divider className="my-10" soft />

      <div className="flex flex-col-reverse justify-end gap-4 md:flex-row">
        {email && isValidEmail(email) && (
          <Button
            type="button"
            plain
            onClick={() => {
              setLoading(true)

              // const payload = {
              //   email,
              // }
              // fetch('/api/reset-password', {
              //   headers: {
              //     contentType: 'application/json',
              //   },
              //   body: JSON.stringify(payload),
              //   method: 'POST',
              // })
              //   .then((res) => {
              //     res.json().then((data) => {
              //       if (data.id) {
              //         location.href = '/dashboard'
              //       } else {
              //         setError('Invalid email or password')
              //       }
              //     })
              //   })
              //   .finally(() => {
              //     setLoading(false)
              //   })
            }}
          >
            Click here to request a password reset email
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          Login
        </Button>
      </div>
      <Alert
        open={Boolean(error)}
        onClose={() => {}}
        size="sm"
        className="flex flex-col gap-6 text-center font-semibold text-red-200"
        title="Invalid email or password"
      >
        {error}
        <Button
          type="button"
          autoFocus
          onClick={() => {
            setError('')
          }}
          plain
        >
          Close
        </Button>
      </Alert>
    </form>
  )
}
