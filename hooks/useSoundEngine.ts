'use client'

import { useEffect } from 'react'
import { soundEngine } from '@/lib/soundEngine'

// Initializes the AudioContext on first user interaction (browser autoplay policy)
export function useSoundEngine() {
  useEffect(() => {
    const handleInteraction = () => {
      soundEngine.init()
      soundEngine.resume()
      window.removeEventListener('keydown', handleInteraction)
      window.removeEventListener('pointerdown', handleInteraction)
    }
    window.addEventListener('keydown', handleInteraction)
    window.addEventListener('pointerdown', handleInteraction)
    return () => {
      window.removeEventListener('keydown', handleInteraction)
      window.removeEventListener('pointerdown', handleInteraction)
    }
  }, [])

  return soundEngine
}
