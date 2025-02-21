import { Avatar } from '@/components/avatar'
import { Button } from '@/components/button'
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/dropdown'
import { SidebarItem, SidebarLabel } from '@/components/sidebar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { getMembers } from '@/data'
import { ChevronDownIcon, PlusIcon } from '@heroicons/react/16/solid'
import type { Metadata } from 'next'
import { list } from '../actions'
import { TeamDropdown } from './teams/dropdown'

export const metadata: Metadata = {
  title: 'Members',
}

export default async function OrganizationPage(props: { params: Promise<unknown> }) {
  let orders = await getMembers()

  const { organization_id } = (await props.params) as { organization_id: string }
  const organization = await list(organization_id)
  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div className="flex w-1/3">
          <Dropdown>
            <DropdownButton as={SidebarItem}>
              <Avatar src="/teams/catalyst.svg" />
              <SidebarLabel>ClubAthletix</SidebarLabel>
              <ChevronDownIcon />
            </DropdownButton>
            <DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
              <TeamDropdown data={organization.Team} />
              <DropdownDivider />
              <DropdownItem href="#">
                <PlusIcon />
                <DropdownLabel>New team&hellip;</DropdownLabel>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <Button className="-my-0.5">Send Invites</Button>
      </div>
      <Table className="mt-8 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Member number</TableHeader>
            <TableHeader>Purchase date</TableHeader>
            <TableHeader>Customer</TableHeader>
            <TableHeader>Tournament</TableHeader>
            <TableHeader className="text-right">Amount</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} href={order.url} title={`Member #${order.id}`}>
              <TableCell>{order.id}</TableCell>
              <TableCell className="text-zinc-500">{order.date}</TableCell>
              <TableCell>{order.customer.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar src={order.event.thumbUrl} className="size-6" />
                  <span>{order.event.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">US{order.amount.usd}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
