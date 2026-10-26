// A short burst of confetti fireworks, drawn on a temporary full-screen canvas.
// The canvas is created on demand and removed once the last piece has faded.

const COLOURS = ["#e3b465", "#f3d08c", "#a77a32", "#fff1d0", "#8fa3c8", "#5b6f9a"];

const GRAVITY = 600; // px/s²
const DRAG = 1.6; // fraction of velocity lost per second
const MAX_FRAME_SECONDS = 0.05; // clamp so a backgrounded tab doesn't teleport pieces

const ORIGIN_PIECES = 140;
const ORIGIN_SPEED = 900; // px/s
const FIREWORK_COUNT = 6;
const FIREWORK_PIECES = 90;
const FIREWORK_SPEED = 650; // px/s
const FIREWORK_INTERVAL_MS = 450;

const MIN_LIFE_SECONDS = 2.5;
const EXTRA_LIFE_SECONDS = 1.5;
const FADE_FROM = 0.7; // start fading at 70% of a piece's life

let canvas = null;
let ctx = null;
let pieces = [];
let running = false;
let lastTime = 0;

const random = (min, max) => min + Math.random() * (max - min);
const pick = (items) => items[Math.floor(Math.random() * items.length)];

function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function ensureCanvas() {
    if (canvas) return;
    canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, {
        position: "fixed",
        inset: "0",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: "10",
    });
    document.body.append(canvas);
    ctx = canvas.getContext("2d");
    resize();
    window.addEventListener("resize", resize);
}

function teardown() {
    window.removeEventListener("resize", resize);
    canvas.remove();
    canvas = null;
    ctx = null;
    running = false;
}

function step(time) {
    const dt = Math.min((time - lastTime) / 1000, MAX_FRAME_SECONDS);
    lastTime = time;

    pieces = pieces.filter((p) => p.life < p.maxLife && p.y < window.innerHeight + 50);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (const p of pieces) {
        p.life += dt;
        p.vx -= p.vx * DRAG * dt;
        p.vy += (GRAVITY - p.vy * DRAG) * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.spin * dt;
        p.flip += p.flipSpeed * dt;

        const fadeStart = p.maxLife * FADE_FROM;
        const alpha = p.life < fadeStart ? 1 : 1 - (p.life - fadeStart) / (p.maxLife - fadeStart);

        ctx.save();
        ctx.globalAlpha = Math.max(alpha, 0);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(1, Math.cos(p.flip)); // fake 3D tumble
        ctx.fillStyle = p.colour;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        ctx.restore();
    }

    if (pieces.length) {
        requestAnimationFrame(step);
    } else {
        teardown();
    }
}

function burst(x, y, count, speed) {
    ensureCanvas();

    for (let i = 0; i < count; i++) {
        const angle = random(0, Math.PI * 2);
        const velocity = speed * random(0.35, 1);
        pieces.push({
            x,
            y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            width: random(6, 12),
            height: random(3, 7),
            rotation: random(0, Math.PI * 2),
            spin: random(-6, 6),
            flip: random(0, Math.PI * 2),
            flipSpeed: random(6, 14),
            colour: pick(COLOURS),
            life: 0,
            maxLife: MIN_LIFE_SECONDS + Math.random() * EXTRA_LIFE_SECONDS,
        });
    }

    if (!running) {
        running = true;
        lastTime = performance.now();
        requestAnimationFrame(step);
    }
}

/**
 * Bursts confetti out of `origin` (or the centre of the screen), then sets
 * off a volley of fireworks across the top of the page.
 * Does nothing for visitors who prefer reduced motion.
 */
export function celebrate(origin) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = origin?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    burst(x, y, ORIGIN_PIECES, ORIGIN_SPEED);

    for (let i = 1; i <= FIREWORK_COUNT; i++) {
        setTimeout(() => {
            burst(
                window.innerWidth * random(0.15, 0.85),
                window.innerHeight * random(0.1, 0.45),
                FIREWORK_PIECES,
                FIREWORK_SPEED,
            );
        }, i * FIREWORK_INTERVAL_MS);
    }
}
