'use client'

import { signOut } from '@/services/session.service'
import {
  ArrowRightStartOnRectangleIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from '@heroicons/react/16/solid'
import { useState } from 'react'
import { DropdownDivider, DropdownItem, DropdownLabel, DropdownMenu } from '../dropdown'
import Spinner from '../spinner'

export function AccountDropdownMenu({ anchor }: { anchor: 'top start' | 'bottom end' }) {
  const [isLoading, setIsLoading] = useState(false)
  return (
    <DropdownMenu className="min-w-64" anchor={anchor}>
      <DropdownItem href="#">
        <UserCircleIcon />
        <DropdownLabel>My account</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem href="#">
        <ShieldCheckIcon />
        <DropdownLabel>Privacy policy</DropdownLabel>
      </DropdownItem>
      <DropdownItem href="#">
        <LightBulbIcon />
        <DropdownLabel>Share feedback</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem
        onClick={() => {
          setIsLoading(true)
          signOut().finally(() => {
            setIsLoading(false)
            location.href = `/login`
          })
        }}
      >
        <ArrowRightStartOnRectangleIcon />
        <DropdownLabel>Sign out {isLoading && <Spinner />}</DropdownLabel>
      </DropdownItem>
    </DropdownMenu>
  )
}
