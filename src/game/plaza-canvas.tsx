import { useEffect, useRef } from "react";
import type { Option } from "@/data/types";
import { blip, unlockAudio } from "@/game/sfx";
import { cn } from "@/lib/utils";

const W = 320;
const H = 220;
const DIRS = ["up", "left", "right", "down"] as const;
type Dir = (typeof DIRS)[number];

const SLOTS: Record<Dir, { x: number; y: number }> = {
  up: { x: 160, y: 52 },
  left: { x: 52, y: 118 },
  right: { x: 268, y: 118 },
  down: { x: 160, y: 186 },
};

const CINEMA_SRC: Record<Dir, string> = {
  up: "/sprites/cinema-gold.png",
  left: "/sprites/cinema-pink.png",
  right: "/sprites/cinema-teal.png",
  down: "/sprites/cinema-blue.png",
};

const CACHE = new Map<string, HTMLImageElement>();
function sprite(src: string) {
  let img = CACHE.get(src);
  if (!img) {
    img = new Image();
    img.src = src;
    CACHE.set(src, img);
  }
  return img;
}

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
};

export type PlazaProps = {
  question: string;
  hint?: string;
  chapter: string;
  index: number;
  total: number;
  options: Option[];
  onPick: (ids: string[]) => void;
  onSkip: () => void;
};

export function PlazaCanvas(props: PlazaProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef(props);
  propsRef.current = props;
  const aimRef = useRef<(dir: Dir) => void>(() => {});

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const wrapEl = wrapRef.current;
    if (!canvasEl || !wrapEl) return;
    const ctxEl = canvasEl.getContext("2d");
    if (!ctxEl) return;
    const canvas: HTMLCanvasElement = canvasEl;
    const wrap: HTMLDivElement = wrapEl;
    const ctx: CanvasRenderingContext2D = ctxEl;

    let dead = false;
    let raf = 0;
    const keys = new Set<string>();
    let swipe: { x: number; y: number } | null = null;
    let reduced = false;
    try {
      reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      /* */
    }

    const player = { x: 160, y: 128, dir: "down" as Dir, walking: false, frame: 0, acc: 0 };
    let target: Dir | null = null;
    let entering: Dir | null = null;
    let enterT = 0;
    let trauma = 0;
    let bob = 0;
    let last = performance.now();
    let lastIndex = propsRef.current.index;
    let committed = false;
    const particles: Particle[] = [];
    let fxFrame = 0;
    let starPhase = 0;
    const tiles: { x: number; y: number; p: number }[] = [];
    for (let i = 0; i < 36; i++) {
      tiles.push({
        x: 28 + Math.random() * 264,
        y: 64 + Math.random() * 130,
        p: Math.random() * Math.PI * 2,
      });
    }

    const sources = [
      "/sprites/player.png",
      "/sprites/fx.png",
      "/sprites/sky.jpg",
      "/sprites/ground.png",
      "/sprites/prop-lamp.png",
      "/sprites/prop-popcorn.png",
      "/sprites/prop-reels.png",
      ...Object.values(CINEMA_SRC),
    ];
    for (const src of sources) sprite(src);

    function burst(x: number, y: number, color: string, n = 12) {
      const room = 80 - particles.length;
      const count = Math.max(0, Math.min(n, room));
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 20 + Math.random() * 70;
        particles.push({
          x,
          y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s - 20,
          life: 0,
          max: 0.28 + Math.random() * 0.28,
          color,
          size: 1 + Math.random() * 2,
        });
      }
    }

    function dirFromCode(code: string): Dir | null {
      if (code === "ArrowUp" || code === "KeyW") return "up";
      if (code === "ArrowDown" || code === "KeyS") return "down";
      if (code === "ArrowLeft" || code === "KeyA") return "left";
      if (code === "ArrowRight" || code === "KeyD") return "right";
      return null;
    }

    function resetPlayer() {
      player.x = 160;
      player.y = 128;
      player.dir = "down";
      player.walking = false;
      player.frame = 0;
      target = null;
      entering = null;
      enterT = 0;
      committed = false;
      trauma = 0;
    }

    function aim(dir: Dir) {
      const p = propsRef.current;
      const slot = DIRS.indexOf(dir);
      if (slot < 0 || slot >= p.options.length) {
        blip("skip");
        return;
      }
      if (entering || committed) return;
      if (target === dir && player.walking) return;
      unlockAudio();
      target = dir;
      player.dir = dir;
      player.walking = true;
      blip("step");
      burst(player.x, player.y + 8, "#ffd84a", 5);
    }
    aimRef.current = aim;

    function commit(dir: Dir) {
      if (committed || entering) return;
      entering = dir;
      enterT = 0;
      trauma = Math.min(1, trauma + 0.4);
      blip("ok");
      burst(SLOTS[dir].x, SLOTS[dir].y - 8, "#ff4f8b", 16);
      burst(SLOTS[dir].x, SLOTS[dir].y - 8, "#ffd84a", 10);
    }

    function finishEnter() {
      if (committed || dead) return;
      const dir = entering;
      entering = null;
      target = null;
      player.walking = false;
      if (!dir) return;
      const opt = propsRef.current.options[DIRS.indexOf(dir)];
      if (!opt) {
        resetPlayer();
        return;
      }
      committed = true;
      propsRef.current.onPick([opt.id]);
    }

    const onKey = (e: KeyboardEvent) => {
      const dir = dirFromCode(e.code);
      if (dir) {
        e.preventDefault();
        keys.add(e.code);
        aim(dir);
      }
      if (e.code === "Escape" || e.code === "Backspace") {
        e.preventDefault();
        propsRef.current.onSkip();
      }
    };
    const onUp = (e: KeyboardEvent) => keys.delete(e.code);
    const onBlur = () => keys.clear();

    const onDown = (e: PointerEvent) => {
      swipe = { x: e.clientX, y: e.clientY };
      try {
        wrap.setPointerCapture(e.pointerId);
      } catch {
        /* synthetic */
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!swipe) return;
      const dx = e.clientX - swipe.x;
      const dy = e.clientY - swipe.y;
      if (Math.hypot(dx, dy) < 36) return;
      swipe = null;
      if (Math.abs(dx) > Math.abs(dy)) aim(dx > 0 ? "right" : "left");
      else aim(dy > 0 ? "down" : "up");
    };
    const onPtrUp = (e: PointerEvent) => {
      if (!swipe) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) {
        swipe = null;
        return;
      }
      const sx = ((e.clientX - rect.left) / rect.width) * W;
      const sy = ((e.clientY - rect.top) / rect.height) * H;
      swipe = null;
      let best: Dir | null = null;
      let bestD = 42;
      for (const d of DIRS) {
        const s = SLOTS[d];
        const dist = Math.hypot(sx - s.x, sy - s.y);
        if (dist < bestD) {
          bestD = dist;
          best = d;
        }
      }
      if (best) aim(best);
    };

    window.addEventListener("keydown", onKey, { capture: true });
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerup", onPtrUp);
    wrap.addEventListener("pointercancel", () => {
      swipe = null;
    });

    window.__controlsTest = {
      getX: () => player.x,
      getY: () => player.y,
      getYaw: () => {
        const map: Record<Dir, number> = { left: 0.4, right: -0.4, up: 0, down: 0 };
        return map[player.dir];
      },
      getSpeed: () => (player.walking || Boolean(entering) ? 1 : 0),
      setKeys: (codes: string[]) => {
        keys.clear();
        for (const c of codes) {
          keys.add(c);
          const d = dirFromCode(c);
          if (d) aim(d);
        }
      },
    };

    function resize() {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const fit = Math.max(0.5, Math.min(r.width / W, r.height / H) || 1);
      const cssW = Math.max(1, Math.round(W * fit));
      const cssH = Math.max(1, Math.round(H * fit));
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform((cssW * dpr) / W, 0, 0, (cssH * dpr) / H, 0, 0);
      ctx.imageSmoothingEnabled = false;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    function drawSprite(
      img: HTMLImageElement,
      sx: number,
      sy: number,
      sw: number,
      sh: number,
      dx: number,
      dy: number,
      dw: number,
      dh: number,
    ) {
      if (!img.complete || img.naturalWidth === 0) return;
      ctx.drawImage(img, sx, sy, sw, sh, Math.round(dx), Math.round(dy), dw, dh);
    }

    function frame(now: number) {
      if (dead) return;
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 0.1) dt = 0.1;
      bob += dt;
      starPhase += dt;
      fxFrame += dt * 8;
      trauma = Math.max(0, trauma - dt * 2.2);

      if (propsRef.current.index !== lastIndex) {
        lastIndex = propsRef.current.index;
        resetPlayer();
      }

      const dest = target ? SLOTS[target] : null;
      if (dest && !entering && !committed) {
        const dx = dest.x - player.x;
        const dy = dest.y + 16 - player.y;
        const dist = Math.hypot(dx, dy);
        const spd = 110;
        if (dist < 10) {
          player.x = dest.x;
          player.y = dest.y + 16;
          player.walking = false;
          commit(target!);
        } else {
          player.x += (dx / dist) * spd * dt;
          player.y += (dy / dist) * spd * dt;
          player.walking = true;
          player.acc += dt * 8;
          if (player.acc > 1) {
            player.acc -= 1;
            player.frame = (player.frame + 1) % 4;
          }
        }
      }

      if (entering) {
        enterT += dt;
        if (enterT > 0.28) finishEnter();
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]!;
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 80 * dt;
        if (p.life >= p.max) particles.splice(i, 1);
      }

      const shake = trauma * trauma;
      const ox = reduced ? 0 : (Math.random() * 2 - 1) * 5 * shake;
      const oy = reduced ? 0 : (Math.random() * 2 - 1) * 5 * shake;

      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, W, H);

      const sky = sprite("/sprites/sky.jpg");
      if (sky.complete && sky.naturalWidth) ctx.drawImage(sky, 0, 0, W, H);
      else {
        ctx.fillStyle = "#1a0820";
        ctx.fillRect(0, 0, W, H);
      }

      ctx.fillStyle = "#ffe7a8";
      for (let i = 0; i < 18; i++) {
        const tw = (Math.sin(starPhase * 3 + i * 1.7) + 1) / 2;
        if (tw < 0.4) continue;
        ctx.globalAlpha = tw * 0.8;
        ctx.fillRect((i * 37 + 11) % W, 4 + (i * 13) % 40, 1, 1);
      }
      ctx.globalAlpha = 1;

      ctx.save();
      ctx.translate(Math.round(ox), Math.round(oy));

      ctx.fillStyle = "#3a1844";
      ctx.beginPath();
      ctx.moveTo(160, 48);
      ctx.lineTo(292, 128);
      ctx.lineTo(160, 208);
      ctx.lineTo(28, 128);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#ffd84a";
      ctx.lineWidth = 1;
      ctx.stroke();

      const ground = sprite("/sprites/ground.png");
      if (ground.complete && ground.naturalWidth) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(160, 48);
        ctx.lineTo(292, 128);
        ctx.lineTo(160, 208);
        ctx.lineTo(28, 128);
        ctx.closePath();
        ctx.clip();
        ctx.globalAlpha = 0.55;
        ctx.drawImage(ground, 36, 58, 248, 130);
        ctx.restore();
      }

      for (const t of tiles) {
        const a = (Math.sin(bob * 3.2 + t.p) + 1) / 2;
        if (a < 0.82) continue;
        ctx.fillStyle = a > 0.94 ? "#ffd84a" : "#ff4f8b";
        ctx.fillRect(Math.round(t.x), Math.round(t.y), 1, 1);
      }

      const lamp = sprite("/sprites/prop-lamp.png");
      const pop = sprite("/sprites/prop-popcorn.png");
      const reels = sprite("/sprites/prop-reels.png");
      const bobY = reduced ? 0 : Math.sin(bob * 2) * 2;
      if (lamp.complete) {
        ctx.drawImage(lamp, 16, 78 + bobY, 26, 26);
        ctx.drawImage(lamp, 278, 78 - bobY, 26, 26);
      }
      if (pop.complete) ctx.drawImage(pop, 26, 154, 28, 28);
      if (reels.complete) ctx.drawImage(reels, 266, 154, 30, 30);

      const pnow = propsRef.current;
      const opts = pnow.options.slice(0, 4);
      const playerImg = sprite("/sprites/player.png");
      const fxImg = sprite("/sprites/fx.png");

      function drawCinema(dir: Dir, i: number) {
        if (!opts[i]) return;
        const slot = SLOTS[dir];
        const img = sprite(CINEMA_SRC[dir]);
        const bounce = reduced ? 0 : Math.sin(bob * 2.4 + i) * 1.5;
        const glow = target === dir || entering === dir;
        const scale = entering === dir ? 1 + enterT * 0.28 : glow ? 1.05 : 1;
        const dw = 64 * scale;
        const dh = 64 * scale;
        if (glow) {
          ctx.fillStyle = "rgba(255, 216, 74, 0.2)";
          ctx.beginPath();
          ctx.ellipse(slot.x, slot.y + 24, 28, 8, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        if (img.complete && img.naturalWidth) {
          ctx.drawImage(img, slot.x - dw / 2, slot.y - dh + bounce, dw, dh);
        } else {
          ctx.fillStyle = glow ? "#ffd84a" : "#5a2260";
          ctx.fillRect(slot.x - 24, slot.y - 36, 48, 40);
        }
      }

      drawCinema("up", 0);
      drawCinema("left", 1);
      drawCinema("right", 2);

      if (playerImg.complete && playerImg.naturalWidth) {
        const row = player.dir === "down" ? 0 : player.dir === "left" ? 1 : player.dir === "right" ? 2 : 3;
        const col = player.walking ? player.frame : 0;
        const hide = entering && enterT > 0.16;
        if (!hide) {
          const squash = player.walking ? 1 : 1 + Math.sin(bob * 5) * 0.03;
          drawSprite(
            playerImg,
            col * 96,
            row * 96,
            96,
            96,
            player.x - 16,
            player.y - 28 / squash,
            32,
            32 * squash,
          );
        }
      } else {
        ctx.fillStyle = "#ff4f8b";
        ctx.fillRect(player.x - 4, player.y - 10, 8, 12);
      }

      drawCinema("down", 3);

      if (fxImg.complete && fxImg.naturalWidth && (entering || trauma > 0.2)) {
        const f = Math.floor(fxFrame) % 4;
        const at = entering ? SLOTS[entering] : { x: player.x, y: player.y };
        ctx.drawImage(fxImg, (f % 2) * 128, Math.floor(f / 2) * 128, 128, 128, at.x - 22, at.y - 32, 44, 44);
      }

      for (const p of particles) {
        ctx.globalAlpha = 1 - p.life / p.max;
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey, { capture: true });
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerup", onPtrUp);
      ro.disconnect();
      delete window.__controlsTest;
    };
  }, []);

  const arrows: Record<Dir, string> = { up: "↑", down: "↓", left: "←", right: "→" };
  const opts = props.options.slice(0, 4);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="px-1">
        <p className="text-sm text-muted">
          {props.chapter}
          <span className="text-subtle">
            {" "}
            · {props.index + 1}/{props.total}
          </span>
        </p>
        <h2 className="mt-2 font-display text-2xl italic leading-snug text-fg sm:text-3xl">{props.question}</h2>
        {props.hint ? <p className="mt-2 text-sm leading-relaxed text-muted">{props.hint}</p> : null}
      </header>

      <div className="relative mt-4">
        <div
          ref={wrapRef}
          className="relative flex aspect-[320/220] w-full items-center justify-center overflow-hidden rounded-md bg-bg touch-none"
          style={{ imageRendering: "pixelated" }}
        >
          <canvas ref={canvasRef} className="block" style={{ imageRendering: "pixelated" }} />
        </div>
        <AnswerBtn
          className="absolute left-1/2 top-2 z-10 w-[min(100%,20rem)] -translate-x-1/2"
          arrow={arrows.up}
          option={opts[0]}
          onChoose={() => aimRef.current("up")}
        />
        <AnswerBtn
          className="absolute left-2 top-1/2 z-10 w-[42%] -translate-y-1/2 sm:w-44"
          arrow={arrows.left}
          option={opts[1]}
          onChoose={() => aimRef.current("left")}
        />
        <AnswerBtn
          className="absolute right-2 top-1/2 z-10 w-[42%] -translate-y-1/2 sm:w-44"
          arrow={arrows.right}
          option={opts[2]}
          onChoose={() => aimRef.current("right")}
        />
        <AnswerBtn
          className="absolute bottom-2 left-1/2 z-10 w-[min(100%,20rem)] -translate-x-1/2"
          arrow={arrows.down}
          option={opts[3]}
          onChoose={() => aimRef.current("down")}
        />
      </div>

      <p className="mt-3 text-center text-sm text-subtle">Frecce o swipe verso una sala.</p>
      <button
        type="button"
        onClick={props.onSkip}
        className="mx-auto mt-1 min-h-11 px-3 text-sm text-muted underline-offset-2 hover:text-fg hover:underline"
      >
        Salta
      </button>
    </div>
  );
}

function AnswerBtn({
  option,
  arrow,
  onChoose,
  className,
}: {
  option?: Option;
  arrow: string;
  onChoose: () => void;
  className?: string;
}) {
  if (!option) return <div className={className} />;
  return (
    <button
      type="button"
      onClick={() => {
        unlockAudio();
        onChoose();
      }}
      className={cn(
        "min-h-11 max-h-24 overflow-hidden rounded-md border border-border bg-surface/95 px-2 py-2 text-left text-sm leading-snug text-fg shadow-md backdrop-blur-sm hover:border-accent sm:max-h-none sm:px-3",
        className,
      )}
    >
      <span className="mr-1 text-accent">{arrow}</span>
      {option.label}
    </button>
  );
}
