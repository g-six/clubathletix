import { Divider } from '@/components/divider'
import Link from 'next/link'
import { JSX } from 'react'

export function Card({
  title,
  contents,
  href,
  CreateDialog,
}: {
  title: string
  contents?: JSX.Element
  CreateDialog?: JSX.Element
  href?: string
}) {
  return (
    <div>
      <Divider />
      <div className="mt-6 text-lg/6 font-medium sm:text-sm/6">{title}</div>
      <div className="mt-2 min-h-12 text-sm/6 sm:text-xs/6">{contents}</div>
      {href && (
        <div className="mt-3 flex justify-between text-sm/6 sm:text-xs/6">
          {CreateDialog}
          <Link href={href} className="text-zinc-500">
            View all &rarr;
          </Link>
        </div>
      )}
    </div>
  )
}
