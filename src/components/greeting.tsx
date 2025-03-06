'use client'
import useLocalStorage from '@/lib/useLocalStorage.hook'
import { useEffect, useState } from 'react'
import { Heading } from './heading'

export default function Greeting() {
  const [user] = useLocalStorage('user', {})
  const [greeting, setGreeting] = useState<string>()
  useEffect(() => {
    const hour = new Date().getHours()
    setGreeting(
      [hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening', user?.first_name || '']
        .filter(Boolean)
        .join(', ')
    )
  }, [])
  return (
    <Heading>
      {greeting ? (
        greeting
      ) : (
        <img title="loading" src="/loaders/default.gif" className="h-8 w-8 rounded-full bg-white" />
      )}
    </Heading>
  )
}
