import { useEffect, useMemo, useState } from 'react'
import { basicTopics, moreTopics, seasonalTopics, type Topic } from './data/words'
import { Learn } from './components/Learn'
import { GameFrame } from './components/GameFrame'
import { ChooseRound } from './components/ChooseRound'
import { MissingLetterRound } from './components/MissingLetterRound'
import { BuildRound } from './components/BuildRound'
import { MazeGame } from './components/MazeGame'
import { advancedTopics } from './data/advanced'
import { speak } from './audio'
import { shuffle } from './utils'

type GameId = 'listen' | 'read' | 'missing' | 'spell' | 'translate' | 'dictation' | 'sentence'
type LevelId = '1' | '2' | '3'

const GAMES: Record<GameId, { title: string; emoji: string; color: string; rounds: number }> = {
  listen: { title: 'Ascolta e tocca', emoji: '🎧', color: '#2ecc71', rounds: 8 },
  read: { title: 'Leggi e scegli', emoji: '👀', color: '#2ecc71', rounds: 8 },
  missing: { title: 'Lettera mancante', emoji: '🔤', color: '#f39c12', rounds: 8 },
  spell: { title: 'Scrivi la parola', emoji: '✍️', color: '#e84393', rounds: 6 },
  translate: { title: 'Traduci', emoji: '🔁', color: '#2ecc71', rounds: 8 },
  dictation: { title: 'Dettato', emoji: '👂', color: '#f39c12', rounds: 6 },
  sentence: { title: 'Costruisci la frase', emoji: '🧩', color: '#e84393', rounds: 6 },
}

// Games where the child types the English word letter by letter need plain single words.
const LETTER_GAMES: GameId[] = ['missing', 'spell', 'dictation']

// Stand-alone games and stories shown in their own section of a level.
type Extra = { id: string; title: string; emoji: string; color: string }

const MAZE: Extra = { id: 'maze', title: 'Segui le indicazioni', emoji: '🐰', color: '#10ac84' }

const LEVELS: Record<LevelId, { label: string; sub: string; emoji: string; sections: { title: string; topics: Topic[] }[]; games: GameId[]; extras?: { title: string; items: Extra[] } }> = {
  '1': {
    label: 'Livello 1–2',
    sub: 'Ascolto e figure',
    emoji: '🐣',
    sections: [
      { title: 'Argomenti', topics: basicTopics },
      { title: 'Feste e stagioni', topics: seasonalTopics },
    ],
    games: ['listen'],
  },
  '2': {
    label: 'Livello 3–4',
    sub: 'Lettura e spelling',
    emoji: '📚',
    sections: [{ title: 'Argomenti', topics: [...basicTopics, ...moreTopics] }],
    games: ['read', 'missing', 'spell'],
    extras: { title: 'Giochi', items: [MAZE] },
  },
  '3': {
    label: 'Livello 5–6',
    sub: 'Dettato e frasi',
    emoji: '🚀',
    sections: [{ title: 'Argomenti', topics: advancedTopics }],
    games: ['translate', 'dictation', 'sentence'],
  },
}

type View =
  | { name: 'home' }
  | { name: 'pick'; topic: Topic }
  | { name: 'learn'; topic: Topic }
  | { name: 'game'; topic: Topic; game: GameId }
  | { name: 'maze' }

const PROGRESS_KEY = 'learn-english-progress'
const LEVEL_KEY = 'learn-english-level'

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage unavailable: keep it for this visit only
  }
}

const scoreKey = (topic: Topic, game: GameId) => `${topic.id}:${game}`

function makeRounds(topic: Topic, game: GameId) {
  const words = topic.words
  const pool =
    game === 'sentence' ? (topic.sentences ?? []) : LETTER_GAMES.includes(game) ? words.filter((w) => /^[a-z]+$/.test(w.en)) : words
  const targets = shuffle(pool).slice(0, Math.min(GAMES[game].rounds, pool.length))
  return targets.map((target) => ({
    target,
    options: shuffle([target, ...shuffle(words.filter((w) => w !== target)).slice(0, 3)]),
  }))
}

function GameScreen({ topic, game, onBack, onFinish }: { topic: Topic; game: GameId; onBack: () => void; onFinish: (stars: number) => void }) {
  const rounds = useMemo(() => makeRounds(topic, game), [topic, game])
  return (
    <GameFrame total={rounds.length} onBack={onBack} onFinish={onFinish}>
      {(i, done) => {
        const { target, options } = rounds[i]
        if (game === 'spell' || game === 'dictation' || game === 'sentence')
          return <BuildRound target={target} kind={game} onDone={done} />
        if (game === 'missing') return <MissingLetterRound target={target} onDone={done} />
        return <ChooseRound target={target} options={options} mode={game} onDone={done} />
      }}
    </GameFrame>
  )
}

export default function App() {
  // Screens form a stack mirrored in the browser history, so both the ⬅️ buttons and the
  // browser/phone back button return to the previous screen instead of leaving the app.
  const [stack, setStack] = useState<View[]>([{ name: 'home' }])
  const view = stack[stack.length - 1]
  const [level, setLevel] = useState<LevelId>(() => load<LevelId>(LEVEL_KEY, '1'))
  const [best, setBest] = useState<Record<string, number>>(() => load(PROGRESS_KEY, {}))

  useEffect(() => {
    history.replaceState({ depth: 0 }, '')
    const onPop = (e: PopStateEvent) => {
      const depth = typeof e.state?.depth === 'number' ? e.state.depth : 0
      setStack((s) => s.slice(0, depth + 1))
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  function setView(next: View) {
    history.pushState({ depth: stack.length }, '')
    setStack([...stack, next])
  }

  const back = () => {
    if (stack.length > 1) history.back()
  }
  const levelInfo = LEVELS[level]

  function chooseLevel(id: LevelId) {
    setLevel(id)
    save(LEVEL_KEY, id)
  }

  function saveBest(key: string, stars: number) {
    setBest((prev) => {
      const next = { ...prev, [key]: Math.max(prev[key] ?? 0, stars) }
      save(PROGRESS_KEY, next)
      return next
    })
  }

  const extraKey = (x: Extra) => `game:${x.id}`
  function openExtra(x: Extra) {
    if (x.id === 'maze') setView({ name: 'maze' })
  }

  const topicStars = (topic: Topic) => levelInfo.games.reduce((sum, g) => sum + (best[scoreKey(topic, g)] ?? 0), 0)

  if (view.name === 'maze') return <MazeGame onBack={back} onFinish={(s) => saveBest('game:maze', s)} />
  if (view.name === 'learn') return <Learn category={view.topic} onBack={back} />
  if (view.name === 'game') {
    const { topic, game } = view
    return (
      <GameScreen
        topic={topic}
        game={game}
        onBack={back}
        onFinish={(s) => saveBest(scoreKey(topic, game), s)}
      />
    )
  }

  if (view.name === 'pick') {
    const t = view.topic
    return (
      <div className="screen">
        <header className="topbar">
          <button className="round" onClick={back} aria-label="Indietro">⬅️</button>
          <h2>{t.emoji} {t.title}</h2>
          <span />
        </header>
        <div className="modes">
          <button className="big mode" style={{ background: '#54a0ff' }} onClick={() => setView({ name: 'learn', topic: t })}>
            📖 Impara
          </button>
          {levelInfo.games.map((g) => {
            const info = GAMES[g]
            const stars = best[scoreKey(t, g)]
            return (
              <button key={g} className="big mode" style={{ background: info.color }} onClick={() => setView({ name: 'game', topic: t, game: g })}>
                {info.emoji} {info.title}
                {stars ? <span className="mode-best">⭐ {stars}</span> : null}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="screen">
      <h1 className="title" onClick={() => speak("Let's learn English!")}>
        🎈 Let's learn English!
      </h1>
      <div className="levels" role="radiogroup" aria-label="Livello">
        {(Object.keys(LEVELS) as LevelId[]).map((id) => (
          <button
            key={id}
            role="radio"
            aria-checked={level === id}
            className={`level ${level === id ? 'on' : ''}`}
            onClick={() => chooseLevel(id)}
          >
            <span className="level-emoji">{LEVELS[id].emoji}</span>
            <span className="level-label">{LEVELS[id].label}</span>
            <span className="level-sub">{LEVELS[id].sub}</span>
          </button>
        ))}
      </div>
      {levelInfo.extras && (
        <section className="section">
          <h3 className="section-title">{levelInfo.extras.title}</h3>
          <div className="grid categories extras">
            {levelInfo.extras.items.map((x) => {
              const stars = best[extraKey(x)]
              return (
                <button key={x.id} className="category" style={{ background: x.color }} onClick={() => openExtra(x)}>
                  <span className="emoji">{x.emoji}</span>
                  <span className="label">{x.title}</span>
                  <span className="best">{stars ? `⭐ ${stars}` : ' '}</span>
                </button>
              )
            })}
          </div>
        </section>
      )}
      {levelInfo.sections.map((section) => (
        <section key={section.title} className="section">
          <h3 className="section-title">{section.title}</h3>
          <div className="grid categories">
            {section.topics.map((t) => {
              const stars = topicStars(t)
              return (
                <button key={t.id} className="category" style={{ background: t.color }} onClick={() => setView({ name: 'pick', topic: t })}>
                  <span className="emoji">{t.emoji}</span>
                  <span className="label">{t.title}</span>
                  <span className="best">{stars ? `⭐ ${stars}` : ' '}</span>
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
