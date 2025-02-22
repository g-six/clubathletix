import { Divider } from '@/components/divider'
import { Subheading } from '@/components/heading'
import { Link } from '@/components/link'
import ScoreBoardSection from '@/components/matches/scoreboard.section'
import { getMember } from '@/data'
import { formatDateTime } from '@/lib/date-helper'
import { getMatch } from '@/models/match'
import { CalendarIcon, ChevronLeftIcon, MapPinIcon } from '@heroicons/react/16/solid'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: Promise<{ match_id: string }> }): Promise<Metadata> {
  const { match_id } = await params

  const match = await getMatch(match_id)

  return {
    title:
      match &&
      (match.home_or_away === 'home'
        ? `${match.team.name} vs ${match.opponent}`
        : `${match.opponent} vs ${match.team.name}`),
  }
}

export default async function TeamMatchPage({ params }: { params: { match_id: string } }) {
  const { match_id } = await params
  const match = await getMatch(match_id)

  if (!match) notFound()

  let order = await getMember('3000')

  if (!order) {
    notFound()
  }

  return (
    <>
      <div className="max-lg:hidden">
        <Link href="/members" className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Back
        </Link>
      </div>
      <div className="mt-4 lg:mt-8">
        <div className="mb-4 flex items-center justify-center gap-4 text-xs font-bold text-zinc-400">
          {match.league.name}
        </div>

        <ScoreBoardSection match={match} />

        <Divider className="my-8" />
        <section className="text-center">
          <Subheading>Game Information</Subheading>
          <div className="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4 text-xs">
            <div className="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
              <span className="flex items-center gap-3 text-zinc-950 dark:text-white">
                <MapPinIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
                <span>{match.location}</span>
              </span>
              <span className="flex items-center gap-3 text-zinc-950 dark:text-white">
                <CalendarIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
                <span>{formatDateTime(new Date(match.match_date))}</span>
              </span>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
