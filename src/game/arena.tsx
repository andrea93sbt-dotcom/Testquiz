import { useEffect, useRef } from "react";
import type { Option } from "@/data/types";
import { blip, unlockAudio } from "@/game/sfx";

const IW = 320;
const IH = 360;
const DIRS = ["up", "down", "left", "right"] as const;
type Dir = (typeof DIRS)[number];

const POS: Record<Dir, Pt> = {
  up: { x: 160, y: 92 },
  down: { x: 160, y: 292 },
  left: { x: 52, y: 196 },
  right: { x: 268, y: 196 },
};
const HOME: Pt = { x: 160, y: 196 };
const FACE: Record<Dir, number> = { down: 0, left: 1, right: 2, up: 3 };
const MARQUEE = ["#f4c430", "#2ec4b6", "#e23d4a", "#c9a0ff"];
const ARROW: Record<Dir, string> = { up: "↑", down: "↓", left: "←", right: "→" };
const OPP: Record<Dir, Dir> = { up: "down", down: "up", left: "right", right: "left" };
const ARROW_CELL: Record<Dir, { c: number; r: number }> = {
  up: { c: 0, r: 0 },
  right: { c: 1, r: 0 },
  left: { c: 0, r: 1 },
  down: { c: 1, r: 1 },
};

type Pt = { x: number; y: number };
type Walk = { dir: Dir; t: number; from: Pt; to: Pt; back: boolean };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; color: string };

type Props = {
  question: string;
  hint?: string;
  options: Option[];
  progress?: string;
  demo?: boolean;
  onPick?: (optionId: string) => void;
  onSkip?: () => void;
};

type Sprites = {
  hero: HTMLImageElement;
  cinema: HTMLImageElement;
  tiles: HTMLImageElement;
  fx: HTMLImageElement;
  lantern: HTMLImageElement;
  arrows: HTMLImageElement;
  props: HTMLImageElement;
};

type Game = {
  opts: Option[];
  walk: Walk | null;
  face: Dir;
  time: number;
  burst: number;
  burstDir: Dir;
  keys: Set<string>;
  swipe: { x: number; y: number; cx: number; cy: number } | null;
  sprites: Sprites | null;
  sparks: Spark[];
  trauma: number;
  flash: number;
  pending: string | null;
  pendingIn: number;
  probe: boolean;
  demo: boolean;
  reduce: boolean;
  lock: boolean;
};

export function Arena({ question, hint, options, progress, demo, onPick, onSkip }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pickRef = useRef(onPick);
  const skipRef = useRef(onSkip);
  pickRef.current = onPick;
  skipRef.current = onSkip;

  const stateRef = useRef<Game>({
    opts: options.slice(0, 4),
    walk: null,
    face: "down",
    time: 0,
    burst: 0,
    burstDir: "down",
    keys: new Set(),
    swipe: null,
    sprites: null,
    sparks: [],
    trauma: 0,
    flash: 0,
    pending: null,
    pendingIn: 0,
    probe: false,
    demo: Boolean(demo),
    reduce: false,
    lock: false,
  });
  stateRef.current.opts = options.slice(0, 4);
  stateRef.current.demo = Boolean(demo);

  useEffect(() => {
    const s = stateRef.current;
    s.walk = null;
    s.face = "down";
    s.burst = 0;
    s.pending = null;
    s.trauma = 0;
    if (s.keys.size === 0) s.lock = false;
  }, [question]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const sprites = loadSprites();
    const s = stateRef.current;
    s.sprites = sprites;
    s.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    seedSparks(s);

    let raf = 0;
    let last = performance.now();
    let running = true;
    let demoAcc = 0;

    const loop = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      tick(s, dt, pickRef.current);
      if (s.demo && !s.walk && !s.pending) {
        demoAcc += dt;
        if (demoAcc > 1.8) {
          demoAcc = 0;
          const live = DIRS.filter((_, i) => s.opts[i]);
          const dir = live[Math.floor(Math.random() * live.length)];
          if (dir) tryWalk(s, dir, true);
        }
      }
      const { ox, oy, scale, dpr } = fit(wrap, canvas);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, wrap.clientWidth, wrap.clientHeight);
      const shake = s.reduce ? 0 : s.trauma * s.trauma;
      const sx = Math.round((Math.sin(s.time * 41) * 5 * shake) / scale);
      const sy = Math.round((Math.cos(s.time * 37) * 4 * shake) / scale);
      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, (ox + sx) * dpr, (oy + sy) * dpr);
      ctx.imageSmoothingEnabled = false;
      draw(ctx, s);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onKey = (e: KeyboardEvent) => {
      const dir = dirFromCode(e.code);
      if (!dir) return;
      if (e.repeat) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      s.probe = false;
      s.keys.add(e.code);
      if (s.lock) return;
      tryWalk(s, dir, false);
    };
    const onUp = (e: KeyboardEvent) => {
      s.keys.delete(e.code);
      if (s.keys.size === 0) s.lock = false;
    };
    const onBlur = () => {
      s.keys.clear();
      s.lock = false;
    };

    const startP = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("[data-dir]")) return;
      unlockAudio();
      try {
        wrap.setPointerCapture(e.pointerId);
      } catch {
        /* synthetic */
      }
      s.swipe = { x: e.clientX, y: e.clientY, cx: e.clientX, cy: e.clientY };
    };
    const moveP = (e: PointerEvent) => {
      if (!s.swipe) return;
      s.swipe.cx = e.clientX;
      s.swipe.cy = e.clientY;
    };
    const endP = (e: PointerEvent) => {
      const start = s.swipe;
      s.swipe = null;
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      s.probe = false;
      if (Math.hypot(dx, dy) < 32) {
        const dir = hitCinema(e, wrap);
        if (dir) tryWalk(s, dir, false);
        return;
      }
      blip("swipe");
      const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
      tryWalk(s, dir, false);
    };

    window.addEventListener("keydown", onKey, { passive: false });
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    wrap.addEventListener("pointerdown", startP);
    wrap.addEventListener("pointermove", moveP);
    wrap.addEventListener("pointerup", endP);
    wrap.addEventListener("pointercancel", () => {
      s.swipe = null;
    });

    window.__controlsTest = {
      getX: () => posOf(s).x,
      getY: () => posOf(s).y,
      getSpeed: () => (s.walk ? 1 : 0),
      getYaw: () => (s.face === "left" ? 0.4 : s.face === "right" ? -0.4 : 0),
      setKeys: (codes: string[]) => {
        s.probe = codes.length > 0;
        s.keys = new Set(codes);
        for (const c of codes) {
          const d = dirFromCode(c);
          if (d) tryWalk(s, d, true);
        }
      },
    };

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
      wrap.removeEventListener("pointerdown", startP);
      wrap.removeEventListener("pointermove", moveP);
      wrap.removeEventListener("pointerup", endP);
      delete window.__controlsTest;
    };
  }, []);

  const opts = options.slice(0, 4);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="rounded-md border border-border bg-surface px-3 py-3 sm:px-4">
        <p className="text-base leading-snug text-fg sm:text-lg">{question}</p>
        {hint ? <p className="mt-1.5 text-sm text-muted">{hint}</p> : null}
      </div>
      <div
        ref={wrapRef}
        className="relative min-h-[16rem] flex-1 touch-none overflow-hidden rounded-md border border-border bg-bg sm:min-h-[18rem]"
        style={{ imageRendering: "pixelated" }}
      >
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {DIRS.map((dir, i) => {
          const opt = opts[i];
          if (!opt) return null;
          return (
            <button
              key={opt.id}
              type="button"
              data-dir={dir}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => {
                unlockAudio();
                stateRef.current.probe = false;
                tryWalk(stateRef.current, dir, false);
              }}
              className="min-h-14 rounded-md border border-border bg-raised px-3 py-2.5 text-left text-sm leading-snug text-fg hover:border-accent"
              style={{ borderColor: MARQUEE[i] }}
            >
              <span className="mr-1.5 text-xs font-semibold" style={{ color: MARQUEE[i] }}>
                {ARROW[dir]}
              </span>
              {opt.label}
            </button>
          );
        })}
      </div>
      {demo ? (
        <p className="text-xs text-subtle">PC: frecce o WASD · Telefono: swipe verso una sala</p>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted">{progress}</p>
          <button
            type="button"
            onClick={() => {
              blip("skip");
              skipRef.current?.();
            }}
            className="min-h-11 px-3 text-sm text-subtle underline-offset-2 hover:text-fg hover:underline"
          >
            Salta
          </button>
        </div>
      )}
    </div>
  );
}

let SPRITE_CACHE: Sprites | null = null;

function loadSprites(): Sprites {
  if (SPRITE_CACHE) return SPRITE_CACHE;
  const make = (src: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    return img;
  };
  SPRITE_CACHE = {
    hero: make("/sprites/hero.png"),
    cinema: make("/sprites/cinema.png"),
    tiles: make("/sprites/tiles.png"),
    fx: make("/sprites/fx.png"),
    lantern: make("/sprites/lantern.png"),
    arrows: make("/sprites/arrows.png"),
    props: make("/sprites/props.png"),
  };
  return SPRITE_CACHE;
}

function fit(wrap: HTMLElement, canvas: HTMLCanvasElement) {
  const w = wrap.clientWidth || 320;
  const h = wrap.clientHeight || 360;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const scale = Math.max(1, Math.floor(Math.min(w / IW, h / IH)));
  const bw = Math.max(1, Math.floor(w * dpr));
  const bh = Math.max(1, Math.floor(h * dpr));
  if (canvas.width !== bw) canvas.width = bw;
  if (canvas.height !== bh) canvas.height = bh;
  const ox = Math.floor((w - IW * scale) / 2);
  const oy = Math.floor((h - IH * scale) / 2);
  return { ox, oy, scale, dpr };
}

function dirFromCode(code: string): Dir | null {
  if (code === "ArrowUp" || code === "KeyW") return "up";
  if (code === "ArrowDown" || code === "KeyS") return "down";
  if (code === "ArrowLeft" || code === "KeyA") return "left";
  if (code === "ArrowRight" || code === "KeyD") return "right";
  return null;
}

function tryWalk(s: Game, dir: Dir, probe: boolean) {
  if (s.walk || s.pending || (s.lock && !probe)) return;
  const idx = DIRS.indexOf(dir);
  if (idx < 0 || !s.opts[idx]) return;
  blip("step");
  s.face = dir;
  s.probe = probe || s.probe;
  s.walk = { dir, t: 0, from: { ...HOME }, to: { ...POS[dir] }, back: false };
  puff(s, HOME.x, HOME.y, MARQUEE[idx]);
}

function tick(s: Game, dt: number, onPick?: (id: string) => void) {
  s.time += dt;
  if (s.burst > 0) s.burst = Math.max(0, s.burst - dt);
  s.trauma = Math.max(0, s.trauma - dt * 2.4);
  s.flash = Math.max(0, s.flash - dt * 3.2);
  for (const sp of s.sparks) {
    sp.x += sp.vx * dt;
    sp.y += sp.vy * dt;
    sp.life -= dt;
    if (sp.life <= 0) respawnSpark(sp, s.time);
  }
  if (s.pending) {
    s.pendingIn -= dt;
    if (s.pendingIn <= 0) {
      const id = s.pending;
      s.pending = null;
      if (id) onPick?.(id);
    }
  }
  if (!s.walk) return;
  if (s.walk.t < 0.18 && Math.floor(s.time * 18) !== Math.floor((s.time - dt) * 18)) {
    puff(s, posOf(s).x, posOf(s).y + 6, "#f4ead5");
  }
  s.walk.t += dt / (s.walk.back ? 0.36 : 0.42);
  if (s.walk.t < 1) return;
  if (s.walk.back) {
    s.walk = null;
    s.face = "down";
    return;
  }
  const dir = s.walk.dir;
  const idx = DIRS.indexOf(dir);
  const opt = s.opts[idx];
  s.burst = 0.5;
  s.burstDir = dir;
  s.trauma = s.reduce ? 0 : 0.85;
  s.flash = s.reduce ? 0 : 0.28;
  s.walk = null;
  puff(s, POS[dir].x, POS[dir].y - 10, MARQUEE[idx]);
  if (s.demo || s.probe) {
    blip("swipe");
    s.face = OPP[dir];
    s.walk = { dir: OPP[dir], t: 0, from: { ...POS[dir] }, to: { ...HOME }, back: true };
    return;
  }
  s.face = "down";
  if (opt) {
    blip("ok");
    s.lock = true;
    s.pending = opt.id;
    s.pendingIn = 0.2;
  }
}

function posOf(s: Game): Pt {
  if (!s.walk) return HOME;
  const u = ease(Math.min(1, s.walk.t));
  return {
    x: s.walk.from.x + (s.walk.to.x - s.walk.from.x) * u,
    y: s.walk.from.y + (s.walk.to.y - s.walk.from.y) * u,
  };
}

function ease(t: number) {
  return 1 - (1 - t) ** 3;
}

function hitCinema(e: PointerEvent, wrap: HTMLElement): Dir | null {
  const rect = wrap.getBoundingClientRect();
  const scale = Math.max(1, Math.floor(Math.min(rect.width / IW, rect.height / IH)));
  const ox = (rect.width - IW * scale) / 2;
  const oy = (rect.height - IH * scale) / 2;
  const x = (e.clientX - rect.left - ox) / scale;
  const y = (e.clientY - rect.top - oy) / scale;
  let best: Dir | null = null;
  let bestD = 52;
  for (const d of DIRS) {
    const p = POS[d];
    const dist = Math.hypot(x - p.x, y - p.y);
    if (dist < bestD) {
      bestD = dist;
      best = d;
    }
  }
  return best;
}

function seedSparks(s: Game) {
  s.sparks = Array.from({ length: 14 }, () => {
    const sp: Spark = { x: 0, y: 0, vx: 0, vy: 0, life: 0, color: "#f4c430" };
    respawnSpark(sp, Math.random() * 10);
    return sp;
  });
}

function respawnSpark(sp: Spark, t: number) {
  sp.x = Math.random() * IW;
  sp.y = 20 + Math.random() * (IH - 40);
  sp.vx = (Math.random() - 0.5) * 12;
  sp.vy = -8 - Math.random() * 14;
  sp.life = 1.2 + Math.random() * 2.2;
  sp.color = MARQUEE[Math.floor((t * 3) % 4)];
}

function puff(s: Game, x: number, y: number, color: string) {
  for (let i = 0; i < 8; i++) {
    const dead = s.sparks.find((p) => p.life <= 0.2);
    const sp = dead ?? s.sparks[i % s.sparks.length];
    if (!sp) continue;
    sp.x = x + (Math.random() - 0.5) * 10;
    sp.y = y;
    sp.vx = (Math.random() - 0.5) * 40;
    sp.vy = -20 - Math.random() * 30;
    sp.life = 0.35 + Math.random() * 0.25;
    sp.color = color;
  }
}

function draw(ctx: CanvasRenderingContext2D, s: Game) {
  const t = s.time;
  ctx.fillStyle = "#140a22";
  ctx.fillRect(0, 0, IW, IH);
  const g = ctx.createRadialGradient(160, 200, 20, 160, 200, 180);
  g.addColorStop(0, "rgba(46,196,182,0.16)");
  g.addColorStop(1, "rgba(20,10,34,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, IW, IH);

  drawPlaza(ctx, s.sprites, t);
  drawPaths(ctx, s, t);

  const hero = posOf(s);
  const ents: { y: number; z: number; draw: () => void }[] = [];
  const lamps: Pt[] = [
    { x: 78, y: 128 },
    { x: 242, y: 128 },
    { x: 64, y: 268 },
    { x: 256, y: 268 },
  ];
  lamps.forEach((p, i) => {
    ents.push({
      y: p.y,
      z: 0,
      draw: () => {
        const frame = Math.floor(t * 6 + i) % 4;
        drawSheet(ctx, s.sprites?.lantern, 2, 2, frame % 2, Math.floor(frame / 2), p.x, p.y, 28, 40);
      },
    });
  });
  const props: { x: number; y: number; c: number; r: number }[] = [
    { x: 112, y: 236, c: 0, r: 0 },
    { x: 208, y: 236, c: 1, r: 0 },
    { x: 118, y: 150, c: 0, r: 1 },
    { x: 204, y: 150, c: 1, r: 1 },
  ];
  for (const p of props) {
    ents.push({
      y: p.y,
      z: 0,
      draw: () => drawSheet(ctx, s.sprites?.props, 2, 2, p.c, p.r, p.x, p.y, 32, 32),
    });
  }
  DIRS.forEach((dir, i) => {
    const opt = s.opts[i];
    if (!opt) return;
    const p = POS[dir];
    const bob = s.reduce ? 0 : Math.sin(t * 4 + i) * 2.4;
    ents.push({
      y: p.y,
      z: 1,
      draw: () => drawCinema(ctx, s.sprites, p.x, p.y + bob, i, t, s.walk?.dir === dir && !s.walk?.back),
    });
  });
  ents.push({
    y: hero.y,
    z: 2,
    draw: () =>
      drawHero(ctx, s.sprites, hero.x, hero.y, s.walk ? s.walk.dir : s.face, s.walk ? s.walk.t : t, Boolean(s.walk), t, s.reduce),
  });
  ents.sort((a, b) => a.y - b.y || a.z - b.z);
  for (const e of ents) e.draw();

  if (s.burst > 0) {
    const p = POS[s.burstDir];
    drawBurst(ctx, s.sprites, p.x, p.y - 20, 1 - s.burst / 0.5);
  }
  for (const sp of s.sparks) {
    if (sp.life <= 0) continue;
    ctx.globalAlpha = Math.min(1, sp.life);
    ctx.fillStyle = sp.color;
    ctx.fillRect(Math.floor(sp.x), Math.floor(sp.y), 2, 2);
  }
  ctx.globalAlpha = 1;

  if (s.swipe) {
    const rect = ctx.canvas.getBoundingClientRect();
    const scale = Math.max(1, Math.floor(Math.min(rect.width / IW, rect.height / IH)));
    const ox = (rect.width - IW * scale) / 2;
    const oy = (rect.height - IH * scale) / 2;
    const ax = (s.swipe.x - rect.left - ox) / scale;
    const ay = (s.swipe.y - rect.top - oy) / scale;
    const bx = (s.swipe.cx - rect.left - ox) / scale;
    const by = (s.swipe.cy - rect.top - oy) / scale;
    ctx.strokeStyle = "#f4c430";
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  if (s.flash > 0) {
    ctx.fillStyle = `rgba(244,196,48,${s.flash})`;
    ctx.fillRect(0, 0, IW, IH);
  }
}

function drawPlaza(ctx: CanvasRenderingContext2D, sprites: Sprites | null, t: number) {
  if (sprites?.tiles?.complete) {
    const tile = sprites.tiles;
    const cw = tile.width / 2;
    const ch = tile.height / 2;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isoX = 160 + (col - row) * 18;
        const isoY = 84 + (col + row) * 10;
        const pulse = (row + col + Math.floor(t * 3)) % 4;
        const sx = (pulse % 2) * cw;
        const sy = Math.floor(pulse / 2) * ch;
        const lift = Math.sin(t * 5 + row * 0.6 + col * 0.4) > 0.72 ? -1 : 0;
        ctx.drawImage(tile, sx, sy, cw, ch, isoX - 16, isoY + lift, 32, 18);
      }
    }
  }
}

function drawPaths(ctx: CanvasRenderingContext2D, s: Game, t: number) {
  for (let i = 0; i < 4; i++) {
    if (!s.opts[i]) continue;
    const dir = DIRS[i];
    const p = POS[dir];
    ctx.strokeStyle = MARQUEE[i];
    ctx.globalAlpha = 0.28 + 0.18 * Math.abs(Math.sin(t * 4 + i));
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(HOME.x, HOME.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ctx.globalAlpha = 1;
    const u = 0.45 + 0.12 * Math.sin(t * 3 + i);
    const ax = HOME.x + (p.x - HOME.x) * u;
    const ay = HOME.y + (p.y - HOME.y) * u;
    const cell = ARROW_CELL[dir];
    drawSheet(ctx, s.sprites?.arrows, 2, 2, cell.c, cell.r, ax, ay, 28, 28);
  }
}

function drawCinema(
  ctx: CanvasRenderingContext2D,
  sprites: Sprites | null,
  x: number,
  y: number,
  i: number,
  t: number,
  hot: boolean,
) {
  const color = MARQUEE[i];
  if (hot) {
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.ellipse(x, y + 8, 30, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (sprites?.cinema?.complete) {
    ctx.drawImage(sprites.cinema, x - 38, y - 54, 76, 76);
  } else {
    ctx.fillStyle = "#3d2462";
    ctx.fillRect(x - 28, y - 40, 56, 48);
  }
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.55 + 0.45 * Math.abs(Math.sin(t * 9 + i));
  ctx.fillRect(x - 22, y - 50, 44, 8);
  ctx.globalAlpha = 1;
  for (let k = 0; k < 6; k++) {
    ctx.fillStyle = Math.sin(t * 12 + i + k) > 0 ? "#fff6c2" : color;
    ctx.fillRect(x - 20 + k * 7, y - 48, 4, 4);
  }
}

function drawHero(
  ctx: CanvasRenderingContext2D,
  sprites: Sprites | null,
  x: number,
  y: number,
  dir: Dir,
  phase: number,
  walking: boolean,
  t: number,
  reduce: boolean,
) {
  const row = FACE[dir];
  const col = walking ? Math.floor(phase * 12) % 4 : Math.floor(t * 2) % 2 === 0 ? 0 : 0;
  const bob = walking || reduce ? 0 : Math.sin(t * 6) * 1.5;
  const squash = walking ? 1 : 1 + Math.sin(t * 6) * 0.04;
  if (sprites?.hero?.complete) {
    const cell = sprites.hero.width / 4;
    const h = 40 * squash;
    ctx.drawImage(sprites.hero, col * cell, row * cell, cell, cell, x - 20, y - 36 + bob - (h - 40), 40, h);
  } else {
    ctx.fillStyle = "#e23d4a";
    ctx.fillRect(x - 6, y - 18 + bob, 12, 18);
  }
}

function drawBurst(ctx: CanvasRenderingContext2D, sprites: Sprites | null, x: number, y: number, u: number) {
  if (sprites?.fx?.complete) {
    const cell = sprites.fx.width / 2;
    const frame = Math.min(3, Math.floor(u * 4));
    const sx = (frame % 2) * cell;
    const sy = Math.floor(frame / 2) * cell;
    const size = 48 + u * 16;
    ctx.drawImage(sprites.fx, sx, sy, cell, cell, x - size / 2, y - size / 2, size, size);
  }
}

function drawSheet(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | undefined,
  cols: number,
  rows: number,
  c: number,
  r: number,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  if (!img?.complete || !img.width) return;
  const cw = img.width / cols;
  const ch = img.height / rows;
  ctx.drawImage(img, c * cw, r * ch, cw, ch, Math.round(x - w / 2), Math.round(y - h), w, h);
}
