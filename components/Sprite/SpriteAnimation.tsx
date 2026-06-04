'use client'

import { useEffect, useRef, useState } from 'react'
import type { CharacterConfig } from '@/types'
import Sprite from './Sprite'
import styles from './SpriteAnimation.module.css'

export type AnimationState =
  | 'idle'
  | 'jab'        // damage  1–8  : quick hand strike
  | 'punch'      // damage  9–18 : strong cross
  | 'kick'       // damage 19–28 : roundhouse kick
  | 'uppercut'   // damage 29–38 : upward arc punch
  | 'special'    // damage 39–50 : dramatic special move
  | 'hurt_light' // received  1–15 : small flinch
  | 'hurt_heavy' // received 16+  : big knockback
  | 'victory'
  | 'forbidden'
  | 'dead'

const PERSISTENT: Set<AnimationState> = new Set(['idle', 'dead', 'victory'])

type Props = {
  config: CharacterConfig
  animation: AnimationState
  flip?: boolean
  scale?: number
}

export default function SpriteAnimation({ config, animation, flip = false, scale = 2 }: Props) {
  const [activeAnim, setActiveAnim] = useState<AnimationState>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (PERSISTENT.has(animation)) {
      if (timerRef.current) clearTimeout(timerRef.current)
      setActiveAnim(animation)
      return
    }

    setActiveAnim(animation)

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setActiveAnim('idle')
    }, 600)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [animation])

  const classes = [styles.sprite, styles[activeAnim]].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <Sprite config={config} flip={flip} scale={scale} />
    </div>
  )
}
