'use client'
import { Dialog } from '@/components/dialog'
import { useParams } from 'next/navigation'

export default function InvitesPage() {
  const params = useParams()

  return (
    <section className="m-auto p-8 text-center text-3xl font-black" data-id={params.invitation_id}>
      <Dialog open size="lg" onClose={() => {}}>
        <p>You're all set! See you there!</p>
        <p className="my-8 text-sm font-light text-slate-500">You may close this window</p>
      </Dialog>
    </section>
  )
}
