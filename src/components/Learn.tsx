import { useState } from 'react'
import type { Topic } from '../data/words'
import { speak } from '../audio'

type Props = { category: Topic; onBack: () => void }

export function Learn({ category, onBack }: Props) {
  const [active, setActive] = useState<string | null>(null)

  return (
    <div className="screen">
      <header className="topbar">
        <button className="round" onClick={onBack} aria-label="Indietro">⬅️</button>
        <h2>{category.emoji} {category.title}</h2>
        <span />
      </header>
      <p className="hint">Tocca una carta per sentire la parola in inglese!</p>
      <div className="grid">
        {category.words.map((w) => (
          <button
            key={w.en}
            className={`card ${active === w.en ? 'pop' : ''}`}
            onClick={() => {
              setActive(w.en)
              speak(w.en)
            }}
            onAnimationEnd={() => setActive(null)}
          >
            <span className="emoji">{w.emoji}</span>
            <span className="en">{w.en}</span>
            <span className="it">{w.it}</span>
          </button>
        ))}
      </div>
      {category.sentences && (
        <>
          <h3 className="section-title">Frasi</h3>
          <div className="sentence-list">
            {category.sentences.map((s) => (
              <button key={s.en} className="card sentence-card" onClick={() => speak(s.en)}>
                <span className="sentence-emoji">{s.emoji}</span>
                <span>
                  <span className="en">{s.en}</span>
                  <span className="it">{s.it}</span>
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
