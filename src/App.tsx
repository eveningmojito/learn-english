import { useMemo, useState } from 'react'
import { basicTopics, moreTopics, seasonalTopics, type Topic, type Word } from './data/words'
import { Learn } from './components/Learn'
import { GameFrame } from './components/GameFrame'
import { ChooseRound } from './components/ChooseRound'
import { MissingLetterRound } from './components/MissingLetterRound'
import { SpellRound } from './components/SpellRound'
import { speak } from './audio'
import { shuffle } from './utils'

type GameId = 'listen' | 'read' | 'missing' | 'spell'
type LevelId = '1' | '2'

const GAMES: Record<GameId, { title: string; emoji: string; color: string; rounds: number }> = {
  listen: { title: 'Ascolta e tocca', emoji: '🎧', color: '#2ecc71', rounds: 8 },
  read: { title: 'Leggi e scegli', emoji: '👀', color: '#2ecc71', rounds: 8 },
  missing: { title: 'Lettera mancante', emoji: '🔤', color: '#f39c12', rounds: 8 },
  spell: { title: 'Scrivi la parola', emoji: '✍️', color: '#e84393', rounds: 6 },
}

const LEVELS: Record<LevelId, { label: string; sub: string; emoji: string; sections: { title: string; topics: Topic[] }[]; games: GameId[] }> = {
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
    label: 'Livello 2–3',
    sub: 'Lettura e spelling',
    emoji: '📚',
    sections: [{ title: 'Argomenti', topics: [...basicTopics, ...moreTopics] }],
    games: ['read', 'missing', 'spell'],
  },
}

type View =
  | { name: 'home' }
  | { name: 'pick'; topic: Topic }
  | { name: 'learn'; topic: Topic }
  | { name: 'game'; topic: Topic; game: GameId }

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

function makeRounds(words: Word[], game: GameId) {
  // Spelling games need plain single words.
  const pool = game === 'missing' || game === 'spell' ? words.filter((w) => /^[a-z]+$/.test(w.en)) : words
  const targets = shuffle(pool).slice(0, Math.min(GAMES[game].rounds, pool.length))
  return targets.map((target) => ({
    target,
    options: shuffle([target, ...shuffle(words.filter((w) => w !== target)).slice(0, 3)]),
  }))
}

function GameScreen({ topic, game, onBack, onFinish }: { topic: Topic; game: GameId; onBack: () => void; onFinish: (stars: number) => void }) {
  const rounds = useMemo(() => makeRounds(topic.words, game), [topic, game])
  return (
    <GameFrame total={rounds.length} onBack={onBack} onFinish={onFinish}>
      {(i, done) => {
        const { target, options } = rounds[i]
        if (game === 'spell') return <SpellRound target={target} onDone={done} />
        if (game === 'missing') return <MissingLetterRound target={target} onDone={done} />
        return <ChooseRound target={target} options={options} mode={game} onDone={done} />
      }}
    </GameFrame>
  )
}

export default function App() {
  const [view, setView] = useState<View>({ name: 'home' })
  const [level, setLevel] = useState<LevelId>(() => load<LevelId>(LEVEL_KEY, '1'))
  const [best, setBest] = useState<Record<string, number>>(() => load(PROGRESS_KEY, {}))

  const home = () => setView({ name: 'home' })
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

  const topicStars = (topic: Topic) => levelInfo.games.reduce((sum, g) => sum + (best[scoreKey(topic, g)] ?? 0), 0)

  if (view.name === 'learn') return <Learn category={view.topic} onBack={() => setView({ name: 'pick', topic: view.topic })} />
  if (view.name === 'game') {
    const { topic, game } = view
    return (
      <GameScreen
        topic={topic}
        game={game}
        onBack={() => setView({ name: 'pick', topic })}
        onFinish={(s) => saveBest(scoreKey(topic, game), s)}
      />
    )
  }

  if (view.name === 'pick') {
    const t = view.topic
    return (
      <div className="screen">
        <header className="topbar">
          <button className="round" onClick={home} aria-label="Indietro">⬅️</button>
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
