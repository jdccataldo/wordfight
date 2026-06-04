'use client'

import type { GameStateSnapshot } from '@/types'
import PixelButton from './PixelButton'
import styles from './VictoryScreen.module.css'

type Props = {
  snapshot: GameStateSnapshot
  mySocketId: string | null
  myRole: string | null
  onRematch: () => void
}

export default function VictoryScreen({ snapshot, mySocketId, myRole, onRematch }: Props) {
  const winner = snapshot.players.find(p => p.socketId === snapshot.winner)
  const isWinner = snapshot.winner === mySocketId
  const isFighter = myRole === 'creator' || myRole === 'fighter'

  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        <h1 className={[styles.result, isWinner ? styles.win : styles.lose].join(' ')}>
          {isFighter ? (isWinner ? '¡GANASTE!' : '¡PERDISTE!') : `¡${winner?.nickname ?? '???'} GANÓ!`}
        </h1>
        {winner && (
          <p className={styles.winnerName}>{winner.nickname}</p>
        )}
        {isFighter && (
          <PixelButton onClick={onRematch} variant={isWinner ? 'primary' : 'ghost'}>
            REVANCHA
          </PixelButton>
        )}
      </div>
    </div>
  )
}
