'use client'

import { useState } from 'react'
import type { BattleMode, CharacterConfig } from '@/types'
import PixelButton from '@/components/ui/PixelButton'
import styles from './RoomCreator.module.css'

type Props = {
  character: CharacterConfig
  nickname: string
  onCreateRoom: (mode: BattleMode) => void
}

export default function RoomCreator({ onCreateRoom }: Props) {
  const [selected, setSelected] = useState<BattleMode | null>(null)

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>ELEGÍ EL MODO</h2>
      <div className={styles.modes}>
        <button
          className={[styles.modeCard, selected === 'love' ? styles.modeActive : ''].join(' ')}
          onClick={() => setSelected('love')}
        >
          <span className={styles.modeIcon}>♥</span>
          <span className={styles.modeName}>MODO LOVE</span>
          <span className={styles.modeDesc}>Solo palabras de amor y positivas</span>
        </button>
        <button
          className={[styles.modeCard, selected === 'garbage' ? styles.modeActiveGarbage : ''].join(' ')}
          onClick={() => setSelected('garbage')}
        >
          <span className={styles.modeIcon}>☠</span>
          <span className={styles.modeName}>MODO GARBAGE</span>
          <span className={styles.modeDesc}>Solo insultos y palabras sucias</span>
        </button>
      </div>
      <PixelButton
        disabled={!selected}
        onClick={() => selected && onCreateRoom(selected)}
        variant="primary"
      >
        CREAR SALA
      </PixelButton>
    </div>
  )
}
