'use client'

import { useState } from 'react'
import type { BattleMode, CharacterConfig } from '@/types'
import CharacterCreator from '@/components/CharacterCreator/CharacterCreator'
import PixelButton from '@/components/ui/PixelButton'
import PixelInput from '@/components/ui/PixelInput'
import styles from './JoinGate.module.css'

type Role = 'choose' | 'fighter' | 'spectator'

type Props = {
  roomId: string
  mode: BattleMode
  creatorNickname?: string
  onJoinFighter: (nickname: string, character: CharacterConfig, pin: string) => void
  onJoinSpectator: (nickname: string) => void
  pinError?: string
}

const DEFAULT_CHARACTER: CharacterConfig = { headId: 0, bodyId: 0, accessoryId: 0, colorId: 0 }

export default function JoinGate({ roomId, mode, creatorNickname, onJoinFighter, onJoinSpectator, pinError }: Props) {
  const [role, setRole] = useState<Role>('choose')
  const [nickname, setNickname] = useState('')
  const [pin, setPin] = useState('')
  const [character, setCharacter] = useState<CharacterConfig>(DEFAULT_CHARACTER)

  if (role === 'choose') {
    return (
      <div className={styles.container}>
        <div className={[styles.badge, mode === 'love' ? styles.badgeLove : styles.badgeGarbage].join(' ')}>
          {mode === 'love' ? '♥ MODO LOVE' : '☠ MODO GARBAGE'}
        </div>
        {creatorNickname && (
          <p className={styles.subtitle}>Sala de {creatorNickname}</p>
        )}
        <p className={styles.question}>¿Cómo querés entrar?</p>
        <div className={styles.options}>
          <button className={styles.optionCard} onClick={() => setRole('fighter')}>
            <span className={styles.optionIcon}>⚔</span>
            <span className={styles.optionTitle}>LUCHAR</span>
            <span className={styles.optionDesc}>Necesitás el PIN de 4 dígitos</span>
          </button>
          <button className={styles.optionCard} onClick={() => setRole('spectator')}>
            <span className={styles.optionIcon}>👁</span>
            <span className={styles.optionTitle}>VER LA PELEA</span>
            <span className={styles.optionDesc}>Sin PIN — solo mirás</span>
          </button>
        </div>
      </div>
    )
  }

  if (role === 'spectator') {
    return (
      <div className={styles.container}>
        <p className={styles.title}>ENTRAR COMO ESPECTADOR</p>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>NICKNAME (opcional)</label>
          <PixelInput
            placeholder="Anónimo"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            maxLength={20}
          />
        </div>
        <div className={styles.actions}>
          <PixelButton onClick={() => onJoinSpectator(nickname || 'Anónimo')} variant="ghost">
            VER LA PELEA
          </PixelButton>
          <PixelButton variant="ghost" onClick={() => setRole('choose')}>← VOLVER</PixelButton>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <p className={styles.title}>ARMAR TU LUCHADOR</p>
      <div className={styles.field}>
        <label className={styles.fieldLabel}>NICKNAME</label>
        <PixelInput
          placeholder="Tu nombre..."
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          maxLength={20}
        />
      </div>
      <CharacterCreator value={character} onChange={setCharacter} />
      <div className={styles.field}>
        <label className={styles.fieldLabel}>PIN DE 4 DÍGITOS</label>
        <PixelInput
          placeholder="1234"
          value={pin}
          onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          maxLength={4}
          inputMode="numeric"
          pattern="[0-9]*"
          className={pinError ? styles.inputError : ''}
        />
        {pinError && <p className={styles.errorMsg}>{pinError}</p>}
      </div>
      <div className={styles.actions}>
        <PixelButton
          disabled={!nickname.trim() || pin.length !== 4}
          onClick={() => onJoinFighter(nickname.trim(), character, pin)}
        >
          ⚔ ENTRAR A PELEAR
        </PixelButton>
        <PixelButton variant="ghost" onClick={() => setRole('choose')}>← VOLVER</PixelButton>
      </div>
    </div>
  )
}
