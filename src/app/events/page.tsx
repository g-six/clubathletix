import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { Divider } from '@/components/divider'
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '@/components/dropdown'
import { Heading } from '@/components/heading'
import { Input, InputGroup } from '@/components/input'
import { Link } from '@/components/link'
import { Select } from '@/components/select'
import { getTournaments } from '@/data'
import { EllipsisVerticalIcon, MagnifyingGlassIcon } from '@heroicons/react/16/solid'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Schedule',
}

export default async function Tournaments() {
  let tournaments = await getTournaments()

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-sm:w-full sm:flex-1">
          <Heading>Schedule</Heading>
          <div className="mt-4 flex max-w-xl gap-4">
            <div className="flex-1">
              <InputGroup>
                <MagnifyingGlassIcon />
                <Input name="search" placeholder="Search tournaments&hellip;" />
              </InputGroup>
            </div>
            <div>
              <Select name="sort_by">
                <option value="name">Sort by name</option>
                <option value="date">Sort by date</option>
                <option value="status">Sort by status</option>
              </Select>
            </div>
          </div>
        </div>
        <Button>Create tournament</Button>
      </div>
      <ul className="mt-10">
        {tournaments.map((tournament, index) => (
          <li key={tournament.id}>
            <Divider soft={index > 0} />
            <div className="flex items-center justify-between">
              <div key={tournament.id} className="flex gap-6 py-6">
                <div className="w-32 shrink-0">
                  <Link href={tournament.url} aria-hidden="true">
                    <img className="aspect-3/2 rounded-lg shadow-sm" src={tournament.imgUrl} alt="" />
                  </Link>
                </div>
                <div className="space-y-1.5">
                  <div className="text-base/6 font-semibold">
                    <Link href={tournament.url}>{tournament.name}</Link>
                  </div>
                  <div className="text-xs/6 text-zinc-500">
                    {tournament.date} at {tournament.time} <span aria-hidden="true">·</span> {tournament.location}
                  </div>
                  <div className="text-xs/6 text-zinc-600">
                    {tournament.ticketsSold}/{tournament.ticketsAvailable} tickets sold
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge className="max-sm:hidden" color={tournament.status === 'On Sale' ? 'lime' : 'zinc'}>
                  {tournament.status}
                </Badge>
                <Dropdown>
                  <DropdownButton plain aria-label="More options">
                    <EllipsisVerticalIcon />
                  </DropdownButton>
                  <DropdownMenu anchor="bottom end">
                    <DropdownItem href={tournament.url}>View</DropdownItem>
                    <DropdownItem>Edit</DropdownItem>
                    <DropdownItem>Delete</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
