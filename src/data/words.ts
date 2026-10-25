export type Word = {
  en: string
  it: string
  emoji: string
}

export type Category = {
  id: string
  title: string
  emoji: string
  color: string
  words: Word[]
}

export const categories: Category[] = [
  {
    id: 'animals',
    title: 'Animali',
    emoji: '🐶',
    color: '#ff9f43',
    words: [
      { en: 'dog', it: 'cane', emoji: '🐶' },
      { en: 'cat', it: 'gatto', emoji: '🐱' },
      { en: 'fish', it: 'pesce', emoji: '🐟' },
      { en: 'bird', it: 'uccello', emoji: '🐦' },
      { en: 'horse', it: 'cavallo', emoji: '🐴' },
      { en: 'cow', it: 'mucca', emoji: '🐮' },
      { en: 'pig', it: 'maiale', emoji: '🐷' },
      { en: 'lion', it: 'leone', emoji: '🦁' },
      { en: 'rabbit', it: 'coniglio', emoji: '🐰' },
      { en: 'frog', it: 'rana', emoji: '🐸' },
    ],
  },
  {
    id: 'colors',
    title: 'Colori',
    emoji: '🎨',
    color: '#ee5a9f',
    words: [
      { en: 'red', it: 'rosso', emoji: '🔴' },
      { en: 'orange', it: 'arancione', emoji: '🟠' },
      { en: 'yellow', it: 'giallo', emoji: '🟡' },
      { en: 'green', it: 'verde', emoji: '🟢' },
      { en: 'blue', it: 'blu', emoji: '🔵' },
      { en: 'purple', it: 'viola', emoji: '🟣' },
      { en: 'black', it: 'nero', emoji: '⚫' },
      { en: 'white', it: 'bianco', emoji: '⚪' },
      { en: 'brown', it: 'marrone', emoji: '🟤' },
    ],
  },
  {
    id: 'food',
    title: 'Frutta e cibo',
    emoji: '🍎',
    color: '#2ecc71',
    words: [
      { en: 'apple', it: 'mela', emoji: '🍎' },
      { en: 'banana', it: 'banana', emoji: '🍌' },
      { en: 'orange', it: 'arancia', emoji: '🍊' },
      { en: 'strawberry', it: 'fragola', emoji: '🍓' },
      { en: 'grapes', it: 'uva', emoji: '🍇' },
      { en: 'bread', it: 'pane', emoji: '🍞' },
      { en: 'cheese', it: 'formaggio', emoji: '🧀' },
      { en: 'milk', it: 'latte', emoji: '🥛' },
      { en: 'egg', it: 'uovo', emoji: '🥚' },
      { en: 'pizza', it: 'pizza', emoji: '🍕' },
    ],
  },
  {
    id: 'numbers',
    title: 'Numeri',
    emoji: '🔢',
    color: '#54a0ff',
    words: [
      { en: 'one', it: 'uno', emoji: '1️⃣' },
      { en: 'two', it: 'due', emoji: '2️⃣' },
      { en: 'three', it: 'tre', emoji: '3️⃣' },
      { en: 'four', it: 'quattro', emoji: '4️⃣' },
      { en: 'five', it: 'cinque', emoji: '5️⃣' },
      { en: 'six', it: 'sei', emoji: '6️⃣' },
      { en: 'seven', it: 'sette', emoji: '7️⃣' },
      { en: 'eight', it: 'otto', emoji: '8️⃣' },
      { en: 'nine', it: 'nove', emoji: '9️⃣' },
      { en: 'ten', it: 'dieci', emoji: '🔟' },
    ],
  },
]
