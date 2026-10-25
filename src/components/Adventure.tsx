import { useEffect, useMemo, useRef, useState } from 'react'
import type { Line, Scene, Story, Task } from '../data/stories'
import { playCorrect, playFanfare, playWrong, speak } from '../audio'
import { shuffle } from '../utils'
import { Scenery } from './Scenery'
import { BuildRound } from './BuildRound'

type Props = { story: Story; onBack: () => void; onFinish: (stars: number) => void }

function say(story: Story, line: Line) {
  speak(line.en, 'en', line.who ? story.speakers[line.who].pitch : 1)
}

function LineBubble({ story, line }: { story: Story; line: Line }) {
  const [showIt, setShowIt] = useState(false)
  const who = line.who ? story.speakers[line.who] : null
  return (
    <div className={`bubble-row ${who ? 'talk' : 'narration'}`}>
      <span className="bubble-avatar">{who ? who.emoji : '📖'}</span>
      <div className="bubble">
        {who && <span className="bubble-name">{who.name}</span>}
        <button className="bubble-en" onClick={() => say(story, line)}>
          {line.en} <span aria-hidden="true">🔊</span>
        </button>
        {showIt && <span className="bubble-it">{line.it}</span>}
      </div>
      <button className="it-toggle" onClick={() => setShowIt(!showIt)} aria-label="Traduzione in italiano">
        🇮🇹
      </button>
    </div>
  )
}

function ChooseTask({ task, onSolved }: { task: Extract<Task, { kind: 'choose' }>; onSolved: (firstTry: boolean) => void }) {
  const options = useMemo(() => shuffle(task.options), [task])
  const [wrong, setWrong] = useState<string[]>([])
  const [solved, setSolved] = useState(false)
  const [before, after] = task.question?.split('___') ?? []
  const isGap = task.question?.includes('___')

  function pick(option: string) {
    if (solved || wrong.includes(option)) return
    if (option !== task.answer) {
      playWrong()
      setWrong([...wrong, option])
      return
    }
    playCorrect()
    setSolved(true)
    setTimeout(() => speak(isGap ? task.question!.replace('___', option) : option), 500)
    onSolved(wrong.length === 0)
  }

  return (
    <div className="task">
      <p className="hint">{task.hint}</p>
      {task.question && (
        <button className="task-question" onClick={() => speak(isGap ? task.question!.replace('___', '...') : task.question!)}>
          {isGap ? (
            <>
              {before}
              <span className={`slot word-slot ${solved ? 'filled' : ''}`}>{solved ? task.answer : ' '}</span>
              {after}
            </>
          ) : (
            <>{task.question} 🔊</>
          )}
        </button>
      )}
      <div className="task-options">
        {options.map((o) => (
          <button
            key={o}
            className={`card text-card option ${wrong.includes(o) ? 'shake faded' : ''} ${solved && o === task.answer ? 'pop right' : ''}`}
            onClick={() => pick(o)}
            disabled={wrong.includes(o)}
          >
            <span className="en">{o}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function SceneView({ story, scene, last, onSolved, onNext }: { story: Story; scene: Scene; last: boolean; onSolved: (firstTry: boolean) => void; onNext: () => void }) {
  const [shown, setShown] = useState(1)
  const [solved, setSolved] = useState(!scene.task)
  const bottom = useRef<HTMLDivElement>(null)
  const allShown = shown >= scene.lines.length

  useEffect(() => {
    const t = setTimeout(() => say(story, scene.lines[shown - 1]), 350)
    return () => clearTimeout(t)
  }, [story, scene, shown])

  // On small screens, scroll only if the newest line, exercise or button is out of view, and
  // without sliding, so text never moves while the child is reading it.
  useEffect(() => {
    if (shown > 1 || solved) bottom.current?.scrollIntoView({ behavior: 'instant', block: 'nearest' })
  }, [shown, solved])

  function solve(firstTry: boolean) {
    onSolved(firstTry)
    setTimeout(() => setSolved(true), 900)
  }

  return (
    <>
      <div className="stage">
        <Scenery id={scene.bg} />
        {scene.cast.map((a, i) => (
          <span
            key={i}
            className="actor"
            style={{ left: `${a.x}%`, bottom: `${a.y ?? 8}%`, fontSize: `${(a.size ?? 1) * 15}cqw` }}
          >
            <span className={a.anim ?? ''} style={{ display: 'inline-block', transform: a.flip ? 'scaleX(-1)' : undefined }}>
              {a.emoji}
            </span>
            {a.anim === 'sleep' && <span className="zzz">💤</span>}
          </span>
        ))}
      </div>

      <div className="story-lines">
        {scene.lines.slice(0, shown).map((line, i) => (
          <LineBubble key={i} story={story} line={line} />
        ))}
      </div>

      {!allShown ? (
        <button className="big next" onClick={() => setShown(shown + 1)}>Avanti ▶</button>
      ) : (
        <>
          {scene.task?.kind === 'choose' && <ChooseTask task={scene.task} onSolved={solve} />}
          {scene.task?.kind === 'order' && (
            <div className="task">
              <BuildRound target={{ en: scene.task.en, it: scene.task.it, emoji: scene.task.emoji }} kind="sentence" onDone={solve} />
            </div>
          )}
          {solved && (
            <button className="big next" onClick={onNext}>{last ? 'Fine 🏁' : 'Continua ▶'}</button>
          )}
        </>
      )}
      <div ref={bottom} />
    </>
  )
}

export function Adventure({ story, onBack, onFinish }: Props) {
  const [index, setIndex] = useState(0)
  const [stars, setStars] = useState(0)
  const total = story.scenes.filter((s) => s.task).length
  const finished = index >= story.scenes.length

  useEffect(() => {
    if (finished) {
      playFanfare()
      onFinish(stars)
    }
  }, [finished]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [index])

  if (finished) {
    return (
      <div className="screen center">
        <div className="trophy">{story.emoji}</div>
        <h2>The end! Fantastico!</h2>
        <p className="stars">{'⭐'.repeat(stars)}{'☆'.repeat(total - stars)}</p>
        <p className="hint">Hai risolto {stars} prove su {total} al primo colpo!</p>
        <button className="big" onClick={onBack}>🏠 Torna al menu</button>
      </div>
    )
  }

  return (
    <div className="screen adventure">
      <header className="topbar">
        <button className="round" onClick={onBack} aria-label="Indietro">⬅️</button>
        <div className="progress" aria-label={`Scena ${index + 1} di ${story.scenes.length}`}>
          {story.scenes.map((_, i) => (
            <span key={i} className={i < index ? 'dot on' : i === index ? 'dot now' : 'dot'} />
          ))}
        </div>
        <span className="score">⭐ {stars}</span>
      </header>
      <SceneView
        key={index}
        story={story}
        scene={story.scenes[index]}
        last={index === story.scenes.length - 1}
        onSolved={(firstTry) => firstTry && setStars((s) => s + 1)}
        onNext={() => setIndex(index + 1)}
      />
    </div>
  )
}
