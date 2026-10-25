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

export function speak(text: string, lang: 'en' | 'it' = 'en') {
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
  u.pitch = 1.1
  // Chrome sometimes drops an utterance queued right after cancel(), and can get stuck paused,
  // so give it a moment to settle before speaking.
  const busy = synth.speaking || synth.pending
  synth.cancel()
  synth.resume()
  if (busy) setTimeout(() => synth.speak(u), 80)
  else synth.speak(u)
}

let ctx: AudioContext | null = null

function tone(freq: number, start: number, duration: number, type: OscillatorType = 'sine') {
  ctx ??= new AudioContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  const t = ctx.currentTime + start
  gain.gain.setValueAtTime(0.25, t)
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
