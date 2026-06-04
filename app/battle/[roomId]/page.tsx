'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import type { CharacterConfig } from '@/types'
import { useSocket } from '@/hooks/useSocket'
import { useGameState } from '@/hooks/useGameState'
import { useGameStore } from '@/store/gameStore'
import Arena from '@/components/Arena/Arena'
import JoinGate from '@/components/Lobby/JoinGate'

const DEFAULT_CHARACTER: CharacterConfig = { headId: 0, bodyId: 0, accessoryId: 0, colorId: 0 }

export default function BattlePage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string

  const socket = useSocket()
  useGameState()

  const { myRole, snapshot } = useGameStore()
  const [pinError, setPinError] = useState<string | undefined>()

  // Fetch room info for JoinGate (mode, creator nickname)
  const [roomInfo, setRoomInfo] = useState<{ mode: 'love' | 'garbage'; creatorNickname?: string } | null>(null)

  useEffect(() => {
    // Ask server for room info before joining
    socket.emit('get_room_info', { roomId }, (data: { mode: 'love' | 'garbage'; creatorNickname?: string } | null) => {
      if (!data) {
        // Room not found — redirect home
        router.push(`/?returnTo=/battle/${roomId}`)
        return
      }
      setRoomInfo(data)
    })
  }, [roomId, socket, router])

  useEffect(() => {
    socket.on('join_error', ({ reason }: { reason: string }) => {
      if (reason === 'wrong_pin') setPinError('PIN incorrecto')
      else if (reason === 'fighters_full') setPinError('La sala ya tiene 2 luchadores')
      else if (reason === 'room_not_found') router.push(`/?returnTo=/battle/${roomId}`)
    })
    return () => { socket.off('join_error') }
  }, [socket, router, roomId])

  const joinFighter = (nickname: string, character: CharacterConfig, pin: string) => {
    setPinError(undefined)
    socket.emit('join_as_fighter', { roomId, pin, nickname, character })
  }

  const joinSpectator = (nickname: string) => {
    socket.emit('join_as_spectator', { roomId, nickname })
  }

  // Already in the room (creator came back after navigation, or fighter/spectator joined)
  if (myRole) {
    return <Arena />
  }

  // Show JoinGate while room info is loading or for visitors
  if (!roomInfo) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontSize: '10px', color: '#8d99ae', letterSpacing: '3px' }}>
        CARGANDO...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
      <JoinGate
        roomId={roomId}
        mode={roomInfo.mode}
        creatorNickname={roomInfo.creatorNickname}
        onJoinFighter={joinFighter}
        onJoinSpectator={joinSpectator}
        pinError={pinError}
      />
    </div>
  )
}
