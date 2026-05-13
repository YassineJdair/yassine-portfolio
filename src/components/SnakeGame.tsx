import { useEffect, useRef, useCallback, useState } from "react";
import Navbar from "@/components/Navbar";
import { useCanvasScale } from "@/hooks/useCanvasScale";

const COLS = 24;
const ROWS = 18;
const CELL = 22;
const W = COLS * CELL;
const H = ROWS * CELL;
const BASE_MS = 150; // ms per tick

const C = { bg: "#8BAC0F", dark: "#0F380F", mid: "#306230", light: "#9BBC0F" };

type Pos = { x: number; y: number };
type Dir = { x: number; y: number };

interface Enemy { id: number; pos: Pos; dir: Dir; moveTimer: number; }

const eq = (a: Pos, b: Pos) => a.x === b.x && a.y === b.y;
const DIRS: Dir[] = [{ x:1,y:0 },{ x:-1,y:0 },{ x:0,y:1 },{ x:0,y:-1 }];

function randPos(exclude: Pos[]): Pos {
    let p: Pos;
    let tries = 0;
    do {
        p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
        tries++;
    } while (exclude.some(e => eq(e, p)) && tries < 500);
    return p;
}

export default function SnakeGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef(0);

    // All game state in one ref — no React state, no stale closures
    const g = useRef({
        snake: [{ x: 12, y: 9 }, { x: 11, y: 9 }, { x: 10, y: 9 }] as Pos[],
        dir: { x: 0, y: 0 } as Dir,   // zero = not moving yet
        nextDir: { x: 0, y: 0 } as Dir,
        hasInput: false,
        food: { x: 18, y: 9 } as Pos,
        bonusFood: null as Pos | null,
        bonusCountdown: 0,
        enemies: [] as Enemy[],
        score: 0,
        level: 1,
        best: Number(localStorage.getItem("snake-best") || 0),
        phase: "start" as "start" | "playing" | "dead" | "over",
        flash: 0,
        paused: false,
        tickTimer: 0,    // ms accumulator
        lastTime: 0,
        frameCount: 0,
        newBest: false,
    });

    const reset = useCallback(() => {
        const s = [{ x: 12, y: 9 }, { x: 11, y: 9 }, { x: 10, y: 9 }];
        const food = randPos(s);
        const e1: Enemy = {
            id: 1, pos: randPos([...s, food]),
            dir: DIRS[Math.floor(Math.random() * 4)],
            moveTimer: 0,
        };
        Object.assign(g.current, {
            snake: s, dir: { x: 0, y: 0 }, nextDir: { x: 0, y: 0 },
            hasInput: false, food, bonusFood: null, bonusCountdown: 0,
            enemies: [e1], score: 0, level: 1, phase: "playing",
            flash: 0, paused: false, tickTimer: 0, frameCount: 0, newBest: false,
        });
    }, []);

    // Input
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const state = g.current;
            if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault();

            if (state.phase === "start" || state.phase === "over") { reset(); return; }
            if (state.phase === "dead") return;

            if (e.key === " " || e.key === "p") { state.paused = !state.paused; return; }
            if (e.key === "Enter") { reset(); return; }

            const map: Record<string, Dir> = {
                ArrowRight:{x:1,y:0}, d:{x:1,y:0},
                ArrowLeft:{x:-1,y:0}, a:{x:-1,y:0},
                ArrowDown:{x:0,y:1}, s:{x:0,y:1},
                ArrowUp:{x:0,y:-1}, w:{x:0,y:-1},
            };
            if (map[e.key]) {
                const d = map[e.key];
                const cur = state.dir;
                // Prevent reversing into self
                if (!(d.x === -cur.x && d.y === -cur.y) || !state.hasInput) {
                    state.nextDir = d;
                    state.hasInput = true;
                }
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [reset]);

    // Main RAF loop
    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;

        const loop = (timestamp: number) => {
            rafRef.current = requestAnimationFrame(loop);
            const state = g.current;
            const dt = Math.min(timestamp - (state.lastTime || timestamp), 100);
            state.lastTime = timestamp;
            state.frameCount++;

            // ── TICK ──
            if (state.phase === "playing" && !state.paused && state.hasInput) {
                state.tickTimer += dt;
                const tickMs = Math.max(70, BASE_MS - (state.level - 1) * 12);

                while (state.tickTimer >= tickMs) {
                    state.tickTimer -= tickMs;
                    tick(state);
                }
            }

            // Flash countdown
            if (state.flash > 0) state.flash = Math.max(0, state.flash - dt);

            // ── DRAW ──
            draw(ctx, state);
        };

        rafRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    function tick(state: typeof g.current) {
        // Apply direction
        if (state.nextDir.x !== 0 || state.nextDir.y !== 0) state.dir = state.nextDir;

        const prev = state.snake;
        let head: Pos = { x: prev[0].x + state.dir.x, y: prev[0].y + state.dir.y };

        // Wrap through walls
        head.x = ((head.x % COLS) + COLS) % COLS;
        head.y = ((head.y % ROWS) + ROWS) % ROWS;

        // Self collision
        if (prev.some(s => eq(s, head))) { die(state); return; }

        // Enemy collision
        if (state.enemies.some(e => eq(e.pos, head))) { die(state); return; }

        // Grow or move
        let ate = false;
        if (eq(head, state.food)) {
            ate = true;
            state.score += 10;
            state.food = randPos([head, ...prev]);

            // Level up every 50 pts
            const newLevel = Math.floor(state.score / 50) + 1;
            if (newLevel > state.level) {
                state.level = newLevel;
                // Add a new enemy
                const allPos = [head, ...prev, state.food, ...state.enemies.map(e => e.pos)];
                state.enemies.push({
                    id: Date.now(),
                    pos: randPos(allPos),
                    dir: DIRS[Math.floor(Math.random() * 4)],
                    moveTimer: 0,
                });
            }
        }

        // Bonus food
        if (state.bonusFood && eq(head, state.bonusFood)) {
            ate = true;
            state.score += 30;
            state.bonusFood = null;
            state.bonusCountdown = 0;
        }

        // Bonus food spawn/countdown
        if (state.bonusFood) {
            state.bonusCountdown--;
            if (state.bonusCountdown <= 0) state.bonusFood = null;
        } else if (Math.random() < 0.015 && state.score > 0) {
            state.bonusFood = randPos([head, ...prev, state.food]);
            state.bonusCountdown = 60;
        }

        state.snake = ate ? [head, ...prev] : [head, ...prev.slice(0, -1)];

        // Move enemies
        state.enemies.forEach(enemy => {
            enemy.moveTimer++;
            const enemyInterval = Math.max(3, 8 - (state.level - 1));
            if (enemy.moveTimer < enemyInterval) return;
            enemy.moveTimer = 0;

            const snk = state.snake;
            const dx = snk[0].x - enemy.pos.x;
            const dy = snk[0].y - enemy.pos.y;
            const dist = Math.abs(dx) + Math.abs(dy);

            let nd = enemy.dir;

            if (dist < 8 && Math.random() < 0.6) {
                nd = Math.abs(dx) >= Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) };
            } else if (Math.random() < 0.25) {
                nd = DIRS[Math.floor(Math.random() * 4)];
            }

            const np: Pos = {
                x: ((enemy.pos.x + nd.x) % COLS + COLS) % COLS,
                y: ((enemy.pos.y + nd.y) % ROWS + ROWS) % ROWS,
            };

            // Don't walk into snake body (only body, not head - head collision handled above)
            if (!snk.slice(1).some(s => eq(s, np))) {
                enemy.pos = np;
                enemy.dir = nd;
            }

            // Enemy touching player head after move
            if (eq(enemy.pos, state.snake[0])) die(state);
        });
    }

    function die(state: typeof g.current) {
        state.flash = 500;
        state.phase = "over";
        if (state.score > state.best) {
            state.best = state.score;
            state.newBest = true;
            localStorage.setItem("snake-best", String(state.score));
        }
    }

    function draw(ctx: CanvasRenderingContext2D, state: typeof g.current) {
        // Background
        ctx.fillStyle = state.flash > 0 ? "#fff" : C.bg;
        ctx.fillRect(0, 0, W, H);

        if (state.flash > 0) return;

        // Grid dots
        ctx.fillStyle = C.mid;
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
            ctx.fillRect(c * CELL + 9, r * CELL + 9, 2, 2);
        }

        // Food
        ctx.fillStyle = C.dark;
        ctx.fillRect(state.food.x*CELL+4, state.food.y*CELL+4, CELL-8, CELL-8);
        ctx.fillStyle = C.light;
        ctx.fillRect(state.food.x*CELL+6, state.food.y*CELL+6, 4, 4);
        ctx.fillRect(state.food.x*CELL+10, state.food.y*CELL+10, 3, 3);

        // Bonus food
        if (state.bonusFood && state.frameCount % 20 < 15) {
            ctx.fillStyle = C.dark;
            ctx.fillRect(state.bonusFood.x*CELL+2, state.bonusFood.y*CELL+2, CELL-4, CELL-4);
            ctx.fillStyle = "#EAB308";
            ctx.font = "bold 12px monospace";
            ctx.textAlign = "center";
            ctx.fillText("★", state.bonusFood.x*CELL+CELL/2, state.bonusFood.y*CELL+CELL/2+4);
            ctx.textAlign = "left";
        }

        // Enemies (✕ shape)
        state.enemies.forEach(enemy => {
            ctx.fillStyle = C.dark;
            ctx.fillRect(enemy.pos.x*CELL+2, enemy.pos.y*CELL+2, CELL-4, CELL-4);
            ctx.strokeStyle = C.bg; ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(enemy.pos.x*CELL+5, enemy.pos.y*CELL+5);
            ctx.lineTo(enemy.pos.x*CELL+CELL-5, enemy.pos.y*CELL+CELL-5);
            ctx.moveTo(enemy.pos.x*CELL+CELL-5, enemy.pos.y*CELL+5);
            ctx.lineTo(enemy.pos.x*CELL+5, enemy.pos.y*CELL+CELL-5);
            ctx.stroke();
        });

        // Snake
        state.snake.forEach((seg, i) => {
            const isHead = i === 0;
            ctx.fillStyle = C.dark;
            ctx.fillRect(
                seg.x*CELL + (isHead ? 1 : 2),
                seg.y*CELL + (isHead ? 1 : 2),
                CELL - (isHead ? 2 : 4),
                CELL - (isHead ? 2 : 4)
            );
            // Body highlight
            if (!isHead) {
                ctx.fillStyle = C.mid;
                ctx.fillRect(seg.x*CELL+3, seg.y*CELL+3, 3, 3);
            }
            // Eyes on head
            if (isHead) {
                const d = state.dir;
                ctx.fillStyle = C.bg;
                if (d.x===1)  { ctx.fillRect(seg.x*CELL+14,seg.y*CELL+4,2,2); ctx.fillRect(seg.x*CELL+14,seg.y*CELL+10,2,2); }
                if (d.x===-1) { ctx.fillRect(seg.x*CELL+4, seg.y*CELL+4,2,2); ctx.fillRect(seg.x*CELL+4, seg.y*CELL+10,2,2); }
                if (d.y===-1) { ctx.fillRect(seg.x*CELL+4, seg.y*CELL+4,2,2); ctx.fillRect(seg.x*CELL+12,seg.y*CELL+4,2,2); }
                if (d.y===1)  { ctx.fillRect(seg.x*CELL+4, seg.y*CELL+14,2,2);ctx.fillRect(seg.x*CELL+12,seg.y*CELL+14,2,2);}
            }
        });

        // Overlays
        const overlay = (fn: () => void) => {
            ctx.fillStyle = "rgba(15,56,15,0.78)"; ctx.fillRect(0, 0, W, H);
            ctx.textAlign = "center"; fn(); ctx.textAlign = "left";
        };

        if (state.phase === "start") {
            overlay(() => {
                ctx.fillStyle = C.bg; ctx.font = "bold 20px monospace";
                ctx.fillText("SNAKE", W/2, H/2-30);
                ctx.font = "11px monospace"; ctx.fillStyle = C.mid;
                ctx.fillText("AVOID ✕ ENEMIES & YOURSELF", W/2, H/2-8);
                ctx.fillText("★ = 30 BONUS PTS", W/2, H/2+8);
                ctx.fillText("WALLS WRAP AROUND", W/2, H/2+24);
                ctx.fillStyle = C.bg; ctx.font = "bold 12px monospace";
                ctx.fillText("PRESS ANY KEY TO START", W/2, H/2+48);
            });
        } else if (state.phase === "over") {
            overlay(() => {
                ctx.fillStyle = C.bg; ctx.font = "bold 18px monospace";
                ctx.fillText("GAME OVER", W/2, H/2-34);
                ctx.font = "13px monospace"; ctx.fillStyle = C.mid;
                ctx.fillText(`SCORE: ${state.score}`, W/2, H/2-10);
                if (state.newBest) { ctx.fillStyle = "#EAB308"; ctx.fillText("✦ NEW BEST! ✦", W/2, H/2+10); }
                ctx.fillStyle = C.mid; ctx.font = "11px monospace";
                ctx.fillText(`BEST: ${state.best}`, W/2, H/2+28);
                ctx.fillStyle = C.bg; ctx.font = "bold 12px monospace";
                ctx.fillText("PRESS ANY KEY TO RETRY", W/2, H/2+52);
            });
        } else if (state.paused) {
            overlay(() => {
                ctx.fillStyle = C.bg; ctx.font = "bold 18px monospace";
                ctx.fillText("PAUSED", W/2, H/2-8);
                ctx.font = "11px monospace"; ctx.fillStyle = C.mid;
                ctx.fillText("SPACE TO RESUME", W/2, H/2+14);
            });
        } else if (!state.hasInput) {
            // Subtle "press a key" hint
            ctx.fillStyle = "rgba(15,56,15,0.5)"; ctx.fillRect(0, H-28, W, 28);
            ctx.fillStyle = C.bg; ctx.font = "11px monospace"; ctx.textAlign = "center";
            ctx.fillText("PRESS AN ARROW KEY TO MOVE", W/2, H-10);
            ctx.textAlign = "left";
        }
    }

    const moveDir = (dx: number, dy: number) => {
        const state = g.current;
        if (state.phase === "start" || state.phase === "over") { reset(); return; }
        const cur = state.dir;
        const d: Dir = { x: dx, y: dy };
        if (!(d.x === -cur.x && d.y === -cur.y) || !state.hasInput) {
            state.nextDir = d;
            state.hasInput = true;
        }
    };

    // Touch swipe on canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        let start: { x: number; y: number } | null = null;

        const onTouchStart = (e: TouchEvent) => {
            e.preventDefault();
            start = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        };
        const onTouchEnd = (e: TouchEvent) => {
            if (!start) return;
            e.preventDefault();
            const dx = e.changedTouches[0].clientX - start.x;
            const dy = e.changedTouches[0].clientY - start.y;
            start = null;
            if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
                const state = g.current;
                if (state.phase === "start" || state.phase === "over") reset();
                return;
            }
            if (Math.abs(dx) > Math.abs(dy)) moveDir(dx > 0 ? 1 : -1, 0);
            else moveDir(0, dy > 0 ? 1 : -1);
        };

        canvas.addEventListener("touchstart", onTouchStart, { passive: false });
        canvas.addEventListener("touchend", onTouchEnd, { passive: false });
        return () => {
            canvas.removeEventListener("touchstart", onTouchStart);
            canvas.removeEventListener("touchend", onTouchEnd);
        };
    }, [reset]);

    const { wrapRef, scale } = useCanvasScale(W, H);

    return (
        <div className="bg-[#1a1a1a] text-white flex flex-col" style={{ height: "100dvh", overflow: "hidden" }}>
            <Navbar />
            <div className="flex flex-col items-center flex-1 min-h-0 py-2 px-3" style={{ gap: 6 }}>

                {/* HUD */}
                <div className="flex gap-8 font-mono flex-shrink-0">
                    {[
                        { label: "LVL",   value: 0, getValue: () => g.current.level },
                        { label: "SCORE", value: 0, getValue: () => g.current.score },
                        { label: "BEST",  value: 0, getValue: () => g.current.best },
                    ].map(s => (
                        <HudItem key={s.label} label={s.label} stateRef={g} field={
                            s.label === "LVL" ? "level" : s.label === "SCORE" ? "score" : "best"
                        } />
                    ))}
                </div>

                {/* Canvas — scales to fill remaining space on both axes */}
                <div ref={wrapRef} className="flex-1 min-h-0 w-full flex items-center justify-center">
                    <canvas ref={canvasRef} width={W} height={H}
                            style={{
                                width: W * scale,
                                height: H * scale,
                                display: "block",
                                border: `4px solid ${C.dark}`,
                                borderRadius: 3,
                                boxShadow: `inset 3px 3px 0 ${C.light}, inset -3px -3px 0 ${C.mid}, 0 8px 24px rgba(0,0,0,0.7)`,
                            }} />
                </div>

                {/* Enemy count */}
                <div className="font-mono text-xs flex-shrink-0" style={{ color: "#555" }}>
                    ENEMIES: <span style={{ color: "#ef4444" }}>
            {"✕ ".repeat(Math.min(g.current.enemies.length, 6))}
          </span>
                </div>

                {/* D-pad */}
                <div className="grid grid-cols-3 flex-shrink-0" style={{ gap: 6 }}>
                    <div />
                    <button onClick={() => moveDir(0,-1)}
                            className="p-4 sm:p-3.5 font-bold text-xl sm:text-base transition active:scale-95 touch-manipulation"
                            style={{ background: C.dark, color: C.bg, border: `2px solid ${C.mid}`, borderRadius: 3 }}>▲</button>
                    <div />
                    <button onClick={() => moveDir(-1,0)}
                            className="p-4 sm:p-3.5 font-bold text-xl sm:text-base transition active:scale-95 touch-manipulation"
                            style={{ background: C.dark, color: C.bg, border: `2px solid ${C.mid}`, borderRadius: 3 }}>◀</button>
                    <div style={{ background: C.dark, border: `2px solid ${C.mid}`, borderRadius: 3 }} />
                    <button onClick={() => moveDir(1,0)}
                            className="p-4 sm:p-3.5 font-bold text-xl sm:text-base transition active:scale-95 touch-manipulation"
                            style={{ background: C.dark, color: C.bg, border: `2px solid ${C.mid}`, borderRadius: 3 }}>▶</button>
                    <div />
                    <button onClick={() => moveDir(0,1)}
                            className="p-4 sm:p-3.5 font-bold text-xl sm:text-base transition active:scale-95 touch-manipulation"
                            style={{ background: C.dark, color: C.bg, border: `2px solid ${C.mid}`, borderRadius: 3 }}>▼</button>
                    <div />
                </div>

                <p className="text-xs font-mono flex-shrink-0" style={{ color: "#444" }}>
                    WASD / ARROWS · SPACE = PAUSE · SWIPE ON CANVAS
                </p>
            </div>
        </div>
    );
}

// Simple live HUD display using requestAnimationFrame read
function HudItem({ label, stateRef, field }: {
    label: string;
    stateRef: React.MutableRefObject<any>;
    field: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        let raf: number;
        const update = () => {
            if (ref.current) ref.current.textContent = String(stateRef.current[field]);
            raf = requestAnimationFrame(update);
        };
        raf = requestAnimationFrame(update);
        return () => cancelAnimationFrame(raf);
    }, [stateRef, field]);
    return (
        <div className="text-center">
            <div className="text-xs" style={{ color: "#555" }}>{label}</div>
            <div ref={ref} className="text-xl font-bold" style={{ color: "#EAB308" }}>0</div>
        </div>
    );
}