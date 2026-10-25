import { useEffect, useMemo, useState } from 'react'
import type { Topic } from './data/words'
import { Learn } from './components/Learn'
import { GameFrame } from './components/GameFrame'
import { ChooseRound } from './components/ChooseRound'
import { MissingLetterRound } from './components/MissingLetterRound'
import { BuildRound } from './components/BuildRound'
import { MazeGame } from './components/MazeGame'
import { Adventure } from './components/Adventure'
import { House } from './components/House'
import { coinsFor, LEVEL_MULTIPLIER, loadWallet, saveWallet, type Wallet } from './rewards'
import { stories, type Story } from './data/stories'
import { GAMES, LETTER_GAMES, LEVELS, type Extra, type GameId, type LevelId } from './data/levels'
import { speak } from './audio'
import { load, pickFresh, save, shuffle } from './utils'

type View =
  | { name: 'home' }
  | { name: 'pick'; topic: Topic }
  | { name: 'learn'; topic: Topic }
  | { name: 'game'; topic: Topic; game: GameId }
  | { name: 'maze' }
  | { name: 'story'; story: Story }
  | { name: 'house' }

const PROGRESS_KEY = 'learn-english-progress'
const LEVEL_KEY = 'learn-english-level'

const scoreKey = (topic: Topic, game: GameId) => `${topic.id}:${game}`

function makeRounds(topic: Topic, game: GameId) {
  const words = topic.words
  const pool =
    game === 'sentence' ? (topic.sentences ?? []) : LETTER_GAMES.includes(game) ? words.filter((w) => /^[a-z]+$/.test(w.en)) : words
  const targets = pickFresh(`${topic.id}:${game}`, pool, GAMES[game].rounds, (w) => w.en)
  return targets.map((target) => ({
    target,
    options: shuffle([target, ...shuffle(words.filter((w) => w !== target)).slice(0, 3)]),
  }))
}

function GameScreen({ topic, game, multiplier, onBack, onFinish }: { topic: Topic; game: GameId; multiplier: number; onBack: () => void; onFinish: (stars: number) => void }) {
  const rounds = useMemo(() => makeRounds(topic, game), [topic, game])
  return (
    <GameFrame total={rounds.length} onBack={onBack} onFinish={onFinish} multiplier={multiplier}>
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
  const [wallet, setWallet] = useState<Wallet>(loadWallet)

  function changeWallet(next: Wallet) {
    setWallet(next)
    saveWallet(next)
  }

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

  // Records the best score and pays coins: higher levels pay more per star.
  function finishGame(key: string, stars: number, multiplier: number) {
    const coins = coinsFor(stars, multiplier)
    changeWallet({ ...wallet, coins: wallet.coins + coins, earned: wallet.earned + coins, games: wallet.games + 1, stars: wallet.stars + stars })
    setBest((prev) => {
      const next = { ...prev, [key]: Math.max(prev[key] ?? 0, stars) }
      save(PROGRESS_KEY, next)
      return next
    })
  }

  const extraKey = (x: Extra) => `game:${x.id}`
  function openExtra(x: Extra) {
    if (x.id === 'maze') return setView({ name: 'maze' })
    const story = stories.find((s) => `story:${s.id}` === x.id)
    if (story) setView({ name: 'story', story })
  }

  const topicStars = (topic: Topic) => levelInfo.games.reduce((sum, g) => sum + (best[scoreKey(topic, g)] ?? 0), 0)

  if (view.name === 'house') return <House wallet={wallet} onWallet={changeWallet} onBack={back} />
  if (view.name === 'maze') return <MazeGame onBack={back} onFinish={(s) => finishGame('game:maze', s, LEVEL_MULTIPLIER['2'])} />
  if (view.name === 'story') {
    const { story } = view
    return <Adventure story={story} onBack={back} onFinish={(s) => finishGame(`game:story:${story.id}`, s, LEVEL_MULTIPLIER['3'])} />
  }
  if (view.name === 'learn') return <Learn category={view.topic} onBack={back} />
  if (view.name === 'game') {
    const { topic, game } = view
    return (
      <GameScreen
        topic={topic}
        game={game}
        onBack={back}
        multiplier={LEVEL_MULTIPLIER[level]}
        onFinish={(s) => finishGame(scoreKey(topic, game), s, LEVEL_MULTIPLIER[level])}
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
      <button className="house-button" onClick={() => setView({ name: 'house' })}>
        <span className="house-button-emoji">🏠</span>
        <span>
          <span className="house-button-title">La mia casa</span>
          <span className="house-button-sub">Gioca, guadagna monete e costruisci!</span>
        </span>
        <span className="coins">🪙 {wallet.coins}</span>
      </button>
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
