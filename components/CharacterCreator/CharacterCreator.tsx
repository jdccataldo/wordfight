'use client'

import { useState } from 'react'
import type { CharacterConfig } from '@/types'
import Sprite from '@/components/Sprite/Sprite'
import PixelButton from '@/components/ui/PixelButton'
import { HEAD_NAMES, BODY_NAMES, ACCESSORY_NAMES } from '@/components/Sprite/parts/characters'
import { PALETTE_NAMES, PALETTES } from '@/components/Sprite/parts/colors'
import styles from './CharacterCreator.module.css'

type Props = {
  value: CharacterConfig
  onChange: (config: CharacterConfig) => void
}

function CycleSelector({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className={styles.selector}>
      <span className={styles.selectorLabel}>{label}</span>
      <div className={styles.selectorControls}>
        <button
          className={styles.arrow}
          onClick={() => onChange((value - 1 + options.length) % options.length)}
        >
          ◀
        </button>
        <span className={styles.selectorValue}>{options[value]}</span>
        <button
          className={styles.arrow}
          onClick={() => onChange((value + 1) % options.length)}
        >
          ▶
        </button>
      </div>
    </div>
  )
}

export default function CharacterCreator({ value, onChange }: Props) {
  const update = (patch: Partial<CharacterConfig>) => onChange({ ...value, ...patch })

  return (
    <div className={styles.container}>
      <div className={styles.preview}>
        <Sprite config={value} scale={3} />
      </div>
      <div className={styles.controls}>
        <CycleSelector
          label="CABEZA"
          options={HEAD_NAMES}
          value={value.headId}
          onChange={v => update({ headId: v })}
        />
        <CycleSelector
          label="CUERPO"
          options={BODY_NAMES}
          value={value.bodyId}
          onChange={v => update({ bodyId: v })}
        />
        <CycleSelector
          label="ACCESORIO"
          options={ACCESSORY_NAMES}
          value={value.accessoryId}
          onChange={v => update({ accessoryId: v })}
        />
        <div className={styles.selector}>
          <span className={styles.selectorLabel}>COLOR</span>
          <div className={styles.colorGrid}>
            {PALETTES.map((p, i) => (
              <button
                key={i}
                title={PALETTE_NAMES[i]}
                className={[styles.colorSwatch, value.colorId === i ? styles.colorActive : ''].join(' ')}
                style={{ background: p.primary }}
                onClick={() => update({ colorId: i })}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
