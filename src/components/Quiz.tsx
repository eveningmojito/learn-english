import { useEffect, useMemo, useState } from 'react'
import type { Category, Word } from '../data/words'
import { playCorrect, playFanfare, playWrong, speak } from '../audio'

type Props = { category: Category; onBack: () => void; onFinish: (stars: number) => void }

const ROUNDS = 8
const CHOICES = 4

function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeRounds(words: Word[]) {
  const targets = shuffle(words).slice(0, Math.min(ROUNDS, words.length))
  return targets.map((target) => ({
    target,
    options: shuffle([target, ...shuffle(words.filter((w) => w !== target)).slice(0, CHOICES - 1)]),
  }))
}

export function Quiz({ category, onBack, onFinish }: Props) {
  const rounds = useMemo(() => makeRounds(category.words), [category])
  const [index, setIndex] = useState(0)
  const [stars, setStars] = useState(0)
  const [wrong, setWrong] = useState<string[]>([])
  const [solved, setSolved] = useState(false)

  const round = rounds[index]
  const done = index >= rounds.length

  useEffect(() => {
    if (!done) {
      const t = setTimeout(() => speak(round.target.en), 400)
      return () => clearTimeout(t)
    }
    playFanfare()
    onFinish(stars)
  }, [index]) // eslint-disable-line react-hooks/exhaustive-deps

  if (done) {
    return (
      <div className="screen center">
        <div className="trophy">🏆</div>
        <h2>Bravissimo!</h2>
        <p className="stars">{'⭐'.repeat(stars)}{'☆'.repeat(rounds.length - stars)}</p>
        <p className="hint">Hai indovinato {stars} su {rounds.length} al primo colpo!</p>
        <button className="big" onClick={onBack}>🏠 Torna al menu</button>
      </div>
    )
  }

  function choose(w: Word) {
    if (solved) return
    if (w === round.target) {
      playCorrect()
      setSolved(true)
      if (wrong.length === 0) setStars((s) => s + 1)
      setTimeout(() => speak(w.en), 500)
      setTimeout(() => {
        setSolved(false)
        setWrong([])
        setIndex((i) => i + 1)
      }, 1800)
    } else {
      playWrong()
      setWrong((list) => [...list, w.en])
    }
  }

  return (
    <div className="screen">
      <header className="topbar">
        <button className="round" onClick={onBack} aria-label="Indietro">⬅️</button>
        <div className="progress" aria-label={`Domanda ${index + 1} di ${rounds.length}`}>
          {rounds.map((_, i) => (
            <span key={i} className={i < index ? 'dot on' : i === index ? 'dot now' : 'dot'} />
          ))}
        </div>
        <span className="score">⭐ {stars}</span>
      </header>

      <div className="question">
        <button className="speaker" onClick={() => speak(round.target.en)} aria-label="Ascolta di nuovo">
          🔊
        </button>
        <p className="hint">Ascolta e tocca l'immagine giusta!</p>
        <p className="answer">{solved ? `${round.target.en} = ${round.target.it}` : ' '}</p>
      </div>

      <div className="grid choices">
        {round.options.map((w) => {
          const isWrong = wrong.includes(w.en)
          const isRight = solved && w === round.target
          return (
            <button
              key={w.en}
              className={`card big-card ${isWrong ? 'shake faded' : ''} ${isRight ? 'pop right' : ''}`}
              onClick={() => choose(w)}
              disabled={isWrong}
            >
              <span className="emoji">{w.emoji}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
