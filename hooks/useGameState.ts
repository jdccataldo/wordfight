'use client'

import { useEffect } from 'react'
import { useSocket } from './useSocket'
import { useGameStore } from '@/store/gameStore'
import type { GameStateSnapshot, HitPayload, ForbiddenPayload } from '@/types'

export function useGameState() {
  const socket = useSocket()
  const store = useGameStore()

  useEffect(() => {
    socket.on('room_created', ({ roomId, pin, snapshot }: { roomId: string; pin: string; snapshot: GameStateSnapshot }) => {
      store.setRoomCreated(roomId, pin, socket.id!, snapshot)
    })

    socket.on('fighter_joined', ({ yourSocketId, snapshot }: { yourSocketId: string; snapshot: GameStateSnapshot }) => {
      store.setFighterJoined(yourSocketId, snapshot)
    })

    socket.on('spectator_joined', ({ yourSocketId, snapshot }: { yourSocketId: string; snapshot: GameStateSnapshot }) => {
      store.setSpectatorJoined(yourSocketId, snapshot)
    })

    socket.on('game_state', (snapshot: GameStateSnapshot) => {
      store.updateSnapshot(snapshot)
    })

    socket.on('countdown', ({ count }: { count: number }) => {
      store.setCountdown(count)
    })

    socket.on('word_accepted', ({ word, damage }: { word: string; damage: number; newOpponentHp: number }) => {
      store.addWordEvent({ socketId: socket.id!, word, type: 'accepted', damage })
    })

    socket.on('word_rejected', ({ word, reason }: { word: string; reason: string }) => {
      store.addWordEvent({
        socketId: socket.id!,
        word,
        type: reason === 'neutral' ? 'neutral' : 'rejected',
      })
    })

    socket.on('hit_received', (payload: HitPayload) => {
      store.setHit({
        attackerSocketId: payload.attackerSocketId,
        word: payload.word,
        damage: payload.damage,
      })
      store.addWordEvent({
        socketId: payload.attackerSocketId,
        word: payload.word,
        type: 'accepted',
        damage: payload.damage,
      })
    })

    socket.on('forbidden_word', (payload: ForbiddenPayload) => {
      store.setForbidden({
        attackerSocketId: payload.attackerSocketId,
        symbolType: payload.symbolType,
      })
      store.addWordEvent({
        socketId: payload.attackerSocketId,
        word: payload.word,
        type: 'forbidden',
      })
    })

    return () => {
      socket.off('room_created')
      socket.off('fighter_joined')
      socket.off('spectator_joined')
      socket.off('game_state')
      socket.off('countdown')
      socket.off('word_accepted')
      socket.off('word_rejected')
      socket.off('hit_received')
      socket.off('forbidden_word')
    }
  }, [socket, store])
}
