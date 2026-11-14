// Settings for the Wheel of Fortune game (level 5-6). The phrases come from sentences.ts.

// Wheel slices clockwise from the top: points per letter found, or 'bankrupt' (round points back to 0).
export const WHEEL_SLICES: (number | 'bankrupt')[] = [20, 50, 10, 100, 30, 'bankrupt', 40, 20, 60, 10, 80, 30]

export const VOWEL_PRICE = 25
export const WHEEL_ROUNDS = 3

// The category shown above the board, by sentences.ts topic id.
export const WHEEL_CATEGORIES: Record<string, { en: string; it: string }> = {
  jobs: { en: 'Jobs', it: 'Mestieri' },
  sports: { en: 'Sports', it: 'Sport' },
  actions: { en: 'Actions', it: 'Azioni' },
  town: { en: 'In town', it: 'In città' },
  feelings: { en: 'Feelings', it: 'Emozioni' },
  transport: { en: 'Transport', it: 'Trasporti' },
}
