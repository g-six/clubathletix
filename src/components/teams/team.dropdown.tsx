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
import { ChevronDownIcon, PlusIcon } from '@heroicons/react/16/solid'
import cookieJar from 'js-cookie'
import { useEffect, useState } from 'react'
export function TeamDropdown({
  data,
  selected,
  anchor = 'bottom start',
  className,
}: {
  data: {
    team_id: string
    organization_id: string
    name: string
    short_name?: string
  }[]
  selected?: string
  anchor?: 'bottom start' | 'bottom end' | 'top start' | 'top end'
  className?: string
}) {
  const [team, setTeam] = useState<(typeof data)[0] | null>()
  useEffect(() => {
    if (selected) {
      setTeam(data.find((t) => t.team_id === selected))
    }
  }, [selected, data])

  return (
    <Dropdown>
      <DropdownButton as={SidebarItem} className={className}>
        <Avatar src="/teams/catalyst.svg" />
        <SidebarLabel>{team?.name || 'Select team'}</SidebarLabel>
        <ChevronDownIcon />
      </DropdownButton>
      <DropdownMenu className="w-full" anchor={anchor}>
        {data.map((t) => (
          <DropdownItem
            href={`/organizations/${t.organization_id}/teams/${t.team_id}`}
            onClick={() => {
              cookieJar.set('organization_id', t.organization_id)
              setTeam(t)
            }}
            key={t.team_id}
          >
            <Avatar slot="icon" src="/teams/catalyst.svg" />
            <DropdownLabel>{t.name}</DropdownLabel>
          </DropdownItem>
        ))}
        <DropdownDivider />
        <DropdownItem href="#">
          <PlusIcon />
          <DropdownLabel>New team&hellip;</DropdownLabel>
        </DropdownItem>
        <DropdownItem href="#">
          <PlusIcon />
          <DropdownLabel>Add player&hellip;</DropdownLabel>
        </DropdownItem>
        <DropdownItem href="#">
          <PlusIcon />
          <DropdownLabel>Add coach&hellip;</DropdownLabel>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
