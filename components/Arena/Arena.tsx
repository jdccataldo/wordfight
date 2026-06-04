'use client'

import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { useSocket } from '@/hooks/useSocket'
import { useSoundEngine } from '@/hooks/useSoundEngine'
import SpriteAnimation from '@/components/Sprite/SpriteAnimation'
import type { AnimationState } from '@/components/Sprite/SpriteAnimation'
import HealthBar from './HealthBar'
import WordInput from './WordInput'
import WordHistory from './WordHistory'
import DamageNumber from './DamageNumber'
import ForbiddenBurst from './ForbiddenBurst'
import Countdown from './Countdown'
import ModeIndicator from './ModeIndicator'
import MuteButton from './MuteButton'
import VictoryScreen from '@/components/ui/VictoryScreen'
import WaitingRoom from '@/components/Lobby/WaitingRoom'
import styles from './Arena.module.css'

function getAttackAnim(damage: number): AnimationState {
  if (damage <= 8)  return 'jab'
  if (damage <= 18) return 'punch'
  if (damage <= 28) return 'kick'
  if (damage <= 38) return 'uppercut'
  return 'special'
}

function getHurtAnim(damage: number): AnimationState {
  return damage >= 16 ? 'hurt_heavy' : 'hurt_light'
}

export default function Arena() {
  const socket = useSocket()
  const sound = useSoundEngine()
  const {
    snapshot,
    mySocketId,
    myRole,
    pin,
    countdownValue,
    lastForbidden,
    lastHit,
    wordLog,
  } = useGameStore()

  const [p1Anim, setP1Anim] = useState<AnimationState>('idle')
  const [p2Anim, setP2Anim] = useState<AnimationState>('idle')
  const [hitTriggerLeft, setHitTriggerLeft] = useState({ id: 0, dmg: 0 })
  const [hitTriggerRight, setHitTriggerRight] = useState({ id: 0, dmg: 0 })
  const hitIdRef = useRef(0)

  // Hit animations + sounds
  useEffect(() => {
    if (!lastHit) return
    const hitId = ++hitIdRef.current
    const p1 = snapshot?.players[0]
    const isP1Attacker = lastHit.attackerSocketId === p1?.socketId

    const attackAnim = getAttackAnim(lastHit.damage)
    const hurtAnim = getHurtAnim(lastHit.damage)

    sound.playHit(attackAnim as Parameters<typeof sound.playHit>[0])
    sound.playHurt(hurtAnim as Parameters<typeof sound.playHurt>[0])

    if (isP1Attacker) {
      setP1Anim(attackAnim)
      setP2Anim(hurtAnim)
      setHitTriggerRight({ id: hitId, dmg: lastHit.damage })
    } else {
      setP2Anim(attackAnim)
      setP1Anim(hurtAnim)
      setHitTriggerLeft({ id: hitId, dmg: lastHit.damage })
    }
    const t = setTimeout(() => {
      setP1Anim('idle')
      setP2Anim('idle')
    }, 600)
    return () => clearTimeout(t)
  }, [lastHit, snapshot, sound])

  // Forbidden word animations + sound
  useEffect(() => {
    if (!lastForbidden) return
    sound.playForbidden()
    const p1 = snapshot?.players[0]
    const isP1 = lastForbidden.attackerSocketId === p1?.socketId
    if (isP1) setP1Anim('forbidden')
    else setP2Anim('forbidden')
    const t = setTimeout(() => {
      if (isP1) setP1Anim('idle')
      else setP2Anim('idle')
    }, 600)
    return () => clearTimeout(t)
  }, [lastForbidden, snapshot, sound])

  // Status change: music start/stop + victory sounds
  useEffect(() => {
    if (!snapshot) return
    const { status, mode, winner, players } = snapshot

    if (status === 'battle') {
      setP1Anim('idle')
      setP2Anim('idle')
      sound.startMusic(mode)
    } else if (status === 'finished') {
      sound.stopMusic()
      const iWon = winner === mySocketId
      const iAmFighter = myRole === 'creator' || myRole === 'fighter'
      if (iAmFighter) {
        if (iWon) sound.playVictory()
        else sound.playDefeat()
      } else {
        // Spectator: play victory for whoever won
        sound.playVictory()
      }
      setP1Anim(winner === players[0]?.socketId ? 'victory' : 'dead')
      setP2Anim(winner === players[1]?.socketId ? 'victory' : 'dead')
    }
  }, [snapshot?.status])

  // Countdown sounds
  useEffect(() => {
    if (countdownValue === null) return
    sound.playCountdown(countdownValue)
  }, [countdownValue, sound])

  const onRematch = () => socket.emit('request_rematch')

  if (!snapshot) return <div className={styles.loading}>CARGANDO...</div>

  const p1 = snapshot.players[0]
  const p2 = snapshot.players[1]
  const isMe = (id: string) => id === mySocketId
  const isFighter = myRole === 'creator' || myRole === 'fighter'

  if (snapshot.status === 'waiting' && myRole === 'creator' && pin) {
    return (
      <div className={styles.lobbyWrap}>
        <WaitingRoom
          roomId={snapshot.roomId}
          pin={pin}
          mode={snapshot.mode}
          spectatorCount={snapshot.spectatorCount}
        />
      </div>
    )
  }

  if (snapshot.status === 'waiting') {
    return (
      <div className={styles.waiting}>
        <ModeIndicator mode={snapshot.mode} />
        <p className={styles.waitingText}>ESPERANDO RIVAL...</p>
        <p className={styles.spectators}>
          {snapshot.spectatorCount > 0 && `👁 ${snapshot.spectatorCount} espectador${snapshot.spectatorCount !== 1 ? 'es' : ''}`}
        </p>
      </div>
    )
  }

  return (
    <div className={styles.arena}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.playerInfo}>
          {p1 && (
            <>
              <span className={[styles.playerName, isMe(p1.socketId) ? styles.myName : ''].join(' ')}>
                {p1.nickname} {isMe(p1.socketId) && '◀'}
              </span>
              <HealthBar hp={p1.hp} />
            </>
          )}
        </div>
        <div className={styles.topCenter}>
          <ModeIndicator mode={snapshot.mode} />
          <MuteButton />
        </div>
        <div className={[styles.playerInfo, styles.playerInfoRight].join(' ')}>
          {p2 && (
            <>
              <span className={[styles.playerName, isMe(p2.socketId) ? styles.myName : ''].join(' ')}>
                {isMe(p2.socketId) && '▶'} {p2.nickname}
              </span>
              <HealthBar hp={p2.hp} flip />
            </>
          )}
        </div>
      </div>

      {/* Battle stage */}
      <div className={styles.stage}>
        <div className={styles.crowd} />
        <div className={styles.fighters}>
          {p1 && (
            <div className={styles.fighterLeft}>
              <SpriteAnimation config={p1.character} animation={p1Anim} scale={3.5} />
            </div>
          )}
          <div className={styles.centerZone}>
            <ForbiddenBurst event={lastForbidden} />
            {snapshot.spectatorCount > 0 && (
              <span className={styles.spectatorBadge}>👁 {snapshot.spectatorCount}</span>
            )}
          </div>
          {p2 && (
            <div className={styles.fighterRight}>
              <SpriteAnimation config={p2.character} animation={p2Anim} flip scale={3.5} />
            </div>
          )}
        </div>
        <DamageNumber
          damage={hitTriggerLeft.dmg}
          triggerId={hitTriggerLeft.id}
          side="left"
        />
        <DamageNumber
          damage={hitTriggerRight.dmg}
          triggerId={hitTriggerRight.id}
          side="right"
        />
        {snapshot.status === 'countdown' && (
          <Countdown value={countdownValue} />
        )}
        {snapshot.status === 'finished' && (
          <VictoryScreen
            snapshot={snapshot}
            mySocketId={mySocketId}
            myRole={myRole}
            onRematch={onRematch}
          />
        )}
      </div>

      {/* Bottom */}
      <div className={styles.bottom}>
        {isFighter && snapshot.status === 'battle' ? (
          <WordInput mode={snapshot.mode} />
        ) : (
          <div className={styles.spectatorLabel}>
            {myRole === 'spectator' ? '👁 ESPECTADOR' : ''}
          </div>
        )}
        <WordHistory events={wordLog} mySocketId={mySocketId} />
      </div>
    </div>
  )
}
