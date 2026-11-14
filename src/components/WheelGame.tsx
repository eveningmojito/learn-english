import { useMemo, useState } from 'react'
import type { Word } from '../data/words'
import { sentences } from '../data/sentences'
import { VOWEL_PRICE, WHEEL_CATEGORIES, WHEEL_ROUNDS, WHEEL_SLICES } from '../data/wheel'
import { playCorrect, playWrong, speak } from '../audio'
import { pickFresh, shuffle } from '../utils'
import { GameFrame } from './GameFrame'
import { LEVEL_MULTIPLIER } from '../rewards'

// Wheel of Fortune: spin, pick consonants worth the slice's points, buy vowels, and solve the
// English phrase by choosing it among similar ones. A round earns a star when the child
// solves it before every letter is shown, without the Italian hint or a wrong guess.

type Phrase = Word & { topic: string }

const ALL: Phrase[] = Object.entries(sentences).flatMap(([topic, list]) => list.map((w) => ({ ...w, topic })))
const VOWELS = 'AEIOU'.split('')
const CONSONANTS = 'BCDFGHJKLMNPQRSTVWXYZ'.split('')
const SLICE = 360 / WHEEL_SLICES.length
const COLORS = ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#ff9ff3', '#54a0ff', '#ff9f43', '#5f27cd']

const isLetter = (ch: string) => /[A-Z]/.test(ch)

function Wheel({ angle }: { angle: number }) {
  const r = 100
  const point = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180
    return `${r + r * Math.cos(rad)},${r + r * Math.sin(rad)}`
  }
  return (
    <div className="wheel-wrap">
      <span className="wheel-pointer">▼</span>
      <svg className="wheel" viewBox="0 0 200 200" style={{ transform: `rotate(${angle}deg)` }}>
        {WHEEL_SLICES.map((v, i) => {
          const from = i * SLICE
          const mid = from + SLICE / 2
          return (
            <g key={i}>
              <path d={`M100,100 L${point(from)} A100,100 0 0 1 ${point(from + SLICE)} Z`} fill={v === 'bankrupt' ? '#2d2a32' : COLORS[i % COLORS.length]} stroke="#fff" strokeWidth="1.5" />
              <text x="100" y="24" transform={`rotate(${mid} 100 100)`} textAnchor="middle" className="wheel-text" fill={v === 'bankrupt' ? '#fff' : '#2d2a32'}>
                {v === 'bankrupt' ? '💥' : v}
              </text>
            </g>
          )
        })}
        <circle cx="100" cy="100" r="14" fill="#fff" stroke="#ffd32a" strokeWidth="4" />
      </svg>
    </div>
  )
}

type Stage = 'turn' | 'spinning' | 'consonant' | 'solve' | 'done'

function WheelRound({ phrase, options, angle, onSpin, onDone }: { phrase: Phrase; options: string[]; angle: number; onSpin: (slice: number) => number; onDone: (firstTry: boolean) => void }) {
  const text = phrase.en.toUpperCase()
  const letters = useMemo(() => [...new Set(text.split('').filter(isLetter))], [text])
  const [shown, setShown] = useState<string[]>([])
  const [tried, setTried] = useState<string[]>([])
  const [points, setPoints] = useState(0)
  const [stage, setStage] = useState<Stage>('turn')
  const [value, setValue] = useState(0)
  const [message, setMessage] = useState('Gira la ruota!')
  const [hint, setHint] = useState(false)
  const [wrongSolve, setWrongSolve] = useState<string[]>([])

  const hidden = letters.filter((l) => !shown.includes(l))
  const consonantsLeft = hidden.some((l) => !VOWELS.includes(l))
  const vowelsFree = !consonantsLeft

  function finish(byGuess: boolean, total: number) {
    setShown(letters)
    setStage('done')
    playCorrect()
    setTimeout(() => speak(phrase.en), 500)
    setMessage(`Bravo! +${total} punti`)
    onDone(byGuess && !hint && wrongSolve.length === 0)
  }

  function reveal(letter: string, gain: number) {
    setTried([...tried, letter])
    const count = text.split('').filter((ch) => ch === letter).length
    speak(letter)
    if (!count) {
      playWrong()
      setMessage(`Nessuna ${letter}! Gira di nuovo.`)
      setStage('turn')
      return
    }
    const next = [...shown, letter]
    const total = points + gain * count
    setShown(next)
    setPoints(total)
    if (letters.every((l) => next.includes(l))) return finish(false, total)
    playCorrect()
    setMessage(gain ? `${count} × ${letter}: +${gain * count} punti!` : `${count} × ${letter}!`)
    setStage('turn')
  }

  function spin() {
    if (stage !== 'turn' || !consonantsLeft) return
    const slice = Math.floor(Math.random() * WHEEL_SLICES.length)
    setStage('spinning')
    setMessage('...')
    const ms = onSpin(slice)
    setTimeout(() => {
      const v = WHEEL_SLICES[slice]
      if (v === 'bankrupt') {
        playWrong()
        speak('Oh no! Bankrupt!')
        setPoints(0)
        setMessage('💥 Bancarotta! Punti del turno a zero.')
        setStage('turn')
        return
      }
      speak(`${v} points!`)
      setValue(v)
      setMessage(`${v} punti per lettera: scegli una consonante!`)
      setStage('consonant')
    }, ms)
  }

  function tapLetter(letter: string) {
    if (tried.includes(letter)) return
    if (VOWELS.includes(letter)) {
      if (stage !== 'turn') return
      if (!vowelsFree) {
        if (points < VOWEL_PRICE) {
          playWrong()
          return setMessage(`Una vocale costa ${VOWEL_PRICE} punti: gira la ruota per guadagnarli!`)
        }
      }
      // Vowels are bought, unless only vowels are left to find.
      const paid = vowelsFree ? points : points - VOWEL_PRICE
      setTried([...tried, letter])
      const count = text.split('').filter((ch) => ch === letter).length
      speak(letter)
      if (!count) {
        playWrong()
        setPoints(paid)
        return setMessage(`Nessuna ${letter}!`)
      }
      const next = [...shown, letter]
      setShown(next)
      setPoints(paid)
      if (letters.every((l) => next.includes(l))) return finish(false, paid)
      playCorrect()
      return setMessage(`${count} × ${letter}!`)
    }
    if (stage !== 'consonant') return
    reveal(letter, value)
  }

  function solve(option: string) {
    if (option === phrase.en) return finish(true, points + 50)
    playWrong()
    setWrongSolve([...wrongSolve, option])
    setMessage('Non è questa! Riprova o continua a girare.')
  }

  const words = text.split(' ')
  return (
    <div className="question wheel-round">
      <p className="wheel-cat">
        {WHEEL_CATEGORIES[phrase.topic]?.en ?? 'Phrase'} · <span>{points} punti</span>
      </p>
      <div className="wf-board">
        {words.map((w, wi) => (
          <span key={wi} className="board-word">
            {w.split('').map((ch, i) => (
              <span key={i} className={`board-tile ${isLetter(ch) && !shown.includes(ch) ? 'blank' : ''}`}>
                {!isLetter(ch) || shown.includes(ch) ? ch : ''}
              </span>
            ))}
          </span>
        ))}
      </div>
      {hint && <p className="answer small sentence-it">{phrase.it}</p>}
      <p className="wheel-msg">{message}</p>

      {stage === 'solve' ? (
        <div className="task-options">
          {options.map((o) => (
            <button key={o} className={`card text-card option ${wrongSolve.includes(o) ? 'faded' : ''}`} disabled={wrongSolve.includes(o)} onClick={() => solve(o)}>
              <span className="en">{o}</span>
            </button>
          ))}
          <button className="help" onClick={() => setStage('turn')}>↩️ Torna alla ruota</button>
        </div>
      ) : (
        <>
          <Wheel angle={angle} />
          <div className="wheel-actions">
            <button className="big spin" onClick={spin} disabled={stage !== 'turn' || !consonantsLeft}>🎡 Gira</button>
            <button className="big solve" onClick={() => stage === 'turn' && setStage('solve')} disabled={stage !== 'turn'}>💡 Risolvi</button>
            {!hint && stage !== 'done' && (
              <button className="help" onClick={() => setHint(true)}>🇮🇹 Aiuto</button>
            )}
          </div>
          <div className="keys">
            {CONSONANTS.map((l) => (
              <button key={l} className={`key ${tried.includes(l) ? 'used' : ''}`} disabled={tried.includes(l) || stage !== 'consonant'} onClick={() => tapLetter(l)}>
                {l}
              </button>
            ))}
          </div>
          <div className="keys vowels">
            {VOWELS.map((l) => (
              <button key={l} className={`key vowel ${tried.includes(l) ? 'used' : ''}`} disabled={tried.includes(l) || stage !== 'turn'} onClick={() => tapLetter(l)}>
                {l}
              </button>
            ))}
            <span className="vowel-price">{vowelsFree ? 'vocali gratis' : `vocale: ${VOWEL_PRICE} punti`}</span>
          </div>
        </>
      )}
    </div>
  )
}

export function WheelGame({ onBack, onFinish }: { onBack: () => void; onFinish: (stars: number) => void }) {
  const rounds = useMemo(
    () =>
      pickFresh('wheel', ALL, WHEEL_ROUNDS, (p) => p.en).map((phrase) => {
        const words = phrase.en.split(' ').length
        const similar = ALL.filter((p) => p !== phrase && Math.abs(p.en.split(' ').length - words) <= 1)
        return { phrase, options: shuffle([phrase.en, ...shuffle(similar).slice(0, 2).map((p) => p.en)]) }
      }),
    [],
  )
  // The wheel keeps its position between rounds and always spins forward.
  const [angle, setAngle] = useState(0)

  function onSpin(slice: number) {
    setAngle((a) => a - (a % 360) + 360 * 5 + (360 - (slice + 0.5) * SLICE))
    return 3200
  }

  return (
    <GameFrame total={rounds.length} onBack={onBack} onFinish={onFinish} multiplier={LEVEL_MULTIPLIER['3']}>
      {(i, done) => <WheelRound phrase={rounds[i].phrase} options={rounds[i].options} angle={angle} onSpin={onSpin} onDone={done} />}
    </GameFrame>
  )
}
