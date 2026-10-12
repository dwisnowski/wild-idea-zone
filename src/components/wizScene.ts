import { animate, createTimer, eases, spring, stagger, utils } from "animejs";
import type { JSAnimation, Timer } from "animejs";

export interface WizPalette {
  primary: string;
  secondary: string;
  dark: boolean;
}

export interface WizSceneOptions {
  width: number;
  palette: WizPalette;
  playIntro: boolean;
  reducedMotion: boolean;
}

export interface WizScene {
  setPalette(palette: WizPalette): void;
  dispose(): void;
}

const FONT_STACK = '"Inter", "Helvetica Neue", Arial, sans-serif';
const font = (size: number) => `800 ${size}px ${FONT_STACK}`;
const LETTER_SPACING_EM = -0.03;
const TAU = Math.PI * 2;

/** "WIZ" in Morse code: the intro keys this before decoding it into the phrase. */
const MORSE = [".--", "..", "--.."];
const MS_PER_MORSE_UNIT = 42;

interface Target {
  x: number;
  y: number;
  /** -1 for regular letters, 0/1/2 for the golden W, I, Z */
  letter: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  gold: number;
  /** Home position in the phrase */
  px: number;
  py: number;
  letter: number;
  /** Position in the big "WIZ" */
  wx: number;
  wy: number;
  /** Scratch destination for one-off moves */
  tx: number;
  ty: number;
  /** Pointer and shockwave displacement, integrated every frame */
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  hue: number;
  phase: number;
  twinkle: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;
  flare: boolean;
}

interface Ring {
  x: number;
  y: number;
  r: number;
  alpha: number;
  push: number;
}

const perParticle = (fn: (p: Particle) => number) => (target: unknown) => fn(target as Particle);

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mixColors(a: string, b: string, steps: number): string[] {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return Array.from({ length: steps }, (_, i) => {
    const t = steps === 1 ? 0 : i / (steps - 1);
    const c = ca.map((v, k) => Math.round(v + (cb[k] - v) * t));
    return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  });
}

function createGlowSprite(dark: boolean): HTMLCanvasElement {
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = 64;
  const g = sprite.getContext("2d")!;
  const gradient = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  if (dark) {
    gradient.addColorStop(0, "rgba(255, 236, 170, 1)");
    gradient.addColorStop(0.3, "rgba(255, 196, 64, 0.45)");
  } else {
    gradient.addColorStop(0, "rgba(255, 190, 40, 0.9)");
    gradient.addColorStop(0.3, "rgba(236, 150, 0, 0.3)");
  }
  gradient.addColorStop(1, "rgba(255, 170, 0, 0)");
  g.fillStyle = gradient;
  g.fillRect(0, 0, 64, 64);
  return sprite;
}

function buildColors(palette: WizPalette) {
  return {
    base: mixColors(palette.primary, palette.secondary, 32),
    gold: palette.dark ? mixColors("#f5b82e", "#fff6d2", 8) : mixColors("#c98a00", "#ffc21a", 8),
    glint: palette.dark ? "#eaf6ff" : "#ffffff",
    ring: palette.dark ? "#ffd35c" : "#e6a100",
    glow: createGlowSprite(palette.dark),
    blend: (palette.dark ? "lighter" : "source-over") as GlobalCompositeOperation,
  };
}

function rasterize(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  draw(ctx);
  return ctx.getImageData(0, 0, width, height);
}

interface LetterBox {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

/** Hex-packed grid sample of the drawn glyphs. Gold glyphs are drawn green, regular ones red. */
function sample(img: ImageData, step: number, goldBoxes: LetterBox[] = []): Target[] {
  const out: Target[] = [];
  let row = 0;
  for (let y = step / 2; y < img.height; y += step, row++) {
    for (let x = (row % 2 ? step / 2 : 0) + step / 4; x < img.width; x += step) {
      const i = ((y | 0) * img.width + (x | 0)) * 4;
      if (img.data[i + 3] < 128) continue;
      let letter = -1;
      if (img.data[i + 1] > img.data[i]) {
        letter = goldBoxes.findIndex((b) => x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1);
      }
      out.push({ x, y, letter });
    }
  }
  return out;
}

interface Layout {
  width: number;
  height: number;
  fontSize: number;
  step: number;
  radius: number;
  phrase: Target[];
  wiz: Target[];
  wizScale: number;
  morse: { startX: number; unit: number; cy: number; segments: { start: number; len: number }[]; total: number };
}

function computeLayout(width: number): Layout {
  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = font(100);
  const lines = width >= 560 ? ["Wild Idea Zone"] : ["Wild Idea", "Zone"];
  const lineWidthAt100 = (line: string) => measure.measureText(line).width + LETTER_SPACING_EM * 100 * (line.length - 1);
  const padX = 6;
  const fontSize = Math.min(140, ((width - padX * 2) / Math.max(...lines.map(lineWidthAt100))) * 100);

  measure.font = font(fontSize);
  const ascent = measure.measureText("Wild").actualBoundingBoxAscent;
  const gap = fontSize * 0.22;
  const padTop = fontSize * 0.45;
  const padBottom = fontSize * 0.35;
  const height = Math.ceil(padTop + lines.length * ascent + (lines.length - 1) * gap + padBottom);
  const step = Math.min(5.5, Math.max(2.6, fontSize / 24));

  const goldBoxes: LetterBox[] = [];
  const phraseImg = rasterize(width, height, (ctx) => {
    ctx.font = font(fontSize);
    lines.forEach((line, li) => {
      const baseline = padTop + ascent + li * (ascent + gap);
      [...line].forEach((char, ci) => {
        if (char === " ") return;
        const x = padX + ctx.measureText(line.slice(0, ci)).width + LETTER_SPACING_EM * fontSize * ci;
        const isGold = ci === 0 || line[ci - 1] === " ";
        if (isGold) {
          const w = ctx.measureText(char).width;
          goldBoxes.push({ x0: x - 2, x1: x + w + 2, y0: baseline - ascent - 4, y1: baseline + 4 });
        }
        ctx.fillStyle = isGold ? "#00ff00" : "#ff0000";
        ctx.fillText(char, x, baseline);
      });
    });
  });
  const phrase = sample(phraseImg, step, goldBoxes);

  // Big "WIZ", sampled no denser than the phrase so every WIZ dot gets at least one particle.
  const wizImg = rasterize(width, height, (ctx) => {
    ctx.font = font(100);
    const capAt100 = ctx.measureText("W").actualBoundingBoxAscent;
    const spacing = 0.1;
    const widthAt100 = ctx.measureText("WIZ").width + spacing * 100 * 2;
    const size = Math.min((height * 0.82 * 100) / capAt100, (width * 0.86 * 100) / widthAt100);
    ctx.font = font(size);
    const cap = (capAt100 * size) / 100;
    const total = ctx.measureText("WIZ").width + spacing * size * 2;
    let x = (width - total) / 2;
    ctx.fillStyle = "#00ff00";
    for (const char of "WIZ") {
      ctx.fillText(char, x, height / 2 + cap / 2);
      x += ctx.measureText(char).width + spacing * size;
    }
  });
  let wizStep = step;
  let wiz = sample(wizImg, wizStep);
  while (wiz.length > phrase.length) {
    wizStep += 0.2;
    wiz = sample(wizImg, wizStep);
  }

  const segments: { start: number; len: number }[] = [];
  let cursor = 0;
  MORSE.forEach((code, li) => {
    for (const symbol of code) {
      const len = symbol === "." ? 1 : 3;
      segments.push({ start: cursor, len });
      cursor += len + 1;
    }
    if (li < MORSE.length - 1) cursor += 2;
  });
  const total = cursor - 1;
  const unit = Math.min((width * 0.8) / total, fontSize * 0.2);

  return {
    width,
    height,
    fontSize,
    step,
    radius: step * 0.42,
    phrase,
    wiz,
    wizScale: Math.min(1.8, wizStep / step),
    morse: { startX: (width - total * unit) / 2, unit, cy: height / 2, segments, total },
  };
}

function createParticles(layout: Layout): Particle[] {
  const { phrase, wiz, width, morse } = layout;
  const particles: Particle[] = phrase.map((t) => ({
    x: t.x,
    y: t.y,
    size: 1,
    gold: t.letter >= 0 ? 1 : 0,
    px: t.x,
    py: t.y,
    letter: t.letter,
    wx: t.x,
    wy: t.y,
    tx: t.x,
    ty: t.y,
    ox: 0,
    oy: 0,
    vx: 0,
    vy: 0,
    hue: Math.min(31, Math.max(0, Math.round((t.x / width) * 31))),
    phase: Math.random() * TAU,
    twinkle: utils.random(0.002, 0.009, 4),
  }));

  // Left-to-right rank keeps "Wild" heading for the W, "Zone" for the Z, and so on.
  const ranked = [...particles].sort((a, b) => a.px - b.px || a.py - b.py);
  const wizSorted = [...wiz].sort((a, b) => a.x - b.x || a.y - b.y);
  const morseLen = morse.segments.reduce((sum, s) => sum + s.len, 0);
  const half = morse.unit / 2;

  ranked.forEach((p, r) => {
    const w = wizSorted[Math.floor((r * wizSorted.length) / ranked.length)];
    p.wx = w.x + utils.random(-0.6, 0.6, 2);
    p.wy = w.y + utils.random(-0.6, 0.6, 2);

    let f = ((r + 0.5) / ranked.length) * morseLen;
    const seg = morse.segments.find((s) => (f -= s.len) < 0) ?? morse.segments[morse.segments.length - 1];
    const along = (f + seg.len) / seg.len;
    const x0 = morse.startX + seg.start * morse.unit;
    const x = x0 + along * seg.len * morse.unit;
    const c0 = x0 + half;
    const c1 = x0 + seg.len * morse.unit - half;
    const dx = x < c0 ? c0 - x : x > c1 ? x - c1 : 0;
    const halfHeight = Math.sqrt(Math.max(0, half * half - dx * dx));
    p.tx = x;
    p.ty = morse.cy + utils.random(-halfHeight, halfHeight, 2);
  });

  return particles;
}

export function createWizScene(canvas: HTMLCanvasElement, options: WizSceneOptions): WizScene {
  const layout = computeLayout(options.width);
  const { width, height, radius, fontSize, morse } = layout;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d")!;

  const particles = createParticles(layout);
  const sparks: Spark[] = [];
  const rings: Ring[] = [];
  const goldPool: Particle[] = [];
  const glint = { x: -1e4, width: fontSize * 0.9 };
  const pointer = { x: 0, y: 0, active: false };
  const state = { sparkRate: 0.0016 };
  let colors = buildColors(options.palette);
  let alive = true;

  const running = new Set<JSAnimation | Timer>();
  const track = <T extends JSAnimation | Timer>(tickable: T): T => {
    running.add(tickable);
    tickable.then(() => running.delete(tickable));
    return tickable;
  };
  const wait = (ms: number) => new Promise<void>((resolve) => track(createTimer({ duration: ms, onComplete: () => resolve() })));

  const spawnSpark = (x: number, y: number, burst = 0) => {
    if (sparks.length > 450) return;
    const flare = !burst && Math.random() < 0.22;
    const angle = Math.random() * TAU;
    const speed = burst ? utils.random(1, burst, 2) : 0;
    sparks.push({
      x,
      y,
      vx: burst ? Math.cos(angle) * speed : flare ? 0 : utils.random(-0.25, 0.25, 2),
      vy: burst ? Math.sin(angle) * speed : flare ? 0 : utils.random(-0.9, -0.2, 2),
      life: 1,
      decay: flare ? utils.random(0.03, 0.05, 3) : utils.random(0.012, 0.026, 3),
      size: flare ? radius * utils.random(3.5, 5.5, 1) : radius * utils.random(1.2, 2.8, 1),
      flare,
    });
  };

  const burst = (x: number, y: number, count: number, power = 5) => {
    for (let i = 0; i < count; i++) spawnSpark(x, y, power);
  };

  const shockwave = (x: number, y: number, reach: number, push = 1.4) => {
    const ring: Ring = { x, y, r: 0, alpha: 1, push };
    rings.push(ring);
    track(
      animate(ring, {
        r: reach,
        alpha: 0,
        duration: 1100,
        ease: "outExpo",
        onComplete: () => rings.splice(rings.indexOf(ring), 1),
      }),
    );
  };

  const centroid = (group: Particle[]) => {
    const sum = group.reduce((acc, p) => ({ x: acc.x + p.px, y: acc.y + p.py }), { x: 0, y: 0 });
    return { x: sum.x / group.length, y: sum.y / group.length };
  };

  const star = (x: number, y: number, s: number) => {
    ctx.moveTo(x, y - s);
    ctx.quadraticCurveTo(x, y, x + s, y);
    ctx.quadraticCurveTo(x, y, x, y + s);
    ctx.quadraticCurveTo(x, y, x - s, y);
    ctx.quadraticCurveTo(x, y, x, y - s);
  };

  const step = (dt: number) => {
    const iterations = Math.min(3, Math.max(1, Math.round(dt / 16.7)));
    const reach = fontSize * 0.55;
    const reach2 = reach * reach;
    goldPool.length = 0;

    for (const p of particles) {
      for (let i = 0; i < iterations; i++) {
        const x = p.x + p.ox;
        const y = p.y + p.oy;
        if (pointer.active) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < reach2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const force = (1 - d / reach) * 1.5;
            p.vx += (dx / d) * force;
            p.vy += (dy / d) * force;
          }
        }
        for (const ring of rings) {
          const dx = x - ring.x;
          const dy = y - ring.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const band = Math.abs(d - ring.r);
          if (band < 16) {
            const force = ring.push * ring.alpha * (1 - band / 16);
            p.vx += (dx / d) * force;
            p.vy += (dy / d) * force;
          }
        }
        p.vx = (p.vx - p.ox * 0.07) * 0.85;
        p.vy = (p.vy - p.oy * 0.07) * 0.85;
        p.ox += p.vx;
        p.oy += p.vy;
      }
      if (p.gold > 0.8 && p.size > 0.5) goldPool.push(p);
    }

    let spawns = goldPool.length * state.sparkRate * iterations;
    while (spawns > 0 && goldPool.length) {
      if (Math.random() < spawns) {
        const p = goldPool[(Math.random() * goldPool.length) | 0];
        spawnSpark(p.x + p.ox, p.y + p.oy);
      }
      spawns -= 1;
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx * iterations;
      s.y += s.vy * iterations;
      s.vx *= 0.96;
      s.vy = s.vy * 0.96 - 0.012 * iterations;
      s.life -= s.decay * iterations;
      if (s.life <= 0) sparks.splice(i, 1);
    }
  };

  const draw = (time: number) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const glintActive = glint.x > -glint.width && glint.x < width + glint.width;

    ctx.globalCompositeOperation = colors.blend;
    for (const p of particles) {
      if (p.gold < 0.02 || p.size < 0.05) continue;
      const tw = 0.5 + 0.5 * Math.sin(time * p.twinkle + p.phase);
      const g = radius * p.size * (3.2 + tw * 1.6);
      ctx.globalAlpha = p.gold * (options.palette.dark ? 0.22 : 0.16) * (0.5 + tw * 0.5);
      ctx.drawImage(colors.glow, p.x + p.ox - g, p.y + p.oy - g, g * 2, g * 2);
    }
    ctx.globalCompositeOperation = "source-over";

    for (const p of particles) {
      if (p.size < 0.05) continue;
      const x = p.x + p.ox + Math.sin(time * 0.0013 + p.phase) * 0.35;
      const y = p.y + p.oy + Math.cos(time * 0.0011 + p.phase) * 0.35;
      const lit = glintActive ? Math.max(0, 1 - Math.abs(x - glint.x) / glint.width) : 0;
      const r = radius * p.size * (1 + lit * 0.45);

      if (p.gold < 0.98) {
        ctx.globalAlpha = 1 - p.gold;
        ctx.fillStyle = colors.base[p.hue];
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
      }
      if (p.gold > 0.02) {
        const tw = 0.5 + 0.5 * Math.sin(time * p.twinkle + p.phase);
        ctx.globalAlpha = p.gold;
        ctx.fillStyle = colors.gold[Math.min(7, (tw * 8) | 0)];
        ctx.beginPath();
        ctx.arc(x, y, r * (0.85 + tw * 0.3), 0, TAU);
        ctx.fill();
      }
      if (lit > 0.05) {
        ctx.globalAlpha = lit * 0.75;
        ctx.fillStyle = colors.glint;
        ctx.beginPath();
        ctx.arc(x, y, r * 0.6, 0, TAU);
        ctx.fill();
      }
    }

    ctx.globalCompositeOperation = colors.blend;
    ctx.fillStyle = colors.gold[7];
    for (const s of sparks) {
      ctx.globalAlpha = Math.min(1, s.life * 1.4);
      ctx.beginPath();
      star(s.x, s.y, s.size * (s.flare ? Math.sin(s.life * Math.PI) : s.life));
      ctx.fill();
    }

    ctx.strokeStyle = colors.ring;
    for (const ring of rings) {
      ctx.globalAlpha = ring.alpha * 0.8;
      ctx.lineWidth = 0.5 + ring.alpha * 2.5;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.r, 0, TAU);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  };

  if (options.reducedMotion) {
    draw(0);
    return {
      setPalette(palette) {
        options.palette = palette;
        colors = buildColors(palette);
        draw(0);
      },
      dispose() {},
    };
  }

  let last = 0;
  const loop = createTimer({
    onUpdate: (self) => {
      const now = self.currentTime;
      step(Math.min(50, now - last));
      last = now;
      draw(now);
    },
  });

  const visibility = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) loop.resume();
    else loop.pause();
  });
  visibility.observe(canvas);

  const toLocal = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * width, y: ((e.clientY - rect.top) / rect.height) * height };
  };
  const onMove = (e: PointerEvent) => {
    Object.assign(pointer, toLocal(e), { active: true });
    if (Math.random() < 0.35) {
      const near = goldPool.find((p) => Math.hypot(p.x + p.ox - pointer.x, p.y + p.oy - pointer.y) < fontSize * 0.4);
      if (near) spawnSpark(near.x + near.ox, near.y + near.oy);
    }
  };
  const onLeave = () => {
    pointer.active = false;
  };
  const onDown = (e: PointerEvent) => {
    const { x, y } = toLocal(e);
    shockwave(x, y, fontSize * 1.6, 2.2);
    burst(x, y, 22, 4);
  };
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerleave", onLeave);
  canvas.addEventListener("pointercancel", onLeave);
  canvas.addEventListener("pointerdown", onDown);

  const bouncy = spring({ mass: 1, stiffness: 90, damping: 9 });

  const transmit = async () => {
    for (const p of particles) {
      p.x = p.tx;
      p.y = p.ty;
      p.size = 0;
      p.gold = 0;
    }
    const keyDuration = morse.total * MS_PER_MORSE_UNIT;
    track(animate(glint, { x: [morse.startX, morse.startX + morse.total * morse.unit], duration: keyDuration, ease: "linear" }));
    await track(
      animate(particles, {
        size: 0.85,
        duration: 220,
        ease: eases.outBack(3),
        delay: perParticle((p) => ((p.x - morse.startX) / morse.unit) * MS_PER_MORSE_UNIT),
      }),
    );
    glint.x = -1e4;
  };

  const decode = async () => {
    for (const p of particles) {
      p.vy -= utils.random(2, 7, 2);
      p.vx += utils.random(-2, 2, 2);
    }
    track(
      animate(particles, {
        x: perParticle((p) => p.px),
        y: perParticle((p) => p.py),
        size: 1,
        ease: bouncy,
        delay: perParticle((p) => (p.px / width) * 420 + utils.random(0, 160)),
      }),
    );
    await wait(900);
  };

  const ignite = async () => {
    for (let letter = 0; letter < 3; letter++) {
      const group = particles.filter((p) => p.letter === letter);
      if (!group.length) continue;
      const c = centroid(group);
      shockwave(c.x, c.y, fontSize * 1.2);
      burst(c.x, c.y, 28, 5);
      track(
        animate(group, {
          gold: { to: 1, duration: 260, ease: "outQuad" },
          size: [
            { to: 2.1, duration: 140, ease: "outQuad" },
            { to: 1, duration: 800, ease: eases.outElastic(1, 0.4) },
          ],
          delay: stagger([0, 220], { from: "center" }),
        }),
      );
      await wait(380);
    }
  };

  const startGlint = () => {
    track(animate(glint, { x: [-glint.width, width + glint.width], duration: 1900, ease: "inOutSine", loop: true, loopDelay: 3600 }));
  };

  const toWiz = async () => {
    const cx = width / 2;
    shockwave(cx, height / 2, width * 0.5, 0.8);
    track(
      animate(particles, {
        gold: 1,
        duration: 700,
        ease: "outQuad",
        delay: perParticle((p) => (Math.abs(p.px - cx) / width) * 900),
      }),
    );
    state.sparkRate = 0.0035;
    await track(
      animate(particles, {
        x: perParticle((p) => p.wx),
        y: perParticle((p) => p.wy),
        size: layout.wizScale,
        ease: spring({ mass: 1, stiffness: 70, damping: 10 }),
        delay: perParticle((p) => (Math.abs(p.px - cx) / width) * 600 + utils.random(0, 120)),
      }),
    );
  };

  const backToPhrase = async () => {
    const cx = width / 2;
    const cy = height / 2;
    for (const p of particles) {
      const dx = p.x - cx;
      const dy = p.y - cy;
      const d = Math.hypot(dx, dy) || 1;
      const dist = utils.random(30, 120) + d * 0.25;
      p.tx = p.x + (dx / d) * dist;
      p.ty = p.y + (dy / d) * dist * 0.6;
    }
    shockwave(cx, cy, width * 0.7, 1.8);
    burst(cx, cy, 40, 8);
    state.sparkRate = 0.0016;
    await track(
      animate(particles, {
        x: perParticle((p) => p.tx),
        y: perParticle((p) => p.ty),
        size: 0.7,
        duration: 480,
        ease: "outExpo",
      }),
    );
    track(
      animate(particles, {
        gold: perParticle((p) => (p.letter >= 0 ? 1 : 0)),
        duration: 900,
        ease: "inOutQuad",
        delay: () => utils.random(0, 300),
      }),
    );
    await track(
      animate(particles, {
        x: perParticle((p) => p.px),
        y: perParticle((p) => p.py),
        size: 1,
        ease: bouncy,
        delay: () => utils.random(0, 350),
      }),
    );
  };

  const run = async () => {
    if (options.playIntro) {
      await wait(250);
      if (!alive) return;
      await transmit();
      await wait(450);
      if (!alive) return;
      await decode();
      if (!alive) return;
      await ignite();
    } else {
      for (const p of particles) {
        p.x = p.tx;
        p.y = p.ty;
        p.size = 0.4;
        p.gold = 0;
      }
      await decode();
      track(animate(particles, { gold: perParticle((p) => (p.letter >= 0 ? 1 : 0)), duration: 600, ease: "outQuad" }));
    }
    if (!alive) return;
    startGlint();
    while (alive) {
      await wait(4500);
      if (!alive) return;
      await toWiz();
      await wait(2400);
      if (!alive) return;
      await backToPhrase();
    }
  };
  void run();

  return {
    setPalette(palette) {
      options.palette = palette;
      colors = buildColors(palette);
    },
    dispose() {
      alive = false;
      for (const tickable of running) tickable.cancel();
      running.clear();
      loop.cancel();
      visibility.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointercancel", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
    },
  };
}
