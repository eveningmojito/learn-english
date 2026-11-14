// The cooking game (level 3–4): ingredients, kitchen tools, cooking devices and recipes.
// Each recipe is a list of steps; every step is one round of the game, spoken in English.
// Add an ingredient or a recipe here and it appears in the game.

// `one` is the word used before another noun: a strawberry smoothie.
export type Ingredient = { en: string; it: string; emoji: string; color: string; bag?: boolean; plural?: boolean; one?: string }

export const INGREDIENTS: Record<string, Ingredient> = {
  flour: { en: 'flour', it: 'farina', emoji: '🌾', color: '#f7f1e3', bag: true },
  sugar: { en: 'sugar', it: 'zucchero', emoji: '🍭', color: '#fbe3ef', bag: true },
  water: { en: 'water', it: 'acqua', emoji: '💧', color: '#bfe6ff' },
  eggs: { en: 'eggs', it: 'uova', emoji: '🥚', color: '#fff3c4', plural: true },
  milk: { en: 'milk', it: 'latte', emoji: '🥛', color: '#ffffff' },
  butter: { en: 'butter', it: 'burro', emoji: '🧈', color: '#ffe59a' },
  ice: { en: 'ice', it: 'ghiaccio', emoji: '🧊', color: '#dff6ff' },
  bread: { en: 'bread', it: 'pane', emoji: '🍞', color: '#e8b46a' },
  tomato: { en: 'tomato', it: 'pomodoro', emoji: '🍅', color: '#e8432e' },
  cheese: { en: 'cheese', it: 'formaggio', emoji: '🧀', color: '#ffd43b' },
  mushrooms: { en: 'mushrooms', it: 'funghi', emoji: '🍄', color: '#d9c2a3', plural: true },
  olives: { en: 'olives', it: 'olive', emoji: '🫒', color: '#6b8e23', plural: true },
  pepper: { en: 'pepper', it: 'peperone', emoji: '🫑', color: '#4cae4c' },
  pineapple: { en: 'pineapple', it: 'ananas', emoji: '🍍', color: '#ffd84d' },
  corn: { en: 'corn', it: 'mais', emoji: '🌽', color: '#ffd84d' },
  basil: { en: 'basil', it: 'basilico', emoji: '🌿', color: '#3fae49' },
  ham: { en: 'ham', it: 'prosciutto', emoji: '🥓', color: '#f4a3a8' },
  lettuce: { en: 'lettuce', it: 'lattuga', emoji: '🥬', color: '#6abe45' },
  cucumber: { en: 'cucumber', it: 'cetriolo', emoji: '🥒', color: '#9ad16b' },
  egg: { en: 'egg', it: 'uovo', emoji: '🍳', color: '#fffaf0' },
  carrot: { en: 'carrot', it: 'carota', emoji: '🥕', color: '#ff8c1a' },
  potato: { en: 'potato', it: 'patata', emoji: '🥔', color: '#d9b26f' },
  onion: { en: 'onion', it: 'cipolla', emoji: '🧅', color: '#e9c46a' },
  banana: { en: 'banana', it: 'banana', emoji: '🍌', color: '#ffe46b' },
  strawberries: { en: 'strawberries', it: 'fragole', emoji: '🍓', color: '#ff5b7a', plural: true, one: 'strawberry' },
  blueberries: { en: 'blueberries', it: 'mirtilli', emoji: '🫐', color: '#6c5ce7', plural: true, one: 'blueberry' },
  kiwi: { en: 'kiwi', it: 'kiwi', emoji: '🥝', color: '#9bd35a' },
  orange: { en: 'orange', it: 'arancia', emoji: '🍊', color: '#ffa53a' },
  mango: { en: 'mango', it: 'mango', emoji: '🥭', color: '#ffbe3b' },
  peach: { en: 'peach', it: 'pesca', emoji: '🍑', color: '#ffb38a' },
  apple: { en: 'apple', it: 'mela', emoji: '🍎', color: '#c9e66b' },
  cherries: { en: 'cherries', it: 'ciliegie', emoji: '🍒', color: '#c0392b', plural: true },
  honey: { en: 'honey', it: 'miele', emoji: '🍯', color: '#f5b400' },
  chocolate: { en: 'chocolate', it: 'cioccolato', emoji: '🍫', color: '#6b3f24' },
  candles: { en: 'candles', it: 'candeline', emoji: '🕯️', color: '#fff', plural: true },
  sweets: { en: 'sweets', it: 'caramelle', emoji: '🍬', color: '#ff8fb1', plural: true },
  stars: { en: 'stars', it: 'stelline', emoji: '⭐', color: '#feca57', plural: true },
  hearts: { en: 'hearts', it: 'cuoricini', emoji: '💖', color: '#ff6b9d', plural: true },
  mint: { en: 'mint', it: 'menta', emoji: '🌱', color: '#3fae49' },
  umbrella: { en: 'umbrella', it: 'ombrellino', emoji: '⛱️', color: '#ff6b6b' },
  cream: { en: 'cream', it: 'panna', emoji: '🍦', color: '#fffaf0' },
}

// Ingredients only shown as wrong choices when shopping, so the pantry is never too easy.
export const DISTRACTORS = ['carrot', 'potato', 'onion', 'apple', 'banana', 'cheese', 'eggs', 'milk', 'tomato', 'bread', 'butter', 'orange', 'honey', 'corn']

export type ToolId = 'knife' | 'spoon' | 'whisk' | 'rollingpin' | 'spatula' | 'fork'
export const TOOLS: Record<ToolId, { en: string; it: string }> = {
  knife: { en: 'knife', it: 'coltello' },
  spoon: { en: 'spoon', it: 'cucchiaio' },
  whisk: { en: 'whisk', it: 'frusta' },
  rollingpin: { en: 'rolling pin', it: 'mattarello' },
  spatula: { en: 'spatula', it: 'spatola' },
  fork: { en: 'fork', it: 'forchetta' },
}
export const TOOL_IDS = Object.keys(TOOLS) as ToolId[]

export type DeviceId = 'oven' | 'cooker' | 'toaster' | 'microwave' | 'blender'
export const DEVICES: Record<DeviceId, { en: string; it: string }> = {
  oven: { en: 'oven', it: 'forno' },
  cooker: { en: 'cooker', it: 'fornelli' },
  toaster: { en: 'toaster', it: 'tostapane' },
  microwave: { en: 'microwave', it: 'microonde' },
  blender: { en: 'blender', it: 'frullatore' },
}
export const DEVICE_IDS = Object.keys(DEVICES) as DeviceId[]

// Icing colours for the cake.
export const COLORS: Record<string, { en: string; it: string; color: string }> = {
  chocolate: { en: 'chocolate', it: 'cioccolato', color: '#6b3f24' },
  strawberry: { en: 'strawberry', it: 'fragola', color: '#ff8fb1' },
  vanilla: { en: 'vanilla', it: 'vaniglia', color: '#fff4dc' },
  lemon: { en: 'lemon', it: 'limone', color: '#ffe45c' },
  mint: { en: 'mint', it: 'menta', color: '#9be7c4' },
  blueberry: { en: 'blueberry', it: 'mirtillo', color: '#a99bff' },
}

// What the work area shows: a bowl, the pizza, the cake tin…
export type Scene = 'bowl' | 'pizza' | 'tin' | 'cake' | 'blender' | 'glass' | 'pan' | 'plate' | 'sandwich'

export type RecipeId = 'pizza' | 'cake' | 'smoothie' | 'pancakes' | 'sandwich'

// The dish being made. Only the fields the finished dish needs are kept in the fridge.
export type Dish = {
  recipe: RecipeId
  scene: Scene
  inside: string[] // ingredients in the bowl, blender or pan, not mixed yet
  mix?: string // colour once mixed
  layers: string[] // sauce and cheese on the pizza, fillings in the sandwich, batter in the pan
  toppings: [string, number, number][] // [ingredient, x, y] on the dish, in a 200×200 box
  color?: string // icing colour
  fruits: string[] // fruit chosen for the smoothie
  p: Record<string, number> // how far rubbing steps have got, 0–1: roll, icing, butter, mix
  cooked?: boolean
  cut?: boolean
  top?: boolean // the top slice of the sandwich
  counter: string[] // ingredients waiting on the kitchen counter
  chopped: string[] // ingredients already cut
}

export type Text = { en: string; it: string }

export type Step =
  // Find each ingredient in the pantry by its English name.
  | { kind: 'shop'; items: string[] }
  // Drag each ingredient from the counter onto the dish, in the order asked.
  | { kind: 'drag'; items: string[] | 'counter'; enter?: (d: Dish) => Dish }
  // Pick the named tool, then use it: rub (mix, roll, spread), chop (tap to cut), flip.
  | { kind: 'tool'; tool: ToolId; act: 'rub' | 'chop' | 'flip'; key?: string; say: Text; enter?: (d: Dish) => Dish; after?: (d: Dish) => Dish }
  // Drag the dish (or the pan) into the named device, switch it on and wait.
  | { kind: 'device'; device: DeviceId; put: boolean; what: Text; enter?: (d: Dish) => Dish; after: (d: Dish) => Dish; ready: Text }
  // Pour or move the mix from one container into another.
  | { kind: 'move'; from: Scene; to: Scene; say: Text; after: (d: Dish) => Dish }
  // The child's own choices: drag toppings anywhere, add layers, pick a colour or some fruit.
  | { kind: 'custom'; mode: 'place' | 'layer' | 'color' | 'pick'; options: string[]; max: number; say: Text }
  | { kind: 'fridge' }

export type Recipe = { id: RecipeId; en: string; it: string; emoji: string; color: string; start: Scene; steps: Step[] }

const BATTER = '#f7d775'

export const RECIPES: Recipe[] = [
  {
    id: 'pizza',
    en: 'pizza',
    it: 'pizza',
    emoji: '🍕',
    color: '#ee5253',
    start: 'bowl',
    steps: [
      { kind: 'shop', items: ['flour', 'water', 'tomato', 'cheese'] },
      { kind: 'drag', items: ['flour', 'water'] },
      { kind: 'tool', tool: 'spoon', act: 'rub', key: 'mix', say: { en: 'Mix the dough with the spoon!', it: "Mescola l'impasto con il cucchiaio!" }, enter: (d) => ({ ...d, mix: '#f1d9a6' }), after: (d) => ({ ...d, inside: [] }) },
      { kind: 'tool', tool: 'rollingpin', act: 'rub', key: 'roll', say: { en: 'Roll the dough with the rolling pin!', it: "Stendi l'impasto con il mattarello!" }, enter: (d) => ({ ...d, scene: 'pizza' }) },
      { kind: 'drag', items: ['tomato', 'cheese'] },
      { kind: 'custom', mode: 'place', options: ['mushrooms', 'olives', 'pepper', 'pineapple', 'ham', 'corn', 'basil'], max: 10, say: { en: 'Choose your toppings! Put them on the pizza.', it: 'Scegli cosa mettere sulla pizza e trascinalo sopra!' } },
      { kind: 'device', device: 'oven', put: true, what: { en: 'pizza', it: 'la pizza' }, after: (d) => ({ ...d, cooked: true }), ready: { en: 'Ding! The pizza is ready!', it: 'La pizza è pronta!' } },
      { kind: 'fridge' },
    ],
  },
  {
    id: 'cake',
    en: 'cake',
    it: 'torta',
    emoji: '🎂',
    color: '#ff6b9d',
    start: 'bowl',
    steps: [
      { kind: 'shop', items: ['eggs', 'flour', 'sugar', 'milk'] },
      { kind: 'drag', items: ['eggs', 'flour', 'sugar', 'milk'] },
      { kind: 'tool', tool: 'whisk', act: 'rub', key: 'mix', say: { en: 'Mix it with the whisk!', it: 'Sbatti tutto con la frusta!' }, enter: (d) => ({ ...d, mix: BATTER }), after: (d) => ({ ...d, inside: [] }) },
      { kind: 'move', from: 'bowl', to: 'tin', say: { en: 'Pour the mix into the cake tin!', it: "Versa l'impasto nella tortiera!" }, after: (d) => ({ ...d, scene: 'tin' }) },
      { kind: 'device', device: 'oven', put: true, what: { en: 'cake', it: 'la torta' }, after: (d) => ({ ...d, scene: 'cake', cooked: true }), ready: { en: 'Ding! The cake is ready!', it: 'La torta è pronta!' } },
      { kind: 'custom', mode: 'color', options: Object.keys(COLORS), max: 1, say: { en: 'What colour is your icing?', it: 'Di che colore vuoi la glassa?' } },
      { kind: 'tool', tool: 'spatula', act: 'rub', key: 'icing', say: { en: 'Spread the icing with the spatula!', it: 'Spalma la glassa con la spatola!' } },
      { kind: 'custom', mode: 'place', options: ['strawberries', 'cherries', 'blueberries', 'candles', 'chocolate', 'sweets', 'stars', 'hearts'], max: 10, say: { en: 'Decorate your cake!', it: 'Decora la torta: trascina le decorazioni sopra!' } },
      { kind: 'fridge' },
    ],
  },
  {
    id: 'smoothie',
    en: 'smoothie',
    it: 'frullato',
    emoji: '🥤',
    color: '#a55eea',
    start: 'blender',
    steps: [
      { kind: 'custom', mode: 'pick', options: ['banana', 'strawberries', 'blueberries', 'kiwi', 'orange', 'mango', 'peach', 'apple'], max: 3, say: { en: 'Choose your fruit! You can choose three.', it: 'Scegli la frutta: fino a tre!' } },
      { kind: 'shop', items: ['milk', 'ice'] },
      { kind: 'tool', tool: 'knife', act: 'chop', say: { en: 'Cut the fruit with the knife!', it: 'Taglia la frutta con il coltello!' } },
      { kind: 'drag', items: 'counter' },
      { kind: 'device', device: 'blender', put: false, what: { en: 'smoothie', it: 'il frullato' }, after: (d) => ({ ...d, inside: [], mix: fruitColor(d.fruits) }), ready: { en: 'Wow! The smoothie is ready!', it: 'Il frullato è pronto!' } },
      { kind: 'move', from: 'blender', to: 'glass', say: { en: 'Pour the smoothie into the glass!', it: 'Versa il frullato nel bicchiere!' }, after: (d) => ({ ...d, scene: 'glass' }) },
      { kind: 'custom', mode: 'place', options: ['strawberries', 'cherries', 'orange', 'blueberries', 'mint', 'umbrella', 'cream'], max: 8, say: { en: 'Decorate your smoothie!', it: 'Decora il frullato!' } },
      { kind: 'fridge' },
    ],
  },
  {
    id: 'pancakes',
    en: 'pancakes',
    it: 'pancake',
    emoji: '🥞',
    color: '#e1a325',
    start: 'bowl',
    steps: [
      { kind: 'shop', items: ['eggs', 'flour', 'milk'] },
      { kind: 'drag', items: ['eggs', 'flour', 'milk'] },
      { kind: 'tool', tool: 'whisk', act: 'rub', key: 'mix', say: { en: 'Mix it with the whisk!', it: 'Sbatti tutto con la frusta!' }, enter: (d) => ({ ...d, mix: BATTER }), after: (d) => ({ ...d, inside: [] }) },
      { kind: 'device', device: 'cooker', put: true, what: { en: 'pan', it: 'la padella' }, enter: (d) => ({ ...d, scene: 'pan' }), after: (d) => d, ready: { en: 'The pan is hot!', it: 'La padella è calda!' } },
      { kind: 'move', from: 'bowl', to: 'pan', say: { en: 'Pour the mix into the pan!', it: "Versa l'impasto nella padella!" }, after: (d) => ({ ...d, layers: ['batter'] }) },
      { kind: 'tool', tool: 'spatula', act: 'flip', say: { en: 'Flip the pancake with the spatula!', it: 'Gira il pancake con la spatola!' }, after: (d) => ({ ...d, cooked: true }) },
      { kind: 'move', from: 'pan', to: 'plate', say: { en: 'Put the pancakes on the plate!', it: 'Metti i pancake nel piatto!' }, after: (d) => ({ ...d, scene: 'plate', layers: [] }) },
      { kind: 'custom', mode: 'place', options: ['honey', 'strawberries', 'blueberries', 'banana', 'chocolate', 'cream', 'cherries'], max: 10, say: { en: 'What do you want on your pancakes?', it: 'Cosa vuoi sui pancake? Trascinalo sopra!' } },
      { kind: 'fridge' },
    ],
  },
  {
    id: 'sandwich',
    en: 'sandwich',
    it: 'panino',
    emoji: '🥪',
    color: '#10ac84',
    start: 'sandwich',
    steps: [
      { kind: 'shop', items: ['bread', 'butter', 'cheese'] },
      { kind: 'device', device: 'toaster', put: true, what: { en: 'bread', it: 'il pane' }, enter: (d) => ({ ...d, counter: d.counter.filter((c) => c !== 'bread') }), after: (d) => ({ ...d, cooked: true }), ready: { en: 'Pop! The toast is ready!', it: 'Il pane è tostato!' } },
      { kind: 'tool', tool: 'knife', act: 'rub', key: 'butter', say: { en: 'Spread the butter with the knife!', it: 'Spalma il burro con il coltello!' }, after: (d) => ({ ...d, counter: d.counter.filter((c) => c !== 'butter') }) },
      { kind: 'drag', items: ['cheese'] },
      { kind: 'custom', mode: 'layer', options: ['ham', 'tomato', 'lettuce', 'cucumber', 'egg', 'cheese'], max: 4, say: { en: 'What else goes in your sandwich?', it: "Cos'altro metti nel panino? Trascinalo sopra!" } },
      { kind: 'drag', items: ['bread'], enter: (d) => ({ ...d, counter: ['bread'] }) },
      { kind: 'tool', tool: 'knife', act: 'chop', say: { en: 'Cut the sandwich with the knife!', it: 'Taglia il panino con il coltello!' } },
      { kind: 'fridge' },
    ],
  },
]

export const recipeById = (id: string) => RECIPES.find((r) => r.id === id)

export const newDish = (r: Recipe): Dish => ({ recipe: r.id, scene: r.start, inside: [], layers: [], toppings: [], fruits: [], p: {}, counter: [], chopped: [] })

// The smoothie takes the colour of its fruit, made paler by the milk.
export function fruitColor(fruits: string[]) {
  const list = fruits.length ? fruits : ['banana']
  const rgb = [0, 0, 0]
  for (const f of list) {
    const hex = INGREDIENTS[f].color
    for (let i = 0; i < 3; i++) rgb[i] += parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16)
  }
  return `#${rgb.map((v) => Math.round((v / list.length) * 0.75 + 255 * 0.25).toString(16).padStart(2, '0')).join('')}`
}

export const the = (id: string) => `the ${INGREDIENTS[id].en}`

const list = (words: string[]) => (words.length < 2 ? words.join('') : `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`)

// The dish's name in English, spoken when the child taps it in the fridge.
export function describe(d: Pick<Dish, 'recipe' | 'toppings' | 'layers' | 'color' | 'fruits'>): Text {
  const things = [...new Set([...d.layers, ...d.toppings.map((t) => t[0])])].filter((x) => x !== 'batter' && (d.recipe !== 'pizza' || (x !== 'tomato' && x !== 'cheese')))
  const en = list(things.map((t) => INGREDIENTS[t].en))
  const it = list(things.map((t) => INGREDIENTS[t].it)).replace(/ and /, ' e ')
  const withEn = en ? ` with ${en}` : ''
  const withIt = it ? ` con ${it}` : ''
  switch (d.recipe) {
    case 'pizza':
      return { en: `A pizza${withEn}`, it: `Una pizza${withIt}` }
    case 'cake': {
      const c = COLORS[d.color ?? 'vanilla']
      return { en: `A ${c.en} cake${withEn}`, it: `Una torta al gusto ${c.it}${withIt}` }
    }
    case 'smoothie': {
      const fruit = list(d.fruits.map((f) => INGREDIENTS[f].one ?? INGREDIENTS[f].en))
      return { en: `${/^[aeiou]/.test(fruit) ? 'An' : 'A'} ${fruit} smoothie${withEn}`, it: `Un frullato di ${list(d.fruits.map((f) => INGREDIENTS[f].it)).replace(/ and /, ' e ')}${withIt}` }
    }
    case 'pancakes':
      return { en: `Pancakes${withEn}`, it: `Pancake${withIt}` }
    case 'sandwich':
      return { en: `A sandwich${withEn}`, it: `Un panino${withIt}` }
  }
}
