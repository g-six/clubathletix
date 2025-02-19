'use client'
import { Heading } from '@/components/heading'
import { useParams } from 'next/navigation'

export default function InvitesPage() {
  const params = useParams()

  return (
    <section className="m-auto p-8 text-center" data-id={params.invitation_id}>
      <Heading>You're all set!</Heading>
      <p>See you there.</p>
      <p className="my-8 text-sm font-light text-slate-500">You may close this window</p>
    </section>
  )
}
