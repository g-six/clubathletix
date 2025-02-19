'use client'
import { Button } from '@/components/button'
import { Dialog } from '@/components/dialog'
import { useParams } from 'next/navigation'
import { useState } from 'react'

export default function InvitesPage() {
  const params = useParams()
  const [show, setShow] = useState(true)
  const [accepted, toggleAccepted] = useState<boolean | null>(null)

  function answer(accept: boolean) {
    toggleAccepted(accept)
    setShow(false)
  }

  return (
    <section className="m-auto p-8 text-center text-3xl font-black">
      <Dialog open={show} size="lg" onClose={() => {}}>
        {show && accepted === null && (
          <>
            Congratulations! You have been invited to a match at 5PM at Whiterock Elementary!
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" onClick={() => answer(false)} color="red">
                Decline
              </Button>
              <Button type="button" onClick={() => answer(true)} color="white">
                Accept
              </Button>
            </div>
          </>
        )}
      </Dialog>
      {accepted === false && <p>We're sorry that you can't make it. Maybe next time!</p>}
      {accepted === true && <p>You're all set! See you there!</p>}
      {accepted !== null && <p className="my-8 text-sm font-light text-slate-500">You may close this window</p>}
    </section>
  )
}
