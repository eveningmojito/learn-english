import { useState } from 'react'
import { describe } from '../data/cooking'
import { FRIDGE_MAX, fridgeView, loadFridge, saveFridge, type FridgeDish } from '../fridge'
import { playPop, speak } from '../audio'
import { DishView, FridgeArt } from './CookingArt'

// The fridge in the child's house, with the dishes cooked in "In cucina". Tapping a dish says
// its name in English ("A pizza with mushrooms and olives"); eating it makes room for new ones.

export function Fridge() {
  const [dishes, setDishes] = useState<FridgeDish[]>(loadFridge)
  const [open, setOpen] = useState(false)
  const [showIt, setShowIt] = useState<number | null>(null)

  function eat(i: number) {
    playPop()
    speak('Yum yum! Delicious!')
    const next = dishes.filter((_, j) => j !== i)
    setDishes(next)
    saveFridge(next)
    setShowIt(null)
  }

  return (
    <>
      <button
        className="fridge-button"
        onClick={() => {
          setOpen(true)
          speak(dishes.length ? "Let's open the fridge!" : 'The fridge is empty.')
        }}
      >
        <FridgeArt className="fridge-mini" />
        <span>
          <span className="house-button-title">Il mio frigo</span>
          <span className="fridge-sub">{dishes.length ? `${dishes.length} ${dishes.length === 1 ? 'piatto' : 'piatti'} cucinati da te` : 'Vuoto: cucina qualcosa nel gioco 🍳 In cucina!'}</span>
        </span>
      </button>

      {open && (
        <div className="overlay" onClick={() => setOpen(false)}>
          <div className="fridge-open" onClick={(e) => e.stopPropagation()}>
            <h2>🧊 The fridge</h2>
            {dishes.length === 0 && <p className="hint">Il frigo è vuoto. Nel livello 3–4 gioca a 🍳 In cucina: quello che cucini finisce qui!</p>}
            <div className="fridge-shelves">
              {dishes.map((d, i) => {
                const name = describe(d)
                return (
                  <div key={i} className="fridge-dish">
                    <button
                      className="fridge-dish-view"
                      onClick={() => {
                        speak(name.en)
                        setShowIt(i)
                      }}
                      aria-label={name.en}
                    >
                      <DishView dish={fridgeView(d)} className="dish mini" />
                      <span className="fridge-name">{name.en}</span>
                      {showIt === i && <span className="bubble-it">{name.it}</span>}
                    </button>
                    <button className="help eat" onClick={() => eat(i)}>😋 Mangia</button>
                  </div>
                )
              })}
            </div>
            <p className="hint">Tocca un piatto per sentire come si chiama. Ci stanno {FRIDGE_MAX} piatti.</p>
            <button className="big" onClick={() => setOpen(false)}>Chiudi</button>
          </div>
        </div>
      )}
    </>
  )
}
