'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { useSocket } from '@/hooks/useSocket'
import { useTypingCadence } from '@/hooks/useTypingCadence'
import type { BattleMode } from '@/types'
import styles from './WordInput.module.css'

type Props = {
  mode: BattleMode
  disabled?: boolean
}

export default function WordInput({ mode, disabled = false }: Props) {
  const socket = useSocket()
  const { onKeyDown, getMetrics, reset } = useTypingCadence()
  const [value, setValue] = useState('')
  const [flash, setFlash] = useState<'hit' | 'miss' | 'forbidden' | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus()
    }
  }, [disabled])

  const flashFor = useCallback((type: typeof flash) => {
    setFlash(type)
    setTimeout(() => setFlash(null), 400)
  }, [])

  useEffect(() => {
    const socket_ = socket

    socket_.on('word_accepted', () => flashFor('hit'))
    socket_.on('word_rejected', () => flashFor('miss'))
    socket_.on('forbidden_word', ({ attackerSocketId }: { attackerSocketId: string }) => {
      if (attackerSocketId === socket_.id) flashFor('forbidden')
    })

    return () => {
      socket_.off('word_accepted')
      socket_.off('word_rejected')
      socket_.off('forbidden_word')
    }
  }, [socket, flashFor])

  const submit = useCallback(() => {
    const word = value.trim()
    if (!word || disabled) return
    const metrics = getMetrics()
    socket.emit('submit_word', { word, ...metrics })
    setValue('')
    reset()
  }, [value, disabled, socket, getMetrics, reset])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      submit()
    } else {
      onKeyDown()
    }
  }

  const placeholder = mode === 'love' ? 'amor, belleza, paz...' : 'idiota, bruto, maldito...'

  const inputClass = [
    styles.input,
    flash === 'hit' ? styles.flashHit : '',
    flash === 'miss' ? styles.flashMiss : '',
    flash === 'forbidden' ? styles.flashForbidden : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={styles.container}>
      <div className={[styles.modePill, mode === 'love' ? styles.love : styles.garbage].join(' ')}>
        {mode === 'love' ? '♥ LOVE' : '☠ GARBAGE'}
      </div>
      <input
        ref={inputRef}
        className={inputClass}
        value={value}
        onChange={e => setValue(e.target.value.replace(/\s/g, ''))}
        onKeyDown={handleKeyDown}
        onBlur={() => !disabled && inputRef.current?.focus()}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
      <button className={styles.sendBtn} onClick={submit} disabled={disabled || !value.trim()}>
        ↵
      </button>
    </div>
  )
}
