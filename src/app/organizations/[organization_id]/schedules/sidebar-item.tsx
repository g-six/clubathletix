'use client'

import { SidebarItem, SidebarLabel } from '@/components/sidebar'
import * as Headless from '@headlessui/react'
import { UserGroupIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { forwardRef } from 'react'

export const TeamSidebarItem = forwardRef(function TeamSidebarItem(
  {
    current,
    className,
    children,
    ...props
  }: { current?: boolean; className?: string; children: React.ReactNode } & (
    | Omit<Headless.ButtonProps, 'as' | 'className'>
    | Omit<Headless.ButtonProps<typeof Link>, 'as' | 'className'>
  ),
  ref: React.ForwardedRef<HTMLAnchorElement | HTMLButtonElement>
) {
  const pathname = usePathname()
  const pathnameSegments = pathname
    .split('/')
    .map((m) => m.trim())
    .filter(Boolean)
  return (
    <SidebarItem
      href={`/${pathnameSegments.slice(0, 2).join('/')}/teams`}
      current={
        Boolean(pathnameSegments?.length) &&
        pathnameSegments[0].startsWith('organization') &&
        pathnameSegments[2]?.startsWith('team')
      }
    >
      <UserGroupIcon />
      <SidebarLabel>Teams</SidebarLabel>
    </SidebarItem>
  )
})
