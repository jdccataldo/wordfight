import type { WordEvent } from '@/store/gameStore'
import styles from './WordHistory.module.css'

type Props = {
  events: WordEvent[]
  mySocketId: string | null
}

export default function WordHistory({ events, mySocketId }: Props) {
  return (
    <div className={styles.container}>
      {events.map(ev => {
        const isMe = ev.socketId === mySocketId
        return (
          <div
            key={ev.id}
            className={[
              styles.entry,
              isMe ? styles.mine : styles.theirs,
              styles[ev.type],
            ].join(' ')}
          >
            <span className={styles.word}>{ev.word}</span>
            {ev.damage && <span className={styles.dmg}>-{ev.damage}</span>}
          </div>
        )
      })}
    </div>
  )
}
