let ctx: AudioContext | null = null;

function ac() {
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new C();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function unlockAudio() {
  try {
    ac();
  } catch {
    /* autoplay */
  }
}

export type Blip = "step" | "ok" | "start" | "swipe" | "skip";

export function blip(kind: Blip) {
  try {
    const a = ac();
    const now = a.currentTime;
    if (kind === "ok") {
      tone(a, now, 523, 0.09, 0.05);
      tone(a, now + 0.07, 784, 0.12, 0.045);
      return;
    }
    if (kind === "start") {
      tone(a, now, 196, 0.1, 0.04);
      tone(a, now + 0.09, 262, 0.1, 0.04);
      tone(a, now + 0.18, 330, 0.16, 0.05);
      return;
    }
    const base = kind === "step" ? 290 : kind === "swipe" ? 420 : 180;
    const jitter = kind === "step" ? (Math.random() - 0.5) * 50 : 0;
    tone(a, now, base + jitter, kind === "skip" ? 0.08 : 0.1, 0.035);
  } catch {
    /* muted */
  }
}

function tone(a: AudioContext, at: number, freq: number, dur: number, gain: number) {
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = "square";
  o.frequency.value = freq;
  g.gain.setValueAtTime(gain, at);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g);
  g.connect(a.destination);
  o.start(at);
  o.stop(at + dur + 0.02);
}
