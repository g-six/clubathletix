'use server'
import { Avatar } from '@/components/avatar'
import { Dropdown, DropdownButton } from '@/components/dropdown'
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@/components/navbar'
import { AccountDropdownMenu } from '@/components/session/account.dropdown'
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from '@/components/sidebar'
import { SidebarLayout } from '@/components/sidebar-layout'
import { getTournaments } from '@/data'
import { getAuthForOperation } from '@/models/auth'
import { SessionMatch } from '@/typings/match'
import { SessionOrganization } from '@/typings/organization'
import { SessionTeam } from '@/typings/team'
import { ArrowTrendingUpIcon, ChevronUpIcon, TrophyIcon } from '@heroicons/react/16/solid'
import {
  CalendarIcon,
  Cog6ToothIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/20/solid'
import { UserOrganization } from '@prisma/client'
import { headers } from 'next/headers'
import { OrganizationDropdown } from './organizations/dropdown'

export async function ApplicationLayout({
  events,
  children,
}: {
  events: Awaited<ReturnType<typeof getTournaments>>
  children: React.ReactNode
}) {
  const session = await getAuthForOperation().catch(console.error)
  let basepath = '/'

  let organization_id = ''

  if (!session?.email) {
    return <section className="flex h-screen flex-col items-center justify-center px-8">{children}</section>
  }

  let isRoot = false

  let organizations: {
    organization_id: string
    name: string
    role: string
    organization: {
      logo?: string
    }
  }[] = []

  const matches: SessionMatch[] = []
  const teams: SessionTeam[] = []

  session?.team_members.forEach((membership: { team: SessionTeam }) => {
    teams.push(membership.team)
  })
  session.organizations.forEach((membership: UserOrganization & { organization: SessionOrganization }) => {
    if (!organization_id) organization_id = membership.organization_id

    organizations.push({
      organization_id: membership.organization_id,
      name: membership.organization.name,
      role: membership.role,
      organization: {
        logo: membership.organization.logo ? `/api/files/${membership.organization.logo}` : undefined,
      },
    })
  })

  const headersList = await headers()
  const url = headersList.get('x-url') || ''
  teams.forEach((team) => {
    matches.push(...team.matches)
  })

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarSection>
            <Dropdown>
              <DropdownButton as={NavbarItem}>
                <Avatar src="/users/erica.jpg" square />
              </DropdownButton>
              <AccountDropdownMenu anchor="bottom end" />
            </Dropdown>
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <OrganizationDropdown data={organizations} user={session} url={url} />
          </SidebarHeader>

          <SidebarBody>
            <SidebarSection>
              <SidebarItem href={basepath}>
                <HomeIcon />
                <SidebarLabel>Home</SidebarLabel>
              </SidebarItem>
              {isRoot && (
                <SidebarItem href="leagues">
                  <CalendarIcon />
                  <SidebarLabel>Leagues</SidebarLabel>
                </SidebarItem>
              )}
              <SidebarItem href="teams">
                <UserGroupIcon />
                <SidebarLabel>Teams</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="matches">
                <TrophyIcon />
                <SidebarLabel>Matches</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="trainings">
                <ArrowTrendingUpIcon />
                <SidebarLabel>Trainings</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="settings">
                <Cog6ToothIcon />
                <SidebarLabel>Settings</SidebarLabel>
              </SidebarItem>
            </SidebarSection>

            <SidebarSection className="max-lg:hidden">
              <SidebarHeading>Upcoming Matches</SidebarHeading>
              {matches.slice(0, 5).map((match) => (
                <SidebarItem key={match.match_id} href={`/matches/${match.match_id}`}>
                  {match.opponent}
                </SidebarItem>
              ))}
            </SidebarSection>

            <SidebarSpacer />

            <SidebarSection>
              <SidebarItem href="#">
                <QuestionMarkCircleIcon />
                <SidebarLabel>Support</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="#">
                <SparklesIcon />
                <SidebarLabel>Changelog</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>

          <SidebarFooter className="max-lg:hidden">
            <Dropdown>
              <DropdownButton as={SidebarItem}>
                <span className="flex min-w-0 items-center gap-3">
                  {session.image ? (
                    <Avatar src={`/api/files/${session.image}`} className="size-10" square alt="" />
                  ) : (
                    <UserIcon className="size-10 rounded bg-black/20 dark:bg-white/20" />
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                      {session.first_name}
                    </span>
                    <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                      {session.email}
                    </span>
                  </span>
                </span>
                <ChevronUpIcon />
              </DropdownButton>
              <AccountDropdownMenu anchor="top start" />
            </Dropdown>
          </SidebarFooter>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  )
}
