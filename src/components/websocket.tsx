'use client'

import { useEffect } from 'react'

export default function SocketComponent() {
  useEffect(() => {
    const ws = new WebSocket('/api/socket')
    ws.onopen = () => {
      console.log('Connected to WebSocket')
      ws.send('Hello, WebSocket!')
    }
    ws.onmessage = (event) => {
      console.log('Message received:', event.data)
    }
    ws.onclose = () => {
      console.log('WebSocket connection closed')
    }
    return () => {
      ws.close()
    }
  }, [])
  return <div>WebSocket Example</div>
}
