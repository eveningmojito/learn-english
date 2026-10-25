import { Fragment, useCallback, useEffect, useState, type ReactNode } from 'react'
import { playFanfare } from '../audio'

type Props = {
  total: number
  onBack: () => void
  onFinish: (stars: number) => void
  // How long to wait after a solved round before the next one, so the praise can be heard.
  delay?: number
  // Renders one round; call done(firstTry) when the child finds the answer.
  children: (round: number, done: (firstTry: boolean) => void) => ReactNode
}

export function GameFrame({ total, onBack, onFinish, delay = 1800, children }: Props) {
  const [index, setIndex] = useState(0)
  const [stars, setStars] = useState(0)
  const finished = index >= total

  useEffect(() => {
    if (finished) {
      playFanfare()
      onFinish(stars)
    }
  }, [finished]) // eslint-disable-line react-hooks/exhaustive-deps

  const done = useCallback((firstTry: boolean) => {
    if (firstTry) setStars((s) => s + 1)
    // Move on only once the spoken answer has finished, so it is never cut off.
    const started = Date.now()
    const next = () => {
      const talking = window.speechSynthesis?.speaking || window.speechSynthesis?.pending
      if (talking && Date.now() - started < 12000) setTimeout(next, 200)
      else setTimeout(() => setIndex((i) => i + 1), 400)
    }
    setTimeout(next, delay)
  }, [delay])

  if (finished) {
    return (
      <div className="screen center">
        <div className="trophy">🏆</div>
        <h2>Bravissimo!</h2>
        <p className="stars">{'⭐'.repeat(stars)}{'☆'.repeat(total - stars)}</p>
        <p className="hint">Hai indovinato {stars} su {total} al primo colpo!</p>
        <button className="big" onClick={onBack}>🏠 Torna al menu</button>
      </div>
    )
  }

  return (
    <div className="screen">
      <header className="topbar">
        <button className="round" onClick={onBack} aria-label="Indietro">⬅️</button>
        <div className="progress" aria-label={`Domanda ${index + 1} di ${total}`}>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={i < index ? 'dot on' : i === index ? 'dot now' : 'dot'} />
          ))}
        </div>
        <span className="score">⭐ {stars}</span>
      </header>
      <Fragment key={index}>{children(index, done)}</Fragment>
    </div>
  )
}
