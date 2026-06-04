import { create } from 'zustand'
import type { GameStateSnapshot, BattleMode } from '@/types'

export type ForbiddenEvent = {
  attackerSocketId: string
  symbolType: 'love' | 'garbage'
  id: number
}

export type HitEvent = {
  attackerSocketId: string
  word: string
  damage: number
  id: number
}

export type WordEvent = {
  socketId: string
  word: string
  type: 'accepted' | 'rejected' | 'forbidden' | 'neutral'
  damage?: number
  id: number
}

type GameStore = {
  roomId: string | null
  mySocketId: string | null
  myRole: 'creator' | 'fighter' | 'spectator' | null
  pin: string | null
  snapshot: GameStateSnapshot | null
  countdownValue: number | null
  lastForbidden: ForbiddenEvent | null
  lastHit: HitEvent | null
  wordLog: WordEvent[]
  eventCounter: number

  setRoomCreated: (roomId: string, pin: string, mySocketId: string, snapshot: GameStateSnapshot) => void
  setFighterJoined: (mySocketId: string, snapshot: GameStateSnapshot) => void
  setSpectatorJoined: (mySocketId: string, snapshot: GameStateSnapshot) => void
  updateSnapshot: (snapshot: GameStateSnapshot) => void
  setCountdown: (value: number) => void
  addWordEvent: (ev: Omit<WordEvent, 'id'>) => void
  setForbidden: (ev: Omit<ForbiddenEvent, 'id'>) => void
  setHit: (ev: Omit<HitEvent, 'id'>) => void
  reset: () => void
}

let counter = 0
function nextId() { return ++counter }

export const useGameStore = create<GameStore>((set, get) => ({
  roomId: null,
  mySocketId: null,
  myRole: null,
  pin: null,
  snapshot: null,
  countdownValue: null,
  lastForbidden: null,
  lastHit: null,
  wordLog: [],
  eventCounter: 0,

  setRoomCreated: (roomId, pin, mySocketId, snapshot) =>
    set({ roomId, pin, mySocketId, myRole: 'creator', snapshot }),

  setFighterJoined: (mySocketId, snapshot) =>
    set({ mySocketId, myRole: 'fighter', snapshot, roomId: snapshot.roomId }),

  setSpectatorJoined: (mySocketId, snapshot) =>
    set({ mySocketId, myRole: 'spectator', snapshot, roomId: snapshot.roomId }),

  updateSnapshot: (snapshot) => set({ snapshot }),

  setCountdown: (value) => set({ countdownValue: value }),

  addWordEvent: (ev) =>
    set(state => ({
      wordLog: [{ ...ev, id: nextId() }, ...state.wordLog].slice(0, 30),
    })),

  setForbidden: (ev) => set({ lastForbidden: { ...ev, id: nextId() } }),

  setHit: (ev) => set({ lastHit: { ...ev, id: nextId() } }),

  reset: () =>
    set({
      roomId: null,
      mySocketId: null,
      myRole: null,
      pin: null,
      snapshot: null,
      countdownValue: null,
      lastForbidden: null,
      lastHit: null,
      wordLog: [],
    }),
}))
