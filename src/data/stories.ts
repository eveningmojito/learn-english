import type { SceneryId } from '../components/Scenery'

// Interactive stories for level 5-6: each scene has a picture, a few lines of narration or
// dialogue, and usually a small exercise the child must solve to go on.

export type Speaker = { name: string; emoji: string; pitch: number }

export type Line = { who?: string; en: string; it: string }

export type Task =
  // Pick the right reply or answer; in the question, ___ marks a gap to fill.
  | { kind: 'choose'; hint: string; question?: string; options: string[]; answer: string }
  // Put the words of a sentence in order.
  | { kind: 'order'; en: string; it: string; emoji: string }

export type Actor = { emoji: string; x: number; y?: number; size?: number; flip?: boolean; anim?: 'bob' | 'sleep' | 'fly' }

export type Scene = { bg: SceneryId; cast: Actor[]; lines: Line[]; task?: Task }

export type Story = {
  id: string
  title: string
  emoji: string
  color: string
  speakers: Record<string, Speaker>
  scenes: Scene[]
}

const REPLY = 'Cosa rispondi?'
const GAP = 'Completa la frase!'

const dragon: Story = {
  id: 'dragon',
  title: 'Il drago e la corona',
  emoji: '🐉',
  color: '#e17055',
  speakers: {
    farmer: { name: 'Farmer', emoji: '🧑‍🌾', pitch: 0.9 },
    owl: { name: 'Owl', emoji: '🦉', pitch: 0.8 },
    troll: { name: 'Troll', emoji: '🧌', pitch: 0.5 },
    dragon: { name: 'Dragon', emoji: '🐉', pitch: 0.6 },
    king: { name: 'King', emoji: '🤴', pitch: 0.9 },
  },
  scenes: [
    {
      bg: 'village',
      cast: [{ emoji: '🧑‍🌾', x: 30, anim: 'bob' }, { emoji: '🧒', x: 70, flip: true }],
      lines: [
        { en: 'Once upon a time, there was a small village near a big mountain.', it: "C'era una volta un piccolo villaggio vicino a una grande montagna." },
        { who: 'farmer', en: "Help! Help! The dragon took the king's golden crown!", it: 'Aiuto! Aiuto! Il drago ha preso la corona d’oro del re!' },
      ],
      task: { kind: 'choose', hint: REPLY, options: ["Don't worry, I can help you!", 'I like pizza.', 'Good night!'], answer: "Don't worry, I can help you!" },
    },
    {
      bg: 'forest',
      cast: [{ emoji: '🦉', x: 72, y: 38, anim: 'bob' }, { emoji: '🧒', x: 28 }],
      lines: [
        { en: 'You walk into the dark forest. An old owl is sitting in a tree.', it: 'Entri nella foresta buia. Un vecchio gufo è seduto su un albero.' },
        { who: 'owl', en: 'Hello, little hero. Where are you going?', it: 'Ciao, piccolo eroe. Dove stai andando?' },
      ],
      task: { kind: 'choose', hint: REPLY, options: ['I am going to the mountain.', 'I am ten years old.', 'It is sunny today.'], answer: 'I am going to the mountain.' },
    },
    {
      bg: 'forest',
      cast: [{ emoji: '🦉', x: 72, y: 38, anim: 'bob' }, { emoji: '🧒', x: 28 }],
      lines: [
        { who: 'owl', en: 'The dragon lives in a cave. The cave is behind the waterfall.', it: 'Il drago vive in una grotta. La grotta è dietro la cascata.' },
        { who: 'owl', en: 'Be careful, and be kind!', it: 'Stai attento, e sii gentile!' },
      ],
      task: { kind: 'choose', hint: 'Rispondi alla domanda!', question: 'Where is the cave?', options: ['behind the waterfall', 'under the bridge', 'in the village'], answer: 'behind the waterfall' },
    },
    {
      bg: 'bridge',
      cast: [{ emoji: '🧌', x: 55, y: 30, size: 1.3, anim: 'bob' }, { emoji: '🧒', x: 15 }],
      lines: [
        { en: 'You arrive at a river. A big troll is standing on the bridge.', it: 'Arrivi a un fiume. Un grosso troll è in piedi sul ponte.' },
        { who: 'troll', en: 'To cross my bridge, answer my riddle!', it: 'Per attraversare il mio ponte, risolvi il mio indovinello!' },
        { who: 'troll', en: 'I am hot and yellow. I shine in the sky every day. What am I?', it: 'Sono caldo e giallo. Splendo nel cielo ogni giorno. Cosa sono?' },
      ],
      task: { kind: 'choose', hint: "Risolvi l'indovinello!", options: ['the sun', 'the moon', 'a cloud'], answer: 'the sun' },
    },
    {
      bg: 'cave',
      cast: [{ emoji: '🐉', x: 58, size: 1.6, flip: true, anim: 'sleep' }, { emoji: '👑', x: 74, size: 0.6 }, { emoji: '🧒', x: 18 }],
      lines: [
        { en: 'Behind the waterfall there is a big cave.', it: "Dietro la cascata c'è una grande grotta." },
        { en: 'The dragon is sleeping next to the golden crown. Shhh!', it: 'Il drago dorme vicino alla corona d’oro. Shhh!' },
      ],
      task: { kind: 'choose', hint: GAP, question: 'The dragon is ___.', options: ['sleeping', 'eating', 'flying'], answer: 'sleeping' },
    },
    {
      bg: 'cave',
      cast: [{ emoji: '🐉', x: 58, size: 1.6, flip: true, anim: 'bob' }, { emoji: '👑', x: 74, size: 0.6 }, { emoji: '🧒', x: 18 }],
      lines: [
        { en: 'Suddenly the dragon opens its big eyes.', it: 'All’improvviso il drago apre i suoi grandi occhi.' },
        { who: 'dragon', en: 'Who are you? Why are you in my cave?', it: 'Chi sei? Perché sei nella mia grotta?' },
      ],
      task: { kind: 'order', en: "I want the king's crown", it: 'Voglio la corona del re', emoji: '👑' },
    },
    {
      bg: 'cave',
      cast: [{ emoji: '🐉', x: 58, size: 1.6, flip: true, anim: 'bob' }, { emoji: '👑', x: 74, size: 0.6 }, { emoji: '🧒', x: 18 }],
      lines: [
        { who: 'dragon', en: 'I took the crown because I am sad.', it: 'Ho preso la corona perché sono triste.' },
        { who: 'dragon', en: 'Nobody wants to play with me.', it: 'Nessuno vuole giocare con me.' },
      ],
      task: { kind: 'choose', hint: REPLY, options: ['Come to the village and play with us!', 'Go away, dragon!', 'I am hungry.'], answer: 'Come to the village and play with us!' },
    },
    {
      bg: 'castle',
      cast: [{ emoji: '🤴', x: 30, anim: 'bob' }, { emoji: '🐉', x: 70, y: 22, size: 1.3, flip: true, anim: 'fly' }, { emoji: '🧒', x: 50 }],
      lines: [
        { en: 'The dragon flies to the castle and gives the crown back to the king.', it: 'Il drago vola al castello e restituisce la corona al re.' },
        { who: 'king', en: 'Thank you, brave hero! Now the dragon is our friend.', it: 'Grazie, coraggioso eroe! Ora il drago è nostro amico.' },
      ],
      task: { kind: 'order', en: 'The dragon is my friend', it: 'Il drago è mio amico', emoji: '🐉' },
    },
  ],
}

const magic: Story = {
  id: 'magic',
  title: 'La scuola di magia',
  emoji: '🪄',
  color: '#6c5ce7',
  speakers: {
    luna: { name: 'Professor Luna', emoji: '🧙‍♀️', pitch: 1.0 },
    cat: { name: 'Pepper', emoji: '🐈‍⬛', pitch: 1.7 },
  },
  scenes: [
    {
      bg: 'school',
      cast: [{ emoji: '🧙‍♀️', x: 30, anim: 'bob' }, { emoji: '🧒', x: 70, flip: true }],
      lines: [
        { en: 'Today is your first day at the Magic School.', it: 'Oggi è il tuo primo giorno alla Scuola di Magia.' },
        { who: 'luna', en: 'Welcome! I am Professor Luna. What is your name?', it: 'Benvenuto! Sono la professoressa Luna. Come ti chiami?' },
      ],
      task: { kind: 'choose', hint: REPLY, options: ['My name is Sam.', 'I am fine, thank you.', 'It is Monday.'], answer: 'My name is Sam.' },
    },
    {
      bg: 'school',
      cast: [{ emoji: '🧙‍♀️', x: 30, anim: 'bob' }, { emoji: '🪄', x: 50, y: 40, size: 0.7, anim: 'fly' }, { emoji: '🐈‍⬛', x: 50, size: 0.8 }, { emoji: '🧒', x: 72, flip: true }],
      lines: [
        { who: 'luna', en: 'Nice to meet you, Sam! This is your magic wand.', it: 'Piacere di conoscerti, Sam! Questa è la tua bacchetta magica.' },
        { who: 'luna', en: 'And this is Pepper, the school cat. She is black and very funny.', it: 'E questa è Pepper, la gatta della scuola. È nera e molto buffa.' },
      ],
      task: { kind: 'choose', hint: 'Rispondi alla domanda!', question: 'What colour is Pepper?', options: ['black', 'white', 'orange'], answer: 'black' },
    },
    {
      bg: 'lab',
      cast: [{ emoji: '🧙‍♀️', x: 22, anim: 'bob' }, { emoji: '🐈‍⬛', x: 92, size: 0.8 }, { emoji: '🧒', x: 76, flip: true }],
      lines: [
        { en: 'Now you are in the potion room. A big pot is on the fire.', it: 'Ora sei nella stanza delle pozioni. Un grande pentolone è sul fuoco.' },
        { who: 'luna', en: 'Let’s make a potion! Put in three green frogs, two red apples and one blue flower.', it: 'Facciamo una pozione! Metti tre rane verdi, due mele rosse e un fiore blu.' },
      ],
      task: { kind: 'choose', hint: 'Rispondi alla domanda!', question: 'How many frogs do you need?', options: ['three', 'two', 'one'], answer: 'three' },
    },
    {
      bg: 'lab',
      cast: [{ emoji: '🧙‍♀️', x: 22, anim: 'bob' }, { emoji: '🐈‍⬛', x: 92, size: 0.8 }, { emoji: '🧒', x: 76, flip: true }],
      lines: [
        { en: 'You put the frogs and the apples in the pot. Now you need the flower.', it: 'Metti le rane e le mele nel pentolone. Ora ti serve il fiore.' },
      ],
      task: { kind: 'choose', hint: GAP, question: 'The flower is ___.', options: ['blue', 'red', 'green'], answer: 'blue' },
    },
    {
      bg: 'lab',
      cast: [{ emoji: '🧙‍♀️', x: 22 }, { emoji: '🐈‍⬛', x: 62, y: 45, size: 0.9, anim: 'fly' }, { emoji: '🧒', x: 80, flip: true }],
      lines: [
        { en: 'Pop! Pepper jumps into the pot... and now she can fly!', it: 'Pop! Pepper salta nel pentolone... e ora sa volare!' },
        { who: 'cat', en: 'Meow! Look at me! I can fly!', it: 'Miao! Guardatemi! So volare!' },
      ],
      task: { kind: 'order', en: 'The cat can fly', it: 'Il gatto sa volare', emoji: '🐈‍⬛' },
    },
    {
      bg: 'sky',
      cast: [{ emoji: '🐈‍⬛', x: 75, y: 55, size: 0.8, anim: 'fly' }, { emoji: '🧹', x: 30, y: 30, size: 1.2, anim: 'fly' }, { emoji: '🧒', x: 32, y: 40, size: 0.8, anim: 'fly' }],
      lines: [
        { en: 'Pepper flies out of the window! You jump on a broom and follow her.', it: 'Pepper vola fuori dalla finestra! Salti su una scopa e la segui.' },
        { who: 'luna', en: 'Hold your broom with two hands!', it: 'Tieni la scopa con due mani!' },
      ],
      task: { kind: 'choose', hint: GAP, question: 'You fly on a ___.', options: ['broom', 'chair', 'horse'], answer: 'broom' },
    },
    {
      bg: 'tower',
      cast: [{ emoji: '🐈‍⬛', x: 72, y: 70, size: 0.7, anim: 'bob' }, { emoji: '🧹', x: 30, y: 35, size: 1.1, anim: 'fly' }, { emoji: '🧒', x: 32, y: 45, size: 0.75, anim: 'fly' }],
      lines: [
        { en: 'Pepper is on the top of the tower. She is scared.', it: 'Pepper è in cima alla torre. Ha paura.' },
        { who: 'cat', en: "Help me, please! I can't get down!", it: 'Aiutami, per favore! Non riesco a scendere!' },
      ],
      task: { kind: 'choose', hint: 'Quale incantesimo usi?', options: ['Abracadabra, come down!', 'Abracadabra, go up!', 'Abracadabra, disappear!'], answer: 'Abracadabra, come down!' },
    },
    {
      bg: 'school',
      cast: [{ emoji: '🧙‍♀️', x: 25, anim: 'bob' }, { emoji: '🐈‍⬛', x: 50, size: 0.8 }, { emoji: '🧒', x: 75, flip: true }],
      lines: [
        { en: 'Pepper comes down slowly and lands in your arms.', it: 'Pepper scende piano piano e atterra tra le tue braccia.' },
        { who: 'luna', en: 'Well done, Sam! You are a real wizard now!', it: 'Bravo, Sam! Ora sei un vero mago!' },
      ],
      task: { kind: 'order', en: 'I love the Magic School', it: 'Adoro la Scuola di Magia', emoji: '🏰' },
    },
  ],
}

export const stories: Story[] = [dragon, magic]
