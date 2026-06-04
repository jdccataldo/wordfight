'use client'

import { useRef, useCallback } from 'react'

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val))
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

export function useTypingCadence() {
  const keyTimestamps = useRef<number[]>([])
  const wordStartTime = useRef<number | null>(null)

  const onKeyDown = useCallback(() => {
    const now = Date.now()
    if (wordStartTime.current === null) {
      wordStartTime.current = now
    }
    keyTimestamps.current.push(now)
  }, [])

  const getMetrics = useCallback((): { typingTimeMs: number; cadenceScore: number } => {
    const now = Date.now()
    const typingTimeMs = wordStartTime.current !== null ? now - wordStartTime.current : 5000

    const timestamps = keyTimestamps.current
    let cadenceScore = 0

    if (timestamps.length >= 3) {
      const intervals: number[] = []
      for (let i = 1; i < timestamps.length; i++) {
        intervals.push(timestamps[i] - timestamps[i - 1])
      }
      const sd = stdDev(intervals)
      cadenceScore = 1 - clamp(sd / 300, 0, 1)
    }

    return { typingTimeMs, cadenceScore }
  }, [])

  const reset = useCallback(() => {
    keyTimestamps.current = []
    wordStartTime.current = null
  }, [])

  return { onKeyDown, getMetrics, reset }
}
