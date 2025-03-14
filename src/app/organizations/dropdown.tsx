'use client'
import { Avatar } from '@/components/avatar'
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/dropdown'
import { SidebarItem, SidebarLabel } from '@/components/sidebar'
import { SessionUser } from '@/typings/user'
import { ChevronDownIcon, UserGroupIcon } from '@heroicons/react/16/solid'
import cookieJar from 'js-cookie'
import { useEffect, useState } from 'react'

export function OrganizationDropdown({
  data,
  url,
  user,
}: {
  data: {
    organization_id: string
    name: string
    role: string
    organization: {
      logo?: string
    }
  }[]
  user: SessionUser
  url?: string
}) {
  let organization_id = url?.split('/').pop() || ''
  if (!url?.endsWith(`/organizations/${organization_id}`)) {
    organization_id = cookieJar.get('organization_id') || data?.at(0)?.organization_id || organization_id
  }
  const [current, setCurrent] = useState<(typeof data)[0] | undefined>()

  useEffect(() => {
    cookieJar.set('organization_id', organization_id)
    setCurrent(data.find((record) => record.organization_id === organization_id))
  }, [])

  useEffect(() => {
    if (current?.organization_id) {
      cookieJar.set('organization_id', current.organization_id)
    }
  }, [current?.organization_id])
  return (
    <Dropdown>
      {current?.organization && (
        <DropdownButton as={SidebarItem}>
          <Avatar src={current.organization.logo || `/teams/catalyst.svg`} />
          <SidebarLabel>{current.name || 'ClubAthletix'}</SidebarLabel>
          <ChevronDownIcon />
        </DropdownButton>
      )}
      <DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
        {data.map((org) => (
          <DropdownItem key={org.organization_id} onClick={() => setCurrent(org)}>
            <Avatar slot="icon" src={org.organization.logo || `/teams/catalyst.svg`} />
            <DropdownLabel>{org.name}</DropdownLabel>
          </DropdownItem>
        ))}
        {cookieJar.get('role') === 'root' && (
          <>
            <DropdownDivider />
            <DropdownItem href="/organizations/new">
              <UserGroupIcon />
              <DropdownLabel>Create organization&hellip;</DropdownLabel>
            </DropdownItem>
          </>
        )}
      </DropdownMenu>
    </Dropdown>
  )
}
