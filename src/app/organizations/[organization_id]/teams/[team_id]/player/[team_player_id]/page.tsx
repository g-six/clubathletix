import { Avatar } from '@/components/avatar'
import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/components/description-list'
import { Divider } from '@/components/divider'
import { Heading, Subheading } from '@/components/heading'
import { Link } from '@/components/link'
import { getMember } from '@/data'
import { getTeamPlayerProfile, ParentUser, PlayerTeamInfo } from '@/models/team-player'
import { BanknotesIcon, CalendarIcon, ChevronLeftIcon, CreditCardIcon } from '@heroicons/react/16/solid'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RefundMember } from './refund'

export async function generateMetadata({ params }: { params: Promise<{ team_player_id: string }> }): Promise<Metadata> {
  const { team_player_id } = await params
  let teamPlayer = await getTeamPlayerProfile(team_player_id)

  return teamPlayer
    ? {
        title: teamPlayer && `${teamPlayer.player.first_name} ${teamPlayer.player.last_name}`,
      }
    : {
        title: 'Player profile not found',
      }
}

export default async function Player({ params }: { params: Promise<{ team_player_id: string }> }) {
  const { team_player_id } = await params
  const order = await getMember('3000')
  let record: PlayerTeamInfo | null = await getTeamPlayerProfile(team_player_id)

  if (!record) {
    notFound()
  }

  return (
    <>
      <div className="max-lg:hidden">
        <Link
          href={`/organizations/${record.organization_id}/teams/${record.team_id}`}
          className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400"
        >
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Go back to team
        </Link>
      </div>
      <div className="mt-4 lg:mt-8">
        <div className="flex items-center gap-4">
          <Heading>
            {[
              `${record.player.first_name} ${record.player.last_name}`,
              record.position,
              record.jersey_number ? `#${record.jersey_number}` : '',
            ]
              .filter(Boolean)
              .join(' • ')}
          </Heading>
          <Badge color="lime">Successful</Badge>
        </div>
        <div className="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
          <div className="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
            <span className="flex items-center gap-3 text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white">
              <BanknotesIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
              <span>US{order.amount.usd}</span>
            </span>
            <span className="flex items-center gap-3 text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white">
              <CreditCardIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
              <span className="inline-flex gap-3">
                {order.payment.card.type}{' '}
                <span>
                  <span aria-hidden="true">••••</span> {order.payment.card.number}
                </span>
              </span>
            </span>
            <span className="flex items-center gap-3 text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white">
              <CalendarIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
              <span>Member since {new Date(record.created_at).toLocaleDateString()}</span>
            </span>
          </div>
          <div className="flex gap-4">
            <RefundMember outline amount={order.amount.usd}>
              Refund
            </RefundMember>
            <Button>Resend Invoice</Button>
          </div>
        </div>
      </div>
      <div className="mt-12">
        <Subheading>Player info</Subheading>
        <Divider className="mt-4" />
        <DescriptionList>
          <DescriptionTerm>Name</DescriptionTerm>
          <DescriptionDetails>
            <div className="flex items-center gap-2">
              <Avatar src={order.event.thumbUrl} className="size-6" />
              <span>
                {record.player.first_name} {record.player.last_name}
              </span>
            </div>
          </DescriptionDetails>
          <DescriptionTerm>Birth year</DescriptionTerm>
          <DescriptionDetails>{record.player.birth_year}</DescriptionDetails>
          <DescriptionTerm>Parent / Guardian</DescriptionTerm>
          <DescriptionDetails>
            <Link href={order.event.url} className="flex items-center gap-2">
              <Avatar src={order.event.thumbUrl} className="size-6" />
              <span>
                {record.player.parents
                  .map((parent: ParentUser) => `${parent.user.first_name} (${parent.relationship || 'guardian'})`)
                  .join(' • ')}
              </span>
            </Link>
          </DescriptionDetails>
        </DescriptionList>
      </div>
      <div className="mt-12 hidden">
        <Subheading>Payment method</Subheading>
        <Divider className="mt-4" />
        <DescriptionList>
          <DescriptionTerm>Transaction ID</DescriptionTerm>
          <DescriptionDetails>{order.payment.transactionId}</DescriptionDetails>
          <DescriptionTerm>Card number</DescriptionTerm>
          <DescriptionDetails>•••• {order.payment.card.number}</DescriptionDetails>
          <DescriptionTerm>Card type</DescriptionTerm>
          <DescriptionDetails>{order.payment.card.type}</DescriptionDetails>
          <DescriptionTerm>Card expiry</DescriptionTerm>
          <DescriptionDetails>{order.payment.card.expiry}</DescriptionDetails>
          <DescriptionTerm>Owner</DescriptionTerm>
          <DescriptionDetails>{order.customer.name}</DescriptionDetails>
          <DescriptionTerm>Email address</DescriptionTerm>
          <DescriptionDetails>{order.customer.email}</DescriptionDetails>
          <DescriptionTerm>Address</DescriptionTerm>
          <DescriptionDetails>{order.customer.address}</DescriptionDetails>
          <DescriptionTerm>Country</DescriptionTerm>
          <DescriptionDetails>
            <span className="inline-flex gap-3">
              <img src={order.customer.countryFlagUrl} alt={order.customer.country} />
              {order.customer.country}
            </span>
          </DescriptionDetails>
          <DescriptionTerm>CVC</DescriptionTerm>
          <DescriptionDetails>
            <Badge color="lime">Passed successfully</Badge>
          </DescriptionDetails>
        </DescriptionList>
      </div>
    </>
  )
}
