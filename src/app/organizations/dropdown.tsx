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
import { setActiveOrganization } from '@/services/organization.service'
import { ChevronDownIcon, Cog8ToothIcon, UserGroupIcon } from '@heroicons/react/16/solid'
import cookieJar from 'js-cookie'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
export function OrganizationDropdown({
  data,
}: {
  data: {
    organization_id: string
    name: string
    role: string
    organization: {
      logo: string
    }
  }[]
}) {
  const params = useParams()
  const [organization, setOrganization] = useState(data.find((org) => org.organization_id === params.organization_id))

  const activateOrganization = useCallback(async (organization_id: string) => {
    const x = await setActiveOrganization(organization_id)
    if (x.userOrganization?.role) {
      location.href = `/organizations/${organization_id}`
    }
  }, [])

  useEffect(() => {
    if (organization?.organization_id && params.organization_id !== organization?.organization_id) {
      activateOrganization(organization.organization_id)
    }
  }, [organization])

  useEffect(() => {
    if (!params.organization_id && data.length) {
      location.href = `/organizations/${data[0].organization_id}`
    }
  }, [])

  return (
    <Dropdown>
      <DropdownButton as={SidebarItem}>
        <Avatar src={organization?.organization.logo || `/teams/catalyst.svg`} />
        <SidebarLabel>{organization?.name || 'ClubAthletix'}</SidebarLabel>
        <ChevronDownIcon />
      </DropdownButton>
      <DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
        <DropdownItem href={`/organizations/${organization?.organization_id}/settings`}>
          <Cog8ToothIcon />
          <DropdownLabel>Settings</DropdownLabel>
        </DropdownItem>
        {Boolean(data.length) && <DropdownDivider />}
        {data.map((org) => (
          <DropdownItem onClick={() => setOrganization(org)} key={org.organization_id}>
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
