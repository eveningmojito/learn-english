import { basicTopics, moreTopics, seasonalTopics, type Topic } from './words'
import { advancedTopics } from './advanced'
import { stories } from './stories'

// The catalogue of exercises: which games exist and which topics and games each level offers.
// Add a topic to a section, or a game id to a level's list, and it appears in the app.

export type GameId = 'listen' | 'read' | 'missing' | 'spell' | 'translate' | 'dictation' | 'sentence'
export type LevelId = '1' | '2' | '3'

export const GAMES: Record<GameId, { title: string; emoji: string; color: string; rounds: number }> = {
  listen: { title: 'Ascolta e tocca', emoji: '🎧', color: '#2ecc71', rounds: 8 },
  read: { title: 'Leggi e scegli', emoji: '👀', color: '#2ecc71', rounds: 8 },
  missing: { title: 'Lettera mancante', emoji: '🔤', color: '#f39c12', rounds: 8 },
  spell: { title: 'Scrivi la parola', emoji: '✍️', color: '#e84393', rounds: 6 },
  translate: { title: 'Traduci', emoji: '🔁', color: '#2ecc71', rounds: 8 },
  dictation: { title: 'Dettato', emoji: '👂', color: '#f39c12', rounds: 6 },
  sentence: { title: 'Costruisci la frase', emoji: '🧩', color: '#e84393', rounds: 6 },
}

// Games where the child types the English word letter by letter need plain single words.
export const LETTER_GAMES: GameId[] = ['missing', 'spell', 'dictation']

// Stand-alone games and stories shown in their own section of a level.
export type Extra = { id: string; title: string; emoji: string; color: string }

const MAZE: Extra = { id: 'maze', title: 'Segui le indicazioni', emoji: '🐰', color: '#10ac84' }

export const LEVELS: Record<LevelId, { label: string; sub: string; emoji: string; sections: { title: string; topics: Topic[] }[]; games: GameId[]; extras?: { title: string; items: Extra[] } }> = {
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
    extras: { title: 'Avventure', items: stories.map(({ id, title, emoji, color }) => ({ id: `story:${id}`, title, emoji, color })) },
  },
}
