import { Stat } from '@/app/stat'
import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { Heading, Subheading } from '@/components/heading'
import { Link } from '@/components/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { getTournament, getTournamentMembers } from '@/data'
import { ChevronLeftIcon } from '@heroicons/react/16/solid'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  let tournament = await getTournament(params.id)

  return {
    title: tournament?.name,
  }
}

export default async function Tournament({ params }: { params: { id: string } }) {
  let tournament = await getTournament(params.id)
  let orders = await getTournamentMembers(params.id)

  if (!tournament) {
    notFound()
  }

  return (
    <>
      <div className="max-lg:hidden">
        <Link href="/tournaments" className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Schedule
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="w-32 shrink-0">
            <img className="aspect-3/2 rounded-lg shadow-sm" src={tournament.imgUrl} alt="" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Heading>{tournament.name}</Heading>
              <Badge color={tournament.status === 'On Sale' ? 'lime' : 'zinc'}>{tournament.status}</Badge>
            </div>
            <div className="mt-2 text-sm/6 text-zinc-500">
              {tournament.date} at {tournament.time} <span aria-hidden="true">·</span> {tournament.location}
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <Button outline>Edit</Button>
          <Button>View</Button>
        </div>
      </div>
      <div className="mt-8 grid gap-8 sm:grid-cols-3">
        <Stat title="Total revenue" value={tournament.totalRevenue} change={tournament.totalRevenueChange} />
        <Stat
          title="Tickets sold"
          value={`${tournament.ticketsSold}/${tournament.ticketsAvailable}`}
          change={tournament.ticketsSoldChange}
        />
        <Stat title="Pageviews" value={tournament.pageViews} change={tournament.pageViewsChange} />
      </div>
      <Subheading className="mt-12">Recent orders</Subheading>
      <Table className="mt-4 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Member number</TableHeader>
            <TableHeader>Purchase date</TableHeader>
            <TableHeader>Customer</TableHeader>
            <TableHeader className="text-right">Amount</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} href={order.url} title={`Member #${order.id}`}>
              <TableCell>{order.id}</TableCell>
              <TableCell className="text-zinc-500">{order.date}</TableCell>
              <TableCell>{order.customer.name}</TableCell>
              <TableCell className="text-right">US{order.amount.usd}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
