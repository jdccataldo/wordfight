'use client'

import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

let socketInstance: Socket | null = null

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io({ path: '/socket.io', transports: ['websocket'] })
  }
  return socketInstance
}

export function useSocket(): Socket {
  const socket = getSocket()
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      if (!socket.connected) {
        socket.connect()
      }
    }
  }, [socket])

  return socket
}
