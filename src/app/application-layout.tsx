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
import { getOrganizationsByUserId } from '@/models/organization'
import { ChevronUpIcon } from '@heroicons/react/16/solid'
import {
  CalendarIcon,
  Cog6ToothIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/20/solid'
import { cookies } from 'next/headers'
import { OrganizationDropdown } from './organizations/dropdown'

export async function ApplicationLayout({
  events,
  children,
}: {
  events: Awaited<ReturnType<typeof getTournaments>>
  children: React.ReactNode
}) {
  const cookieStore = await cookies()

  let organization_id = cookieStore.get('organization_id')?.value || ''
  let basepath = '/'
  if (cookieStore.get('session_id')?.value) {
    const organizations = await getOrganizationsByUserId(cookieStore.get('session_id')?.value || '')
    if (!organization_id) {
      organization_id = organizations[0]?.organization_id || ''
    }

    basepath = `/organizations/${organization_id}`
  } else {
    return <section className="flex h-screen flex-col items-center justify-center px-8">{children}</section>
  }

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
        !cookieStore.get('session_id')?.value ? null : (
          <Sidebar>
            <SidebarHeader>
              <OrganizationDropdown data={organizations} />
            </SidebarHeader>

            <SidebarBody>
              <SidebarSection>
                <SidebarItem href={basepath}>
                  <HomeIcon />
                  <SidebarLabel>Home</SidebarLabel>
                </SidebarItem>
                {cookieStore.get('role')?.value === 'root' && (
                  <SidebarItem href={`${basepath}/leagues`}>
                    <CalendarIcon />
                    <SidebarLabel>Leagues</SidebarLabel>
                  </SidebarItem>
                )}
                <SidebarItem href={`${basepath}/teams`}>
                  <UserGroupIcon />
                  <SidebarLabel>Teams</SidebarLabel>
                </SidebarItem>
                <SidebarItem href={`${basepath}/schedules`}>
                  <CalendarIcon />
                  <SidebarLabel>Schedules</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="/settings">
                  <Cog6ToothIcon />
                  <SidebarLabel>Settings</SidebarLabel>
                </SidebarItem>
              </SidebarSection>

              <SidebarSection className="max-lg:hidden">
                <SidebarHeading>Upcoming Tournaments</SidebarHeading>
                {events.map((event) => (
                  <SidebarItem key={event.id} href={event.url}>
                    {event.name}
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
                    <Avatar src="/users/erica.jpg" className="size-10" square alt="" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                        {cookieStore.get('first_name')?.value || ''}
                      </span>
                      <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                        {cookieStore.get('email')?.value || ''}
                      </span>
                    </span>
                  </span>
                  <ChevronUpIcon />
                </DropdownButton>
                <AccountDropdownMenu anchor="top start" />
              </Dropdown>
            </SidebarFooter>
          </Sidebar>
        )
      }
    >
      {children}
    </SidebarLayout>
  )
}
