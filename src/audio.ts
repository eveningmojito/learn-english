// Speech uses the browser's built-in voices, so no audio files are needed.
let englishVoice: SpeechSynthesisVoice | null = null

function pickVoice() {
  const voices = window.speechSynthesis?.getVoices() ?? []
  englishVoice =
    voices.find((v) => v.lang === 'en-GB') ??
    voices.find((v) => v.lang === 'en-US') ??
    voices.find((v) => v.lang.startsWith('en')) ??
    null
}

if ('speechSynthesis' in window) {
  pickVoice()
  window.speechSynthesis.onvoiceschanged = pickVoice
}

export function speak(text: string, lang: 'en' | 'it' = 'en', pitch = 1.1) {
  if (!('speechSynthesis' in window)) return
  const synth = window.speechSynthesis
  const u = new SpeechSynthesisUtterance(text)
  if (lang === 'en') {
    u.lang = englishVoice?.lang ?? 'en-GB'
    if (englishVoice) u.voice = englishVoice
  } else {
    u.lang = 'it-IT'
  }
  u.rate = 0.8
  u.pitch = pitch
  // Chrome sometimes drops an utterance queued right after cancel(), and can get stuck paused,
  // so give it a moment to settle before speaking.
  const busy = synth.speaking || synth.pending
  synth.cancel()
  synth.resume()
  if (busy) setTimeout(() => synth.speak(u), 80)
  else synth.speak(u)
}

let ctx: AudioContext | null = null

function tone(freq: number, start: number, duration: number, type: OscillatorType = 'sine', volume = 0.25) {
  ctx ??= new AudioContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  const t = ctx.currentTime + start
  gain.gain.setValueAtTime(volume, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration)
  osc.connect(gain).connect(ctx.destination)
  osc.start(t)
  osc.stop(t + duration)
}

export function playCorrect() {
  tone(523, 0, 0.15)
  tone(659, 0.1, 0.15)
  tone(784, 0.2, 0.3)
}

export function playWrong() {
  tone(220, 0, 0.25, 'triangle')
  tone(180, 0.15, 0.3, 'triangle')
}

export function playFanfare() {
  ;[523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.25))
}

// A soft click for each slice of the wheel passing the pointer, with a tiny buzz on phones
// that support vibration (Android; iPhones ignore it).
export function playTick() {
  tone(1400, 0, 0.035, 'triangle', 0.06)
  navigator.vibrate?.(6)
}

export function playWheelStop() {
  tone(880, 0, 0.12, 'sine', 0.15)
  tone(1320, 0.08, 0.2, 'sine', 0.12)
  navigator.vibrate?.(40)
}

// Kitchen sounds for the cooking game.
export function playChop() {
  tone(260, 0, 0.06, 'square', 0.12)
  tone(130, 0.02, 0.08, 'triangle', 0.15)
}

export function playPop() {
  tone(500, 0, 0.08, 'sine', 0.2)
  tone(900, 0.05, 0.1, 'sine', 0.15)
}

export function playSwish() {
  tone(700 + Math.random() * 300, 0, 0.05, 'triangle', 0.04)
}

export function playBubble() {
  tone(300 + Math.random() * 200, 0, 0.09, 'sine', 0.08)
}

export function playDing() {
  tone(1568, 0, 0.6, 'sine', 0.2)
  tone(2093, 0.02, 0.8, 'sine', 0.12)
}

// Runs fn once the voice is free, so a new sentence never cuts off the previous one.
export function whenQuiet(fn: () => void, timers: number[], wait = 0) {
  const started = Date.now()
  const tick = () => {
    const talking = window.speechSynthesis?.speaking || window.speechSynthesis?.pending
    if (talking && Date.now() - started < 8000) timers.push(window.setTimeout(tick, 150))
    else fn()
  }
  timers.push(window.setTimeout(tick, wait))
}
