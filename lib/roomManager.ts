import type { Server, Socket } from 'socket.io'
import { nanoid } from 'nanoid'
import { trackWord } from './uncategorizedWords'
import type {
  Room,
  Player,
  GameStateSnapshot,
  CreateRoomPayload,
  JoinAsFighterPayload,
  JoinAsSpectatorPayload,
  WordSubmitPayload,
} from '../types'
import { calculateDamage } from './damage'

const rooms = new Map<string, Room>()
const socketToRoom = new Map<string, string>()

function generatePin(): string {
  return String(Math.floor(1000 + Math.random() * 9000))
}

function getSnapshot(room: Room, forSocketId: string): GameStateSnapshot {
  return {
    roomId: room.id,
    mode: room.mode,
    status: room.status,
    spectatorCount: room.spectators.length,
    winner: room.winner,
    players: room.players
      .filter((p): p is Player => p !== null)
      .map(p => ({
        socketId: p.socketId,
        nickname: p.nickname,
        character: p.character,
        hp: p.hp,
        wordCount: p.usedWords.size,
        isYou: p.socketId === forSocketId,
        role: p.role,
      })),
  }
}

function broadcastState(io: Server, room: Room): void {
  for (const p of room.players) {
    if (p) {
      io.to(p.socketId).emit('game_state', getSnapshot(room, p.socketId))
    }
  }
  for (const s of room.spectators) {
    io.to(s.socketId).emit('game_state', getSnapshot(room, s.socketId))
  }
}

function startCountdown(io: Server, room: Room): void {
  room.status = 'countdown'
  broadcastState(io, room)

  let count = 3
  const interval = setInterval(() => {
    io.to(room.id).emit('countdown', { count })
    count--
    if (count < 0) {
      clearInterval(interval)
      room.status = 'battle'
      room.startedAt = Date.now()
      broadcastState(io, room)
    }
  }, 1000)
}

export function registerSocketHandlers(io: Server, socket: Socket): void {
  socket.on('create_room', (payload: CreateRoomPayload) => {
    const roomId = nanoid(6)
    const pin = generatePin()

    const creator: Player = {
      socketId: socket.id,
      nickname: payload.nickname,
      character: payload.character,
      hp: 100,
      role: 'creator',
      usedWords: new Set(),
    }

    const room: Room = {
      id: roomId,
      pin,
      mode: payload.mode,
      players: [creator, null],
      spectators: [],
      status: 'waiting',
      rematchVotes: new Set(),
    }

    rooms.set(roomId, room)
    socketToRoom.set(socket.id, roomId)
    socket.join(roomId)

    socket.emit('room_created', {
      roomId,
      pin,
      snapshot: getSnapshot(room, socket.id),
    })
  })

  socket.on('join_as_fighter', (payload: JoinAsFighterPayload) => {
    const room = rooms.get(payload.roomId)

    if (!room) {
      socket.emit('join_error', { reason: 'room_not_found' })
      return
    }
    if (payload.pin !== room.pin) {
      socket.emit('join_error', { reason: 'wrong_pin' })
      return
    }
    if (room.players[1] !== null) {
      socket.emit('join_error', { reason: 'fighters_full' })
      return
    }

    const fighter: Player = {
      socketId: socket.id,
      nickname: payload.nickname,
      character: payload.character,
      hp: 100,
      role: 'fighter',
      usedWords: new Set(),
    }

    room.players[1] = fighter
    socketToRoom.set(socket.id, room.id)
    socket.join(room.id)

    socket.emit('fighter_joined', {
      yourSocketId: socket.id,
      snapshot: getSnapshot(room, socket.id),
    })

    broadcastState(io, room)
    io.to(room.id).emit('spectator_count', { count: room.spectators.length })

    startCountdown(io, room)
  })

  socket.on('join_as_spectator', (payload: JoinAsSpectatorPayload) => {
    const room = rooms.get(payload.roomId)

    if (!room) {
      socket.emit('join_error', { reason: 'room_not_found' })
      return
    }

    const spectator = {
      socketId: socket.id,
      nickname: payload.nickname || 'Anónimo',
    }

    room.spectators.push(spectator)
    socketToRoom.set(socket.id, room.id)
    socket.join(room.id)

    socket.emit('spectator_joined', {
      yourSocketId: socket.id,
      snapshot: getSnapshot(room, socket.id),
    })

    io.to(room.id).emit('spectator_count', { count: room.spectators.length })
  })

  socket.on('submit_word', (payload: WordSubmitPayload) => {
    const roomId = socketToRoom.get(socket.id)
    if (!roomId) return

    const room = rooms.get(roomId)
    if (!room || room.status !== 'battle') return

    const attackerIdx = room.players.findIndex(p => p?.socketId === socket.id)
    if (attackerIdx === -1) return

    const attacker = room.players[attackerIdx] as Player
    const defenderIdx = attackerIdx === 0 ? 1 : 0
    const defender = room.players[defenderIdx]
    if (!defender) return

    const word = payload.word.trim().toLowerCase()
    if (word.length < 3) {
      socket.emit('word_rejected', { word, reason: 'invalid' })
      return
    }

    if (attacker.usedWords.has(word)) {
      socket.emit('word_rejected', { word, reason: 'duplicate' })
      return
    }

    const result = calculateDamage(word, payload.typingTimeMs, payload.cadenceScore, room.mode)

    if (result.type === 'invalid') {
      socket.emit('word_rejected', { word, reason: 'invalid' })
      return
    }

    if (result.type === 'neutral') {
      attacker.usedWords.add(word)
      trackWord(word, room.mode)
      socket.emit('word_rejected', { word, reason: 'neutral' })
      return
    }

    attacker.usedWords.add(word)

    if (result.type === 'forbidden') {
      attacker.hp = Math.max(0, attacker.hp - result.selfDamage)
      io.to(room.id).emit('forbidden_word', {
        attackerSocketId: socket.id,
        word,
        symbolType: result.symbolType,
        selfDamage: result.selfDamage,
        newHp: attacker.hp,
      })
      broadcastState(io, room)

      if (attacker.hp <= 0) {
        room.status = 'finished'
        room.winner = defender.socketId
        io.to(room.id).emit('game_over', { winner: defender.socketId, loser: attacker.socketId })
        broadcastState(io, room)
      }
      return
    }

    if (result.type === 'damage') {
      defender.hp = Math.max(0, defender.hp - result.amount)
      socket.emit('word_accepted', { word, damage: result.amount, newOpponentHp: defender.hp })
      io.to(room.id).emit('hit_received', {
        attackerSocketId: socket.id,
        word,
        damage: result.amount,
        newHp: defender.hp,
      })
      broadcastState(io, room)

      if (defender.hp <= 0) {
        room.status = 'finished'
        room.winner = attacker.socketId
        io.to(room.id).emit('game_over', { winner: attacker.socketId, loser: defender.socketId })
        broadcastState(io, room)
      }
    }
  })

  socket.on('request_rematch', () => {
    const roomId = socketToRoom.get(socket.id)
    if (!roomId) return

    const room = rooms.get(roomId)
    if (!room || room.status !== 'finished') return

    const isPlayer = room.players.some(p => p?.socketId === socket.id)
    if (!isPlayer) return

    room.rematchVotes.add(socket.id)

    const fighters = room.players.filter((p): p is Player => p !== null)
    if (room.rematchVotes.size >= fighters.length) {
      room.players[0]!.hp = 100
      room.players[0]!.usedWords = new Set()
      room.players[1]!.hp = 100
      room.players[1]!.usedWords = new Set()
      room.status = 'waiting'
      room.winner = undefined
      room.rematchVotes = new Set()

      broadcastState(io, room)
      startCountdown(io, room)
    }
  })

  socket.on('get_room_info', (
    { roomId }: { roomId: string },
    callback: (data: { mode: string; creatorNickname?: string } | null) => void
  ) => {
    const room = rooms.get(roomId)
    if (!room) { callback(null); return }
    const creator = room.players[0]
    callback({ mode: room.mode, creatorNickname: creator?.nickname })
  })

  socket.on('disconnect', () => {
    const roomId = socketToRoom.get(socket.id)
    if (!roomId) return

    socketToRoom.delete(socket.id)
    const room = rooms.get(roomId)
    if (!room) return

    const playerIdx = room.players.findIndex(p => p?.socketId === socket.id)
    if (playerIdx !== -1) {
      room.players[playerIdx] = null
      const remaining = room.players.find((p): p is Player => p !== null)
      if (remaining) {
        io.to(remaining.socketId).emit('opponent_disconnected', {})
      }
      if (!room.players[0] && !room.players[1]) {
        rooms.delete(roomId)
        return
      }
    } else {
      room.spectators = room.spectators.filter(s => s.socketId !== socket.id)
      io.to(room.id).emit('spectator_count', { count: room.spectators.length })
    }
  })
}
