import { load, save } from './utils'

// Coins earned by playing, spent on the house. Higher levels pay more per star.

export type Wallet = { coins: number; earned: number; games: number; stars: number }

const WALLET_KEY = 'learn-english-wallet'
// New players start with a few coins so they can try the house straight away.
const START: Wallet = { coins: 30, earned: 0, games: 0, stars: 0 }

export const loadWallet = () => ({ ...START, ...load<Partial<Wallet>>(WALLET_KEY, {}) })
export const saveWallet = (w: Wallet) => save(WALLET_KEY, w)

// Coins for one finished game: each star is worth the level's multiplier, plus a bonus for finishing.
export const coinsFor = (stars: number, multiplier: number) => (stars + 1) * multiplier

export const LEVEL_MULTIPLIER: Record<string, number> = { '1': 1, '2': 2, '3': 3 }
