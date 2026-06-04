'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { CharacterConfig, BattleMode } from '@/types'
import CharacterCreator from '@/components/CharacterCreator/CharacterCreator'
import RoomCreator from '@/components/Lobby/RoomCreator'
import PixelButton from '@/components/ui/PixelButton'
import PixelInput from '@/components/ui/PixelInput'
import { useSocket } from '@/hooks/useSocket'
import { useGameState } from '@/hooks/useGameState'
import { useGameStore } from '@/store/gameStore'
import styles from './page.module.css'

const DEFAULT_CHARACTER: CharacterConfig = { headId: 0, bodyId: 0, accessoryId: 0, colorId: 0 }

type Step = 'build' | 'create'

function HomeInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo')

  const socket = useSocket()
  useGameState()
  const { roomId } = useGameStore()

  const [step, setStep] = useState<Step>('build')
  const [nickname, setNickname] = useState('')
  const [character, setCharacter] = useState<CharacterConfig>(DEFAULT_CHARACTER)

  useEffect(() => {
    if (roomId) {
      router.push(`/battle/${roomId}`)
    }
  }, [roomId, router])

  const createRoom = (mode: BattleMode) => {
    socket.emit('create_room', { nickname: nickname.trim(), character, mode })
  }

  if (step === 'build') {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>WORD<br />FIGHTER</h1>
          <p className={styles.subtitle}>Pelea con palabras</p>
        </header>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>TU LUCHADOR</h2>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>NOMBRE</label>
            <PixelInput
              placeholder="Tu nombre..."
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              maxLength={20}
            />
          </div>
          <CharacterCreator value={character} onChange={setCharacter} />
          <PixelButton
            disabled={!nickname.trim()}
            onClick={() => {
              if (returnTo) {
                sessionStorage.setItem('wf_nickname', nickname.trim())
                sessionStorage.setItem('wf_character', JSON.stringify(character))
                router.push(returnTo)
              } else {
                setStep('create')
              }
            }}
          >
            {returnTo ? 'CONTINUAR →' : 'SIGUIENTE →'}
          </PixelButton>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>WORD<br />FIGHTER</h1>
        <p className={styles.subtitle}>Pelea con palabras</p>
      </header>
      <div className={styles.card}>
        <RoomCreator character={character} nickname={nickname} onCreateRoom={createRoom} />
        <PixelButton variant="ghost" onClick={() => setStep('build')}>
          ← VOLVER
        </PixelButton>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense>
      <HomeInner />
    </Suspense>
  )
}
