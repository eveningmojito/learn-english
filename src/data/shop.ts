// Everything that can be bought for the house, with English names to learn while building.
// Add a line to a list and it appears in the shop.

export type ShopItem = { id: string; en: string; it: string; emoji: string; price: number }
export type Room = { id: string; en: string; it: string; emoji: string; color: string }

export const ROOM_PRICE = 15
export const ITEMS_PER_SQUARE = 3
export const MAX_WIDTH = 6
export const MAX_FLOORS = 4
export const MISSION_REWARD = 20

// One more square on every floor, and one more floor, get dearer as the house grows.
export const squarePrice = (width: number, floors: number) => 30 + 15 * (width - 3) * floors + 10 * floors
export const floorPrice = (floors: number) => 80 * floors

export const rooms: Room[] = [
  { id: 'bedroom', en: 'bedroom', it: 'camera da letto', emoji: '🛏️', color: '#cfe6ff' },
  { id: 'kitchen', en: 'kitchen', it: 'cucina', emoji: '🍳', color: '#ffe6b8' },
  { id: 'bathroom', en: 'bathroom', it: 'bagno', emoji: '🛁', color: '#cdf3ec' },
  { id: 'living', en: 'living room', it: 'soggiorno', emoji: '🛋️', color: '#ffd9e2' },
  { id: 'playroom', en: 'playroom', it: 'stanza dei giochi', emoji: '🧸', color: '#e6dcff' },
  { id: 'study', en: 'study', it: 'studio', emoji: '📚', color: '#e3f3c4' },
]

export const shop: { id: string; title: string; emoji: string; items: ShopItem[] }[] = [
  {
    id: 'furniture',
    title: 'Mobili',
    emoji: '🛋️',
    items: [
      { id: 'bed', en: 'bed', it: 'letto', emoji: '🛏️', price: 30 },
      { id: 'sofa', en: 'sofa', it: 'divano', emoji: '🛋️', price: 30 },
      { id: 'chair', en: 'chair', it: 'sedia', emoji: '🪑', price: 12 },
      { id: 'bathtub', en: 'bathtub', it: 'vasca da bagno', emoji: '🛁', price: 35 },
      { id: 'toilet', en: 'toilet', it: 'gabinetto', emoji: '🚽', price: 25 },
      { id: 'shower', en: 'shower', it: 'doccia', emoji: '🚿', price: 25 },
      { id: 'mirror', en: 'mirror', it: 'specchio', emoji: '🪞', price: 15 },
      { id: 'television', en: 'television', it: 'televisione', emoji: '📺', price: 40 },
      { id: 'computer', en: 'computer', it: 'computer', emoji: '💻', price: 45 },
      { id: 'piano', en: 'piano', it: 'pianoforte', emoji: '🎹', price: 60 },
      { id: 'lamp', en: 'lamp', it: 'lampada', emoji: '💡', price: 10 },
      { id: 'window', en: 'window', it: 'finestra', emoji: '🪟', price: 15 },
      { id: 'ladder', en: 'ladder', it: 'scala', emoji: '🪜', price: 15 },
    ],
  },
  {
    id: 'things',
    title: 'Oggetti',
    emoji: '🧸',
    items: [
      { id: 'teddy', en: 'teddy bear', it: 'orsacchiotto', emoji: '🧸', price: 10 },
      { id: 'picture', en: 'picture', it: 'quadro', emoji: '🖼️', price: 12 },
      { id: 'clock', en: 'clock', it: 'orologio', emoji: '🕰️', price: 12 },
      { id: 'plant', en: 'plant', it: 'pianta', emoji: '🪴', price: 8 },
      { id: 'cactus', en: 'cactus', it: 'cactus', emoji: '🌵', price: 8 },
      { id: 'books', en: 'books', it: 'libri', emoji: '📚', price: 10 },
      { id: 'guitar', en: 'guitar', it: 'chitarra', emoji: '🎸', price: 25 },
      { id: 'ball', en: 'ball', it: 'palla', emoji: '⚽', price: 5 },
      { id: 'kite', en: 'kite', it: 'aquilone', emoji: '🪁', price: 8 },
      { id: 'teapot', en: 'teapot', it: 'teiera', emoji: '🫖', price: 8 },
      { id: 'cake', en: 'cake', it: 'torta', emoji: '🎂', price: 10 },
      { id: 'flower', en: 'flower', it: 'fiore', emoji: '🌻', price: 6 },
      { id: 'candle', en: 'candle', it: 'candela', emoji: '🕯️', price: 5 },
      { id: 'game', en: 'video game', it: 'videogioco', emoji: '🎮', price: 30 },
      { id: 'present', en: 'present', it: 'regalo', emoji: '🎁', price: 8 },
      { id: 'trophy', en: 'trophy', it: 'coppa', emoji: '🏆', price: 50 },
      { id: 'crown', en: 'crown', it: 'corona', emoji: '👑', price: 80 },
    ],
  },
  {
    id: 'pets',
    title: 'Animali',
    emoji: '🐶',
    items: [
      { id: 'cat', en: 'cat', it: 'gatto', emoji: '🐈', price: 25 },
      { id: 'dog', en: 'dog', it: 'cane', emoji: '🐕', price: 25 },
      { id: 'fish', en: 'fish', it: 'pesce', emoji: '🐠', price: 15 },
      { id: 'bird', en: 'bird', it: 'uccellino', emoji: '🐦', price: 15 },
      { id: 'hamster', en: 'hamster', it: 'criceto', emoji: '🐹', price: 15 },
      { id: 'rabbit', en: 'rabbit', it: 'coniglio', emoji: '🐇', price: 20 },
      { id: 'turtle', en: 'turtle', it: 'tartaruga', emoji: '🐢', price: 20 },
    ],
  },
]

export const allItems = shop.flatMap((c) => c.items)
