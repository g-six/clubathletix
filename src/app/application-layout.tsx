'use server'

import { auth } from '@/auth'
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
import { getUserByEmail } from '@/models/user'
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
import { OrganizationDropdown } from './organizations/dropdown'

export async function ApplicationLayout({
  events,
  children,
}: {
  events: Awaited<ReturnType<typeof getTournaments>>
  children: React.ReactNode
}) {
  const session = await auth()
  let basepath = '/'

  let organization_id = ''

  if (!session?.user?.email) {
    return <section className="flex h-screen flex-col items-center justify-center px-8">{children}</section>
  }
  const user = await getUserByEmail(session.user.email)

  let isRoot = false

  let organizations: {
    organization_id: string
    name: string
    role: string
    organization: {
      logo?: string
    }
  }[] = []

  const matches: {
    match_id: string
    opponent: string
    home_or_away: string | null
    match_date: string
  }[] = []
  const teams: unknown[] = []

  user?.team_members.forEach((membership) => {
    teams.push(membership.team)
  })
  user?.organizations.forEach((membership) => {
    if (!organization_id) organization_id = membership.organization_id

    organizations.push({
      organization_id: membership.organization_id,
      name: membership.organization.name,
      role: membership.role,
      organization: {
        logo: membership.organization.logo ? `/api/files/${membership.organization.logo}` : undefined,
      },
    })
    membership.organization.leagues.forEach((league) => {
      league.matches.forEach((match) => {
        matches.push(match)
      })
    })
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
            <OrganizationDropdown
              data={organizations}
              user={{
                email: user?.email,
                first_name: user?.first_name,
                last_name: user?.last_name,
                image: user?.image,
                phone: user?.phone,
                user_id: user?.user_id,
              }}
            />
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
              {matches.map((match) => (
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
                  {user?.image ? (
                    <Avatar src={`/api/files/${user.image}`} className="size-10" square alt="" />
                  ) : (
                    <UserIcon className="size-10 rounded bg-black/20 dark:bg-white/20" />
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                      {user?.first_name}
                    </span>
                    <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                      {user?.email}
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
