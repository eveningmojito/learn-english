import { useState } from 'react'
import { categories, type Category } from './data/words'
import { Learn } from './components/Learn'
import { Quiz } from './components/Quiz'
import { speak } from './audio'

type View =
  | { name: 'home' }
  | { name: 'pick'; category: Category }
  | { name: 'learn'; category: Category }
  | { name: 'quiz'; category: Category }

const STORAGE_KEY = 'learn-english-stars'

function loadStars(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

export default function App() {
  const [view, setView] = useState<View>({ name: 'home' })
  const [best, setBest] = useState(loadStars)

  const home = () => setView({ name: 'home' })

  function saveBest(categoryId: string, stars: number) {
    setBest((prev) => {
      const next = { ...prev, [categoryId]: Math.max(prev[categoryId] ?? 0, stars) }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // storage unavailable: keep the score for this visit only
      }
      return next
    })
  }

  if (view.name === 'learn') return <Learn category={view.category} onBack={home} />
  if (view.name === 'quiz')
    return <Quiz category={view.category} onBack={home} onFinish={(s) => saveBest(view.category.id, s)} />

  if (view.name === 'pick') {
    const c = view.category
    return (
      <div className="screen">
        <header className="topbar">
          <button className="round" onClick={home} aria-label="Indietro">⬅️</button>
          <h2>{c.emoji} {c.title}</h2>
          <span />
        </header>
        <div className="modes">
          <button className="big mode learn" onClick={() => setView({ name: 'learn', category: c })}>
            📖 Impara
          </button>
          <button className="big mode play" onClick={() => setView({ name: 'quiz', category: c })}>
            🎮 Gioca
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen">
      <h1 className="title" onClick={() => speak("Let's learn English!")}>
        🎈 Let's learn English!
      </h1>
      <p className="hint">Scegli un argomento</p>
      <div className="grid categories">
        {categories.map((c) => (
          <button
            key={c.id}
            className="category"
            style={{ background: c.color }}
            onClick={() => setView({ name: 'pick', category: c })}
          >
            <span className="emoji">{c.emoji}</span>
            <span className="label">{c.title}</span>
            <span className="best">{best[c.id] ? `⭐ ${best[c.id]}` : ' '}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
