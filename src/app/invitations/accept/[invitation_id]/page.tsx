import { Field, Label } from '@/components/fieldset'
import { Heading } from '@/components/heading'
import { Input } from '@/components/input'
import { prisma } from '@/prisma'
import { Organization, Team, User } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'

export default async function InvitesPage(props: {
  params: Promise<{ invitation_id: string }>
  searchParams: Promise<{ team?: string; organization?: string; pw?: string }>
}) {
  const params = await props.params
  const searchParams = await props.searchParams
  //http://localhost:3000/invitations/accept/cm853h5va00007lxzbxdwjw4p?team=cm7mdm28c000f7lxfi6d2tcjp
  const user: User | null = await prisma.user.findUnique({
    where: {
      user_id: params.invitation_id,
    },
  })

  if (!user) {
    return <div>Invitation not found</div>
  } else if (user.password_reset_token) {
    if (user.password_reset_token !== user.hashed_password) return <div>Invitation is not valid</div>
  } else {
    return <div>Invitation is not valid</div>
  }

  let team: (Team & { members: { role: string; user: User }[] }) | null = null
  let organization: Organization | null = null
  if (searchParams.team) {
    team = await prisma.team.findUnique({
      where: {
        team_id: searchParams.team,
      },
      include: {
        members: {
          where: {
            user_id: params.invitation_id,
          },
          include: {
            user: true,
          },
        },
      },
    })

    if (team) {
      organization = await prisma.organization.findUnique({
        where: {
          organization_id: team.organization_id,
        },
      })
      const member = (team?.members || [])
        .filter((m) => m.user)
        .map((m) => ({
          role: m.role,
          first_name: m.user.first_name,
          last_name: m.user.last_name,
          user: undefined,
          team: {
            name: team?.name,
            division: team?.division,
            age_group: team?.age_group,
          },
        }))
        .pop()
      return (
        <form
          className="m-auto p-8 text-center"
          action={async (data) => {
            'use server'
            try {
              const password = data.get('password') || ''
              if (searchParams && searchParams?.pw && password) {
                const hashed_password = bcrypt.hashSync(password as string, process.env.AUTH_SALT)
                const passwd = bcrypt.hashSync(searchParams.pw, process.env.AUTH_SALT)

                prisma.user
                  .update({
                    where: {
                      user_id: user.user_id,
                      hashed_password: passwd,
                    },
                    data: {
                      hashed_password,
                    },
                  })
                  .then(() => {
                    redirect('/login')
                  })
              }
            } catch (error) {
              if (error instanceof AuthError) {
                switch (error.type) {
                  case 'CredentialsSignin':
                    console.log('Invalid credentials.')
                    break
                  default:
                    console.log('Something went wrong.')
                    break
                }
              }
              throw error
            }

            // updatePassword({
            //   user_id: params.invitation_id,
            //   ...searchParams,
            //   ...(data as unknown as { [k: string]: string }),
            // })
          }}
        >
          <Heading>
            Welcome to {team?.name}, {member?.first_name}
          </Heading>
          <Field>
            <Label>To begin, enter a password of your choice (and keep it in a safe place)</Label>
            <Input type="password" name="password" />
          </Field>
        </form>
      )
    } else if (searchParams.organization) {
      organization = await prisma.organization.findUnique({
        where: {
          organization_id: searchParams.organization,
        },
      })
      return (
        <section className="m-auto p-8 text-center">
          <Heading>You're all set, {user.first_name}!</Heading>
          <p>Welcome to {organization?.name}</p>
          <p className="my-8 text-sm font-light text-slate-500">You may close this window</p>
        </section>
      )
    }
  }
}
