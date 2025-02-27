import { Heading } from '@/components/heading'
import { prisma } from '@/prisma'
import { Organization, Team, User } from '@prisma/client'

export default async function InvitesPage(props: {
  params: Promise<{ invitation_id: string }>
  searchParams: Promise<{ team?: string; organization?: string }>
}) {
  const params = await props.params
  const searchParams = await props.searchParams

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
        <section className="m-auto p-8 text-center">
          <Heading>You're all set, {member?.first_name}!</Heading>
          <p>Welcome to {team?.name}</p>
          <p className="my-8 text-sm font-light text-slate-500">You may close this window</p>
        </section>
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
