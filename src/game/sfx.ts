let ctx: AudioContext | null = null;
let hooked = false;

function getCtx() {
  if (!ctx) {
    const C =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new C();
  }
  return ctx;
}

export function unlockAudio() {
  try {
    const a = getCtx();
    if (a.state === "suspended") void a.resume();
  } catch {
    /* autoplay policy */
  }
}

export function installAudioUnlock() {
  if (hooked || typeof window === "undefined") return;
  hooked = true;
  const go = () => unlockAudio();
  window.addEventListener("pointerdown", go, { capture: true });
  window.addEventListener("keydown", go, { capture: true });
  window.addEventListener("touchstart", go, { capture: true });
}

export type Blip = "step" | "ok" | "start" | "swipe" | "skip";

export function blip(kind: Blip) {
  try {
    const a = getCtx();
    const play = () => toneKind(a, kind);
    if (a.state === "running") {
      play();
      return;
    }
    void a.resume().then(() => {
      if (a.state === "running") play();
    });
  } catch {
    /* muted */
  }
}

function toneKind(a: AudioContext, kind: Blip) {
  const now = a.currentTime;
  if (kind === "ok") {
    tone(a, now, 523, 0.12, 0.09);
    tone(a, now + 0.08, 784, 0.16, 0.08);
    return;
  }
  if (kind === "start") {
    tone(a, now, 196, 0.12, 0.07);
    tone(a, now + 0.1, 262, 0.12, 0.07);
    tone(a, now + 0.2, 330, 0.2, 0.09);
    return;
  }
  const base = kind === "step" ? 290 : kind === "swipe" ? 420 : 180;
  const jitter = kind === "step" ? (Math.random() - 0.5) * 50 : 0;
  tone(a, now, base + jitter, kind === "skip" ? 0.1 : 0.12, 0.07);
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
  o.onended = () => {
    o.disconnect();
    g.disconnect();
  };
}
