export type BattleMode = 'love' | 'garbage'

export type WordCategory = 'love' | 'garbage' | 'neutral' | 'invalid'

export type PlayerRole = 'creator' | 'fighter' | 'spectator'

export type CharacterConfig = {
  headId: number      // 0–4
  bodyId: number      // 0–4
  accessoryId: number // 0–4
  colorId: number     // 0–7
}

export type Player = {
  socketId: string
  nickname: string
  character: CharacterConfig
  hp: number
  role: 'creator' | 'fighter'
  usedWords: Set<string>
}

export type Spectator = {
  socketId: string
  nickname: string
}

export type Room = {
  id: string
  pin: string
  mode: BattleMode
  players: [Player | null, Player | null]
  spectators: Spectator[]
  status: 'waiting' | 'countdown' | 'battle' | 'finished'
  winner?: string
  startedAt?: number
  rematchVotes: Set<string>
}

export type PublicPlayer = {
  socketId: string
  nickname: string
  character: CharacterConfig
  hp: number
  wordCount: number
  isYou: boolean
  role: 'creator' | 'fighter'
}

export type GameStateSnapshot = {
  roomId: string
  mode: BattleMode
  status: Room['status']
  players: PublicPlayer[]
  spectatorCount: number
  winner?: string
}

export type WordSubmitPayload = {
  word: string
  typingTimeMs: number
  cadenceScore: number
}

export type JoinAsSpectatorPayload = {
  roomId: string
  nickname?: string
}

export type JoinAsFighterPayload = {
  roomId: string
  pin: string
  nickname: string
  character: CharacterConfig
}

export type CreateRoomPayload = {
  nickname: string
  character: CharacterConfig
  mode: BattleMode
}

export type HitPayload = {
  attackerSocketId: string
  word: string
  damage: number
  newHp: number
}

export type ForbiddenPayload = {
  attackerSocketId: string
  word: string
  symbolType: 'love' | 'garbage'
  selfDamage: number
  newHp: number
}
