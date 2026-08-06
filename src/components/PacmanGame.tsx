import React, { useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { useCanvasScale } from "@/hooks/useCanvasScale";
import { useSEO } from "@/hooks/useSEO";

const T = 28;
const COLS = 19;
const ROWS = 21;
const W = T * COLS;
const H = T * ROWS;
const WALL = 1, PELLET = 2, POWER = 3;

// Verified: all spawn positions are non-wall cells
const PLAYER_START = { x: 9, y: 16 };   // (9,16) = 2 ✓
const GHOST_STARTS = [
    { x: 9,  y: 9  },  // (9,9)  = 0 ✓
    { x: 9,  y: 8  },  // (9,8)  = 0 ✓
    { x: 8,  y: 10 },  // (8,10) = 0 ✓
    { x: 10, y: 10 },  // (10,10)= 0 ✓
];

const MAZE_TEMPLATE = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,3,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,3,1],
    [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
    [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
    [1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1],
    [0,0,1,1,2,1,0,0,0,0,0,0,0,1,2,1,1,0,0],
    [1,1,1,1,2,1,0,1,1,0,1,1,0,1,2,1,1,1,1],
    [0,0,0,0,2,0,0,1,0,0,0,1,0,0,2,0,0,0,0],
    [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
    [0,0,1,1,2,1,0,0,0,0,0,0,0,1,2,1,1,0,0],
    [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
    [1,3,2,1,2,2,2,2,2,2,2,2,2,2,2,1,2,3,1],
    [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
    [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

type Pos = { x: number; y: number };
type Dir = { x: number; y: number };
const DIRS: Dir[] = [{ x:1,y:0 },{ x:-1,y:0 },{ x:0,y:1 },{ x:0,y:-1 }];
const GHOST_COLORS = ["#ef4444","#ec4899","#06b6d4","#f97316"];

interface Ghost { x: number; y: number; vx: number; vy: number; dir: Dir; frightened: number; eaten: boolean; }

const freshMaze = () => MAZE_TEMPLATE.map(r => [...r]);
const countDots = (m: number[][]) => m.flat().filter(v => v === PELLET || v === POWER).length;
const canMove = (m: number[][], x: number, y: number) =>
    x >= 0 && x < COLS && y >= 0 && y < ROWS && m[y][x] !== WALL;

// Simple BFS - returns first step toward target
function bfs(maze: number[][], from: Pos, to: Pos): Dir | null {
    if (from.x === to.x && from.y === to.y) return null;
    const visited = new Set<string>();
    const queue: { pos: Pos; first: Dir }[] = [];
    visited.add(`${from.x},${from.y}`);

    for (const d of DIRS) {
        const nx = from.x + d.x, ny = from.y + d.y;
        if (canMove(maze, nx, ny) && !visited.has(`${nx},${ny}`)) {
            visited.add(`${nx},${ny}`);
            queue.push({ pos: { x: nx, y: ny }, first: d });
        }
    }

    while (queue.length) {
        const { pos, first } = queue.shift()!;
        if (pos.x === to.x && pos.y === to.y) return first;
        for (const d of DIRS) {
            const nx = pos.x + d.x, ny = pos.y + d.y;
            const key = `${nx},${ny}`;
            if (canMove(maze, nx, ny) && !visited.has(key)) {
                visited.add(key);
                queue.push({ pos: { x: nx, y: ny }, first });
            }
        }
    }
    return null;
}

export default function PacmanGame() {
    useSEO("Pacman – Yassine Jdair", "Eat the dots, dodge the ghosts. A browser Pacman game built from scratch.", "/pacmangame");
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const s = useRef({
        maze: freshMaze(),
        px: PLAYER_START.x, py: PLAYER_START.y,
        vx: PLAYER_START.x, vy: PLAYER_START.y,  // visual (sub-tile) position
        dir: { x: 0, y: 0 } as Dir,
        nextDir: { x: 0, y: 0 } as Dir,
        hasInput: false,
        mouth: 0,
        ghosts: GHOST_STARTS.map(p => ({ ...p, vx: p.x, vy: p.y, dir: DIRS[0], frightened: 0, eaten: false })) as Ghost[],
        score: 0, lives: 3, level: 1,
        dots: countDots(MAZE_TEMPLATE),
        phase: "start" as "start"|"playing"|"dead"|"win"|"gameover",
        frame: 0,
        deadTimer: 0,
        best: Number(localStorage.getItem("pm-best") || 0),
    });
    const raf = useRef(0);
    const [, tick] = React.useState(0);
    const ui = s.current;

    const reset = useCallback((full = false) => {
        const g = s.current;
        if (full) { g.score = 0; g.lives = 3; g.level = 1; }
        g.maze = freshMaze();
        g.dots = countDots(MAZE_TEMPLATE);
        g.px = PLAYER_START.x; g.py = PLAYER_START.y;
        g.vx = PLAYER_START.x; g.vy = PLAYER_START.y;  // snap visual on reset
        g.dir = { x: 0, y: 0 }; g.nextDir = { x: 0, y: 0 }; g.hasInput = false;
        g.mouth = 0; g.frame = 0; g.deadTimer = 0; g.phase = "playing";
        g.ghosts = GHOST_STARTS.map((p, i) => ({ ...p, vx: p.x, vy: p.y, dir: DIRS[i % 4], frightened: 0, eaten: false }));
        tick(n => n + 1);
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
            const g = s.current;
            if (g.phase === "start" || g.phase === "gameover") { reset(true); return; }
            if (g.phase === "win") { g.level++; reset(false); return; }
            if (g.phase === "dead") { if (g.deadTimer <= 0 && g.lives > 0) { reset(false); } return; }
            const map: Record<string, Dir> = {
                ArrowRight:{x:1,y:0}, d:{x:1,y:0},
                ArrowLeft:{x:-1,y:0}, a:{x:-1,y:0},
                ArrowDown:{x:0,y:1}, s:{x:0,y:1},
                ArrowUp:{x:0,y:-1}, w:{x:0,y:-1},
            };
            if (map[e.key]) { g.nextDir = map[e.key]; g.hasInput = true; }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [reset]);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;

        const drawGhost = (gx: number, gy: number, color: string, fright: boolean, flash: boolean) => {
            const cx = gx * T + T / 2, cy = gy * T + T / 2 - 1, r = T / 2 - 3;
            const c = fright ? (flash ? "#fff" : "#1d4ed8") : color;
            ctx.fillStyle = c;
            // body
            ctx.beginPath();
            ctx.arc(cx, cy, r, Math.PI, 0);
            const base = cy + r;
            ctx.lineTo(cx + r, base + 3);
            const segs = 3;
            for (let i = 0; i < segs; i++) {
                const bx = cx + r - (r * 2 / segs) * (i + 0.5);
                ctx.arc(bx, base + 3, r / segs, 0, Math.PI, true);
            }
            ctx.lineTo(cx - r, base + 3);
            ctx.closePath(); ctx.fill();
            // eyes
            if (!fright) {
                ctx.fillStyle = "#fff";
                ctx.beginPath(); ctx.arc(cx - 5, cy - 2, 4, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx + 5, cy - 2, 4, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#1e40af";
                ctx.beginPath(); ctx.arc(cx - 4, cy - 2, 2, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx + 6, cy - 2, 2, 0, Math.PI * 2); ctx.fill();
            } else {
                // scared face
                ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(cx - 5, cy); ctx.lineTo(cx - 2, cy + 3);
                ctx.lineTo(cx + 1, cy); ctx.lineTo(cx + 4, cy + 3); ctx.lineTo(cx + 7, cy);
                ctx.stroke();
            }
        };

        const loop = () => {
            raf.current = requestAnimationFrame(loop);
            const g = s.current;

            // ── Smooth movement: interpolate visual positions ──
            const PLAYER_SPD = 1 / 10;
            const vizSpeedMult = Math.max(0.5, 1 - (g.level - 1) * 0.1);
            const GHOST_SPDS = [36, 42, 48, 54].map(n => 1 / Math.round(n * vizSpeedMult));

            const lerpAxis = (v: number, target: number, spd: number, wrap: number) => {
                let d = target - v;
                if (Math.abs(d) > wrap / 2) d = d > 0 ? d - wrap : d + wrap; // handle tunnel wrap
                if (Math.abs(d) <= spd) return target;
                return ((v + Math.sign(d) * spd) + wrap) % wrap;
            };
            g.vx = lerpAxis(g.vx, g.px, PLAYER_SPD, COLS);
            g.vy = lerpAxis(g.vy, g.py, PLAYER_SPD, ROWS);
            g.ghosts.forEach((gh, i) => {
                const spd = GHOST_SPDS[i] ?? GHOST_SPDS[0];
                gh.vx = lerpAxis(gh.vx, gh.x, spd, COLS);
                gh.vy = lerpAxis(gh.vy, gh.y, spd, ROWS);
            });

            // ── Draw maze ──
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, W, H);

            for (let r2 = 0; r2 < ROWS; r2++) {
                for (let c2 = 0; c2 < COLS; c2++) {
                    const v = g.maze[r2][c2];
                    if (v === WALL) {
                        ctx.fillStyle = "#1e3a8a";
                        ctx.fillRect(c2*T, r2*T, T, T);
                        // inner glow border
                        ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 1;
                        ctx.strokeRect(c2*T+1, r2*T+1, T-2, T-2);
                    } else if (v === PELLET) {
                        ctx.fillStyle = "#fde68a";
                        ctx.beginPath(); ctx.arc(c2*T+T/2, r2*T+T/2, 3, 0, Math.PI*2); ctx.fill();
                    } else if (v === POWER) {
                        if (Math.floor(g.frame / 12) % 2 === 0) {
                            ctx.fillStyle = "#fbbf24"; ctx.shadowBlur = 10; ctx.shadowColor = "#fbbf24";
                            ctx.beginPath(); ctx.arc(c2*T+T/2, r2*T+T/2, 7, 0, Math.PI*2); ctx.fill();
                            ctx.shadowBlur = 0;
                        }
                    }
                }
            }

            // ── Overlays ──
            if (g.phase !== "playing") {
                ctx.fillStyle = "rgba(0,0,0,0.75)"; ctx.fillRect(0, 0, W, H);
                ctx.textAlign = "center";
                if (g.phase === "start") {
                    ctx.fillStyle = "#facc15"; ctx.font = "bold 22px sans-serif"; ctx.fillText("👻 PAC-MAN", W/2, H/2-44);
                    ctx.fillStyle = "#9ca3af"; ctx.font = "12px sans-serif";
                    ctx.fillText("Eat all pellets to win", W/2, H/2-18);
                    ctx.fillText("Power pellets make ghosts edible!", W/2, H/2-1);
                    ctx.fillStyle = "#fbbf24"; ctx.font = "bold 14px sans-serif";
                    ctx.fillText("▶  Press any key or tap START", W/2, H/2+34);
                } else if (g.phase === "dead") {
                    ctx.fillStyle = "#ef4444"; ctx.font = "bold 22px sans-serif"; ctx.fillText("💀 CAUGHT!", W/2, H/2-10);
                    ctx.fillStyle = "#d1d5db"; ctx.font = "13px sans-serif";
                    ctx.fillText(g.lives > 0 ? `${g.lives} ${g.lives === 1 ? "life" : "lives"} remaining…` : "No lives left", W/2, H/2+16);
                    g.deadTimer = Math.max(0, g.deadTimer - 1);
                } else if (g.phase === "win") {
                    ctx.fillStyle = "#22c55e"; ctx.font = "bold 22px sans-serif"; ctx.fillText("🎉 LEVEL COMPLETE!", W/2, H/2-10);
                    ctx.fillStyle = "#fbbf24"; ctx.font = "13px sans-serif"; ctx.fillText("Press any key for next level", W/2, H/2+16);
                } else if (g.phase === "gameover") {
                    ctx.fillStyle = "#ef4444"; ctx.font = "bold 24px sans-serif"; ctx.fillText("GAME OVER", W/2, H/2-40);
                    ctx.fillStyle = "#fff"; ctx.font = "15px sans-serif"; ctx.fillText(`Score: ${g.score}`, W/2, H/2-12);
                    if (g.score > 0 && g.score >= g.best) { ctx.fillStyle = "#fbbf24"; ctx.font = "bold 12px sans-serif"; ctx.fillText("✦ NEW BEST! ✦", W/2, H/2+10); }
                    ctx.fillStyle = "#9ca3af"; ctx.font = "13px sans-serif"; ctx.fillText("Press any key to play again", W/2, H/2+38);
                }
                ctx.textAlign = "left";

                // Still draw entities in non-playing phases
                if (g.phase !== "start") {
                    g.ghosts.forEach((gh, i) => {
                        if (!gh.eaten) drawGhost(gh.vx, gh.vy, GHOST_COLORS[i], gh.frightened > 0, gh.frightened < 60 && Math.floor(g.frame/8)%2===0);
                    });
                    // Pacman
                    const mA = (Math.sin(g.frame * 0.3) + 1) * 0.2;
                    const angle = Math.atan2(g.dir.y, g.dir.x);
                    ctx.fillStyle = "#facc15";
                    ctx.beginPath();
                    ctx.moveTo(g.vx*T+T/2, g.vy*T+T/2);
                    ctx.arc(g.vx*T+T/2, g.vy*T+T/2, T/2-2, angle+mA, angle+Math.PI*2-mA);
                    ctx.closePath(); ctx.fill();
                }
                return;
            }

            // ── Draw ghosts ──
            g.ghosts.forEach((gh, i) => {
                if (gh.eaten) {
                    // just eyes drifting home
                    ctx.fillStyle = "#fff";
                    ctx.beginPath(); ctx.arc(gh.vx*T+T/2-4, gh.vy*T+T/2, 3, 0, Math.PI*2); ctx.fill();
                    ctx.beginPath(); ctx.arc(gh.vx*T+T/2+4, gh.vy*T+T/2, 3, 0, Math.PI*2); ctx.fill();
                    ctx.fillStyle = "#1e40af";
                    ctx.beginPath(); ctx.arc(gh.vx*T+T/2-3, gh.vy*T+T/2, 1.5, 0, Math.PI*2); ctx.fill();
                    ctx.beginPath(); ctx.arc(gh.vx*T+T/2+5, gh.vy*T+T/2, 1.5, 0, Math.PI*2); ctx.fill();
                } else {
                    const flash = gh.frightened > 0 && gh.frightened < 60 && Math.floor(g.frame/8)%2===0;
                    drawGhost(gh.vx, gh.vy, GHOST_COLORS[i], gh.frightened > 0, flash);
                }
            });

            // ── Draw Pacman ──
            const mA = (Math.sin(g.frame * 0.3) + 1) * 0.2;
            const angle = Math.atan2(g.dir.y, g.dir.x);
            ctx.fillStyle = "#facc15";
            ctx.shadowBlur = 6; ctx.shadowColor = "#facc15";
            ctx.beginPath();
            ctx.moveTo(g.vx*T+T/2, g.vy*T+T/2);
            ctx.arc(g.vx*T+T/2, g.vy*T+T/2, T/2-2, angle+mA, angle+Math.PI*2-mA);
            ctx.closePath(); ctx.fill();
            ctx.shadowBlur = 0;

            // ── Game logic ──
            g.frame++;
            g.ghosts.forEach(gh => { if (gh.frightened > 0) gh.frightened--; });

            // Player only moves after first keypress, every 10 frames
            if (g.hasInput && g.frame % 10 === 0) {
                // Try queued direction first
                const nd = g.nextDir;
                if (canMove(g.maze, g.px + nd.x, g.py + nd.y)) g.dir = nd;
                // Move in current direction
                const nx = g.px + g.dir.x, ny = g.py + g.dir.y;
                if (canMove(g.maze, nx, ny)) {
                    // Tunnel wrap
                    g.px = (nx + COLS) % COLS;
                    g.py = (ny + ROWS) % ROWS;
                }
                // Eat
                const cell = g.maze[g.py][g.px];
                if (cell === PELLET) {
                    g.maze[g.py][g.px] = 0; g.score += 10; g.dots--;
                    tick(n => n + 1);
                }
                if (cell === POWER) {
                    g.maze[g.py][g.px] = 0; g.score += 50; g.dots--;
                    g.ghosts.forEach(gh => { if (!gh.eaten) { gh.frightened = 300; } });
                    tick(n => n + 1);
                }
            }

            // Ghost speed scales with level — each level reduces interval by 10%, min 50%
            const speedMult = Math.max(0.5, 1 - (g.level - 1) * 0.1);
            const GHOST_INTERVALS = [36, 42, 48, 54].map(n => Math.round(n * speedMult));
            if (!g.hasInput) return; // ghosts frozen until player moves
            g.ghosts.forEach((gh, idx) => {
                if (g.frame % GHOST_INTERVALS[idx] !== 0) return;

                // Scatter to corners for first 80 frames (gives player breathing room)
                const scatter = g.frame < 80;
                const SCATTER_TARGETS: Pos[] = [
                    { x: COLS-1, y: 0 },    // Blinky → top-right
                    { x: 0,      y: 0 },    // Pinky  → top-left
                    { x: COLS-1, y: ROWS-1 },// Inky  → bottom-right
                    { x: 0,      y: ROWS-1 },// Clyde → bottom-left
                ];

                let target: Pos;
                if (gh.eaten) {
                    target = { x: GHOST_STARTS[idx].x, y: GHOST_STARTS[idx].y };
                } else if (gh.frightened > 0) {
                    // Flee to opposite side of the maze from player
                    target = { x: COLS - 1 - g.px, y: ROWS - 1 - g.py };
                } else if (scatter) {
                    target = SCATTER_TARGETS[idx];
                } else {
                    // Each ghost has a unique chase strategy
                    switch (idx) {
                        case 0: // Blinky — direct chase
                            target = { x: g.px, y: g.py };
                            break;
                        case 1: // Pinky — targets 4 tiles ahead of Pac-Man
                            target = { x: g.px + g.dir.x * 4, y: g.py + g.dir.y * 4 };
                            break;
                        case 2: // Inky — targets the opposite corner from Blinky's position
                            target = {
                                x: g.px + (g.px - g.ghosts[0].x),
                                y: g.py + (g.py - g.ghosts[0].y),
                            };
                            break;
                        case 3: // Clyde — chases directly when far (>8), scatters when close
                        default:
                            target = Math.abs(gh.x - g.px) + Math.abs(gh.y - g.py) > 8
                                ? { x: g.px, y: g.py }
                                : SCATTER_TARGETS[3];
                            break;
                    }
                }

                // Clamp target inside maze
                target.x = Math.max(0, Math.min(COLS - 1, target.x));
                target.y = Math.max(0, Math.min(ROWS - 1, target.y));

                // 60% BFS, 40% random — prevents perfect convergence
                let moved = false;
                if (Math.random() < 0.60) {
                    const d = bfs(g.maze, { x: gh.x, y: gh.y }, target);
                    if (d && canMove(g.maze, gh.x + d.x, gh.y + d.y)) {
                        gh.x += d.x; gh.y += d.y; gh.dir = d; moved = true;
                    }
                }
                if (!moved) {
                    // Random valid move, prefer not reversing direction
                    const valid = DIRS.filter(d =>
                        canMove(g.maze, gh.x + d.x, gh.y + d.y) &&
                        !(d.x === -gh.dir.x && d.y === -gh.dir.y)
                    );
                    const fallback = valid.length
                        ? valid
                        : DIRS.filter(d => canMove(g.maze, gh.x + d.x, gh.y + d.y));
                    if (fallback.length) {
                        const d = fallback[Math.floor(Math.random() * fallback.length)];
                        gh.x += d.x; gh.y += d.y; gh.dir = d;
                    }
                }

                // Reset eaten ghost once it reaches home
                if (gh.eaten && gh.x === GHOST_STARTS[idx].x && gh.y === GHOST_STARTS[idx].y) {
                    gh.eaten = false;
                }
            });

            // ── Collision ──
            g.ghosts.forEach(gh => {
                if (gh.eaten) return;
                if (gh.x !== g.px || gh.y !== g.py) return;
                if (gh.frightened > 0) {
                    gh.eaten = true; gh.frightened = 0;
                    g.score += 200;
                    tick(n => n + 1);
                } else {
                    g.lives--;
                    g.deadTimer = 90;
                    if (g.lives <= 0) {
                        g.phase = "gameover";
                        if (g.score > g.best) { g.best = g.score; localStorage.setItem("pm-best", String(g.score)); }
                    } else {
                        g.phase = "dead";
                    }
                    tick(n => n + 1);
                }
            });

            // Win
            if (g.dots <= 0) { g.phase = "win"; tick(n => n + 1); }
        };

        raf.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf.current);
    }, [reset]);

    const handleClick = () => {
        const g = s.current;
        if (g.phase === "start" || g.phase === "gameover") { reset(true); return; }
        if (g.phase === "win") { g.level++; reset(false); return; }
        if (g.phase === "dead" && g.deadTimer <= 0 && g.lives > 0) { reset(false); }
    };

    const { wrapRef, scale } = useCanvasScale(W, H);

    return (
        <div className="bg-[#1a1a1a] text-white flex flex-col" style={{ height: "100dvh", overflow: "hidden" }}>
            <Navbar />
            <div className="flex flex-col items-center flex-1 min-h-0 py-2 px-3" style={{ gap: 6 }}>
                {/* HUD */}
                <div className="flex gap-6 font-mono flex-shrink-0">
                    <div className="text-center"><div className="text-gray-500 text-xs">SCORE</div><div className="text-yellow-400 text-xl font-bold">{ui.score}</div></div>
                    <div className="text-center"><div className="text-gray-500 text-xs">LIVES</div><div className="text-xl">{Array.from({length:ui.lives},(_,i)=><span key={i}>🟡</span>)}{Array.from({length:Math.max(0,3-ui.lives)},(_,i)=><span key={i} className="opacity-20">🟡</span>)}</div></div>
                    <div className="text-center"><div className="text-gray-500 text-xs">LEVEL</div><div className="text-blue-400 text-xl font-bold">{ui.level}</div></div>
                    <div className="text-center"><div className="text-gray-500 text-xs">BEST</div><div className="text-green-400 text-xl font-bold">{ui.best}</div></div>
                </div>

                {/* Canvas — fills remaining space, constrained on both axes */}
                <div ref={wrapRef} className="flex-1 min-h-0 w-full flex items-center justify-center">
                    <canvas ref={canvasRef} width={W} height={H} onClick={handleClick}
                            style={{ width: W * scale, height: H * scale, display: "block", borderRadius: 10, boxShadow: "0 6px 24px rgba(0,0,0,0.8)", cursor: "pointer" }} />
                </div>

                {/* D-pad */}
                <div className="grid grid-cols-3 flex-shrink-0" style={{ gap: 6 }}>
                    <div />
                    <button onClick={() => { s.current.nextDir={x:0,y:-1}; s.current.hasInput=true; }} className="p-4 bg-[#2a2a2a] border-2 border-[#3a3a3a] hover:border-yellow-500 rounded-xl text-xl font-bold transition active:scale-90 touch-manipulation">▲</button>
                    <div />
                    <button onClick={() => { s.current.nextDir={x:-1,y:0}; s.current.hasInput=true; }} className="p-4 bg-[#2a2a2a] border-2 border-[#3a3a3a] hover:border-yellow-500 rounded-xl text-xl font-bold transition active:scale-90 touch-manipulation">◀</button>
                    <button onClick={() => { s.current.nextDir={x:0,y:1}; s.current.hasInput=true; }} className="p-4 bg-[#2a2a2a] border-2 border-[#3a3a3a] hover:border-yellow-500 rounded-xl text-xl font-bold transition active:scale-90 touch-manipulation">▼</button>
                    <button onClick={() => { s.current.nextDir={x:1,y:0}; s.current.hasInput=true; }} className="p-4 bg-[#2a2a2a] border-2 border-[#3a3a3a] hover:border-yellow-500 rounded-xl text-xl font-bold transition active:scale-90 touch-manipulation">▶</button>
                </div>
                <p className="text-xs text-gray-600 font-mono flex-shrink-0">WASD / ARROWS · SWIPE · TAP TO START</p>
            </div>
        </div>
    );
}