'use client'
import useLocalStorage from '@/lib/useLocalStorage.hook'
import { useEffect, useState } from 'react'
import { Heading } from './heading'

export default function Greeting() {
  const [user] = useLocalStorage('user', {})
  const date = new Date()
  const hour = date.getHours()
  const [greeting, setGreeting] = useState(hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening')

  useEffect(() => {
    if (user.first_name) {
      setGreeting((p) => `${p}${user.first_name ? ', ' : ''}${user.first_name}`)
    }
  }, [])
  return <Heading>{greeting}</Heading>
}
