import type { Dish } from './data/cooking'
import { load, save } from './utils'

// The fridge in the child's house keeps the dishes made in the cooking game. It is saved per
// profile like the house, so the QR copy carries it too. Kept small so the QR code stays readable.

export type FridgeDish = Pick<Dish, 'recipe' | 'mix' | 'layers' | 'toppings' | 'color' | 'fruits' | 'cooked' | 'cut' | 'top'>

const FRIDGE_KEY = 'learn-english-fridge'
export const FRIDGE_MAX = 6

export const loadFridge = () => load<FridgeDish[]>(FRIDGE_KEY, [])
export const saveFridge = (list: FridgeDish[]) => save(FRIDGE_KEY, list)

// Only what is needed to draw the finished dish again.
export function toFridge(d: Dish): FridgeDish {
  const keep: FridgeDish = { recipe: d.recipe, layers: d.layers, toppings: d.toppings, fruits: d.fruits }
  if (d.mix) keep.mix = d.mix
  if (d.color) keep.color = d.color
  if (d.cooked) keep.cooked = true
  if (d.cut) keep.cut = true
  if (d.top) keep.top = true
  return keep
}

// Adds a dish; when the fridge is full the oldest one is eaten to make room. Returns true if so.
export function addToFridge(d: Dish): boolean {
  const list = [...loadFridge(), toFridge(d)]
  const full = list.length > FRIDGE_MAX
  saveFridge(list.slice(-FRIDGE_MAX))
  return full
}

export const FINAL_SCENE = { pizza: 'pizza', cake: 'cake', smoothie: 'glass', pancakes: 'plate', sandwich: 'sandwich' } as const

// Rubbing steps are finished on every dish in the fridge.
export const fridgeView = (f: FridgeDish) => ({ ...f, scene: FINAL_SCENE[f.recipe], p: { roll: 1, icing: 1, butter: 1, mix: 1 } })
