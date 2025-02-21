import { Divider } from '@/components/divider'
import { CalendarIcon } from '@heroicons/react/16/solid'
import Link from 'next/link'
import { JSX } from 'react'

export function Card({ title, contents, href }: { title: string; contents: JSX.Element; href?: string }) {
  return (
    <div>
      <Divider />
      <div className="mt-6 flex items-center gap-1 text-lg/6 font-medium sm:text-sm/6">
        <CalendarIcon className="size-4" /> {title}
      </div>
      <div className="mt-2 min-h-12 text-sm/6 sm:text-xs/6">{contents}</div>
      {href && (
        <div className="mt-3 flex justify-between text-sm/6 sm:text-xs/6">
          <Link href={href} className="text-zinc-500">
            View all &rarr;
          </Link>
        </div>
      )}
    </div>
  )
}
