export type Word = {
  en: string
  it: string
  emoji: string
}

export type Topic = {
  id: string
  title: string
  emoji: string
  color: string
  words: Word[]
}

const animals: Topic = {
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
}

const colors: Topic = {
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
}

const food: Topic = {
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
}

const numbers: Topic = {
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
}

export const basicTopics: Topic[] = [animals, colors, food, numbers]

// Special sections for level 1-2, in school-year order.
export const seasonalTopics: Topic[] = [
  {
    id: 'autumn',
    title: 'Autunno',
    emoji: '🍂',
    color: '#d35400',
    words: [
      { en: 'leaf', it: 'foglia', emoji: '🍂' },
      { en: 'mushroom', it: 'fungo', emoji: '🍄' },
      { en: 'chestnut', it: 'castagna', emoji: '🌰' },
      { en: 'squirrel', it: 'scoiattolo', emoji: '🐿️' },
      { en: 'hedgehog', it: 'riccio', emoji: '🦔' },
      { en: 'wind', it: 'vento', emoji: '🌬️' },
      { en: 'umbrella', it: 'ombrello', emoji: '☂️' },
      { en: 'owl', it: 'gufo', emoji: '🦉' },
    ],
  },
  {
    id: 'halloween',
    title: 'Halloween',
    emoji: '🎃',
    color: '#6c3483',
    words: [
      { en: 'pumpkin', it: 'zucca', emoji: '🎃' },
      { en: 'ghost', it: 'fantasma', emoji: '👻' },
      { en: 'witch', it: 'strega', emoji: '🧙' },
      { en: 'bat', it: 'pipistrello', emoji: '🦇' },
      { en: 'spider', it: 'ragno', emoji: '🕷️' },
      { en: 'candy', it: 'caramella', emoji: '🍬' },
      { en: 'moon', it: 'luna', emoji: '🌙' },
      { en: 'broom', it: 'scopa', emoji: '🧹' },
      { en: 'skeleton', it: 'scheletro', emoji: '💀' },
    ],
  },
  {
    id: 'winter',
    title: 'Inverno',
    emoji: '❄️',
    color: '#3d8bd9',
    words: [
      { en: 'snow', it: 'neve', emoji: '❄️' },
      { en: 'snowman', it: 'pupazzo di neve', emoji: '⛄' },
      { en: 'scarf', it: 'sciarpa', emoji: '🧣' },
      { en: 'gloves', it: 'guanti', emoji: '🧤' },
      { en: 'coat', it: 'cappotto', emoji: '🧥' },
      { en: 'sled', it: 'slitta', emoji: '🛷' },
      { en: 'skis', it: 'sci', emoji: '🎿' },
      { en: 'penguin', it: 'pinguino', emoji: '🐧' },
    ],
  },
  {
    id: 'christmas',
    title: 'Natale',
    emoji: '🎄',
    color: '#c0392b',
    words: [
      { en: 'Christmas tree', it: 'albero di Natale', emoji: '🎄' },
      { en: 'Santa Claus', it: 'Babbo Natale', emoji: '🎅' },
      { en: 'present', it: 'regalo', emoji: '🎁' },
      { en: 'star', it: 'stella', emoji: '⭐' },
      { en: 'bell', it: 'campana', emoji: '🔔' },
      { en: 'reindeer', it: 'renna', emoji: '🦌' },
      { en: 'candle', it: 'candela', emoji: '🕯️' },
      { en: 'cookie', it: 'biscotto', emoji: '🍪' },
      { en: 'stocking', it: 'calza', emoji: '🧦' },
    ],
  },
  {
    id: 'carnival',
    title: 'Carnevale',
    emoji: '🎭',
    color: '#8854d0',
    words: [
      { en: 'mask', it: 'maschera', emoji: '🎭' },
      { en: 'clown', it: 'pagliaccio', emoji: '🤡' },
      { en: 'confetti', it: 'coriandoli', emoji: '🎊' },
      { en: 'party', it: 'festa', emoji: '🎉' },
      { en: 'princess', it: 'principessa', emoji: '👸' },
      { en: 'pirate', it: 'pirata', emoji: '🏴‍☠️' },
      { en: 'superhero', it: 'supereroe', emoji: '🦸' },
      { en: 'drum', it: 'tamburo', emoji: '🥁' },
    ],
  },
  {
    id: 'spring',
    title: 'Primavera',
    emoji: '🌸',
    color: '#20bf6b',
    words: [
      { en: 'flower', it: 'fiore', emoji: '🌸' },
      { en: 'butterfly', it: 'farfalla', emoji: '🦋' },
      { en: 'bee', it: 'ape', emoji: '🐝' },
      { en: 'ladybird', it: 'coccinella', emoji: '🐞' },
      { en: 'rain', it: 'pioggia', emoji: '🌧️' },
      { en: 'rainbow', it: 'arcobaleno', emoji: '🌈' },
      { en: 'tree', it: 'albero', emoji: '🌳' },
      { en: 'snail', it: 'lumaca', emoji: '🐌' },
    ],
  },
  {
    id: 'easter',
    title: 'Pasqua',
    emoji: '🐣',
    color: '#e84393',
    words: [
      { en: 'Easter egg', it: 'uovo di Pasqua', emoji: '🥚' },
      { en: 'bunny', it: 'coniglietto', emoji: '🐰' },
      { en: 'chick', it: 'pulcino', emoji: '🐣' },
      { en: 'basket', it: 'cestino', emoji: '🧺' },
      { en: 'chocolate', it: 'cioccolato', emoji: '🍫' },
      { en: 'lamb', it: 'agnello', emoji: '🐑' },
      { en: 'tulip', it: 'tulipano', emoji: '🌷' },
      { en: 'dove', it: 'colomba', emoji: '🕊️' },
    ],
  },
  {
    id: 'summer',
    title: 'Estate',
    emoji: '☀️',
    color: '#0097e6',
    words: [
      { en: 'sun', it: 'sole', emoji: '☀️' },
      { en: 'sea', it: 'mare', emoji: '🌊' },
      { en: 'beach', it: 'spiaggia', emoji: '🏖️' },
      { en: 'ice cream', it: 'gelato', emoji: '🍦' },
      { en: 'shell', it: 'conchiglia', emoji: '🐚' },
      { en: 'boat', it: 'barca', emoji: '⛵' },
      { en: 'crab', it: 'granchio', emoji: '🦀' },
      { en: 'sunglasses', it: 'occhiali da sole', emoji: '🕶️' },
      { en: 'watermelon', it: 'anguria', emoji: '🍉' },
    ],
  },
  {
    id: 'birthday',
    title: 'Compleanno',
    emoji: '🎂',
    color: '#fd5e53',
    words: [
      { en: 'cake', it: 'torta', emoji: '🎂' },
      { en: 'balloon', it: 'palloncino', emoji: '🎈' },
      { en: 'present', it: 'regalo', emoji: '🎁' },
      { en: 'candle', it: 'candelina', emoji: '🕯️' },
      { en: 'party', it: 'festa', emoji: '🎉' },
      { en: 'music', it: 'musica', emoji: '🎵' },
      { en: 'friends', it: 'amici', emoji: '🧒' },
      { en: 'card', it: 'biglietto', emoji: '💌' },
    ],
  },
]

// Extra topics for level 2-3. Single lowercase words only, so they work in spelling games.
export const moreTopics: Topic[] = [
  {
    id: 'body',
    title: 'Il corpo',
    emoji: '✋',
    color: '#f0932b',
    words: [
      { en: 'eye', it: 'occhio', emoji: '👁️' },
      { en: 'ear', it: 'orecchio', emoji: '👂' },
      { en: 'nose', it: 'naso', emoji: '👃' },
      { en: 'mouth', it: 'bocca', emoji: '👄' },
      { en: 'hand', it: 'mano', emoji: '✋' },
      { en: 'foot', it: 'piede', emoji: '🦶' },
      { en: 'leg', it: 'gamba', emoji: '🦵' },
      { en: 'tooth', it: 'dente', emoji: '🦷' },
      { en: 'arm', it: 'braccio', emoji: '💪' },
    ],
  },
  {
    id: 'clothes',
    title: 'Vestiti',
    emoji: '👕',
    color: '#4b7bec',
    words: [
      { en: 'shirt', it: 'maglietta', emoji: '👕' },
      { en: 'dress', it: 'vestito', emoji: '👗' },
      { en: 'shoes', it: 'scarpe', emoji: '👟' },
      { en: 'hat', it: 'cappello', emoji: '🎩' },
      { en: 'socks', it: 'calzini', emoji: '🧦' },
      { en: 'coat', it: 'cappotto', emoji: '🧥' },
      { en: 'jeans', it: 'jeans', emoji: '👖' },
      { en: 'cap', it: 'cappellino', emoji: '🧢' },
      { en: 'scarf', it: 'sciarpa', emoji: '🧣' },
    ],
  },
  {
    id: 'school',
    title: 'La scuola',
    emoji: '🎒',
    color: '#26de81',
    words: [
      { en: 'book', it: 'libro', emoji: '📕' },
      { en: 'pen', it: 'penna', emoji: '🖊️' },
      { en: 'pencil', it: 'matita', emoji: '✏️' },
      { en: 'bag', it: 'zaino', emoji: '🎒' },
      { en: 'ruler', it: 'righello', emoji: '📏' },
      { en: 'scissors', it: 'forbici', emoji: '✂️' },
      { en: 'crayon', it: 'pastello', emoji: '🖍️' },
      { en: 'computer', it: 'computer', emoji: '💻' },
      { en: 'clock', it: 'orologio', emoji: '⏰' },
    ],
  },
  {
    id: 'weather',
    title: 'Il tempo',
    emoji: '🌦️',
    color: '#45aaf2',
    words: [
      { en: 'sun', it: 'sole', emoji: '☀️' },
      { en: 'rain', it: 'pioggia', emoji: '🌧️' },
      { en: 'snow', it: 'neve', emoji: '❄️' },
      { en: 'cloud', it: 'nuvola', emoji: '☁️' },
      { en: 'wind', it: 'vento', emoji: '🌬️' },
      { en: 'rainbow', it: 'arcobaleno', emoji: '🌈' },
      { en: 'storm', it: 'temporale', emoji: '⛈️' },
      { en: 'fog', it: 'nebbia', emoji: '🌫️' },
      { en: 'hot', it: 'caldo', emoji: '🥵' },
      { en: 'cold', it: 'freddo', emoji: '🥶' },
    ],
  },
  {
    id: 'home',
    title: 'La casa',
    emoji: '🏠',
    color: '#a5673f',
    words: [
      { en: 'house', it: 'casa', emoji: '🏠' },
      { en: 'door', it: 'porta', emoji: '🚪' },
      { en: 'window', it: 'finestra', emoji: '🪟' },
      { en: 'bed', it: 'letto', emoji: '🛏️' },
      { en: 'chair', it: 'sedia', emoji: '🪑' },
      { en: 'sofa', it: 'divano', emoji: '🛋️' },
      { en: 'bath', it: 'vasca', emoji: '🛁' },
      { en: 'key', it: 'chiave', emoji: '🔑' },
    ],
  },
]
