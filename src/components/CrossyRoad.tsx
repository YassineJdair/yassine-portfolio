import React, { useEffect, useRef, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";

const TILE = 52;
const COLS = 13;
const ROWS = 11;
const W = TILE * COLS;
const H = TILE * ROWS;

type LaneType = "safe" | "road" | "water" | "train";

interface Lane {
    type: LaneType;
    color: string;
    speed: number;
    direction: 1 | -1;
    objects: { x: number; w: number }[];
    offset: number;
}

interface Particle {
    x: number; y: number; vx: number; vy: number; life: number; color: string; r: number;
}

const LANE_COLORS: Record<LaneType, string> = {
    safe: "#15803d",
    road: "#1f2937",
    water: "#1e40af",
    train: "#292524",
};

const STRIPE_COLOR = "#374151";
const GRASS_STRIPE = "#166534";

function makeLane(type: LaneType, level: number, i: number): Lane {
    const speedBase = 0.8 + level * 0.18;
    const dir = Math.random() > 0.5 ? 1 : -1;
    const objects: { x: number; w: number }[] = [];

    if (type === "safe") return { type, color: LANE_COLORS.safe, speed: 0, direction: 1, objects: [], offset: 0 };

    const count = type === "train" ? 1 : 2 + Math.floor(Math.random() * 3);
    const spacing = W / count;
    const objW = type === "water" ? TILE * 2.2 : type === "train" ? TILE * 3.5 : TILE * 1.6;

    for (let j = 0; j < count; j++) {
        objects.push({ x: j * spacing + Math.random() * 20 - 10, w: objW });
    }

    return {
        type,
        color: LANE_COLORS[type],
        speed: type === "train" ? speedBase * 3.5 : speedBase * (0.7 + Math.random() * 0.6),
        direction: dir,
        objects,
        offset: 0,
    };
}

function buildWorld(level: number): Lane[] {
    const lanes: Lane[] = [];
    lanes.push(makeLane("safe", level, 0)); // start
    for (let i = 1; i < ROWS - 1; i++) {
        const r = Math.random();
        if (i % 4 === 0) lanes.push(makeLane("safe", level, i));
        else if (r < 0.15 && level > 1) lanes.push(makeLane("train", level, i));
        else if (r < 0.45) lanes.push(makeLane("water", level, i));
        else lanes.push(makeLane("road", level, i));
    }
    lanes.push(makeLane("safe", level, ROWS - 1)); // finish
    return lanes;
}

// ── Draw helpers ────────────────────────────────────────────────
const drawCar = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, dir: number) => {
    const colors = ["#ef4444","#f97316","#8b5cf6","#ec4899","#0ea5e9","#10b981"];
    const col = colors[Math.abs(Math.floor(x / 60)) % colors.length];
    const h2 = TILE - 8;
    ctx.save();
    if (dir === -1) { ctx.scale(-1, 1); ctx.translate(-x * 2 - w, 0); }
    // body
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.roundRect(x + 2, y + 4, w - 4, h2, 5); ctx.fill();
    // roof
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath(); ctx.roundRect(x + 8, y + 10, w - 16, h2 - 18, 4); ctx.fill();
    // windows
    ctx.fillStyle = "rgba(147,197,253,0.7)";
    ctx.beginPath(); ctx.roundRect(x + 10, y + 11, w - 20, h2 - 22, 3); ctx.fill();
    // lights
    ctx.fillStyle = "#fef08a"; ctx.shadowBlur = 6; ctx.shadowColor = "#fef08a";
    ctx.fillRect(x + w - 8, y + 8, 5, 5);
    ctx.fillRect(x + w - 8, y + h2 - 5, 5, 5);
    ctx.shadowBlur = 0;
    ctx.restore();
};

const drawLog = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number) => {
    ctx.fillStyle = "#92400e";
    ctx.beginPath(); ctx.roundRect(x + 2, y + 10, w - 4, TILE - 20, 8); ctx.fill();
    ctx.fillStyle = "#a16207";
    for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.ellipse(x + w / 2, y + 10 + i * ((TILE - 20) / 3) + 6, (w - 8) / 2, 4, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = "#78350f"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(x + 2, y + 10, w - 4, TILE - 20, 8); ctx.stroke();
};

const drawTrain = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, dir: number) => {
    ctx.save();
    if (dir === -1) { ctx.scale(-1, 1); ctx.translate(-x * 2 - w, 0); }
    ctx.fillStyle = "#dc2626";
    ctx.beginPath(); ctx.roundRect(x, y + 4, w, TILE - 8, 4); ctx.fill();
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(x + 4, y + 10, 12, TILE - 20);
    for (let i = 0; i < 3; i++) {
        ctx.fillStyle = "rgba(147,197,253,0.8)";
        ctx.fillRect(x + 22 + i * 20, y + 12, 14, TILE - 24);
    }
    ctx.fillStyle = "#f97316"; ctx.shadowBlur = 10; ctx.shadowColor = "#f97316";
    ctx.beginPath(); ctx.arc(x + w - 6, y + TILE / 2, 5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
};

const drawChicken = (ctx: CanvasRenderingContext2D, x: number, y: number, hop: number, dead: boolean, facingLeft: boolean) => {
    const cx = x * TILE + TILE / 2;
    const cy = y * TILE + TILE / 2 - hop * 6;
    ctx.save();
    if (facingLeft) { ctx.scale(-1, 1); ctx.translate(-cx * 2, 0); }
    if (dead) ctx.globalAlpha = 0.5;
    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath(); ctx.ellipse(cx, y * TILE + TILE - 4, 12, 4, 0, 0, Math.PI * 2); ctx.fill();
    // body
    ctx.fillStyle = "#fef9c3";
    ctx.beginPath(); ctx.ellipse(cx, cy + 4, 13, 11, 0, 0, Math.PI * 2); ctx.fill();
    // head
    ctx.beginPath(); ctx.arc(cx + 8, cy - 8, 8, 0, Math.PI * 2); ctx.fill();
    // eye
    ctx.fillStyle = "#1e293b";
    ctx.beginPath(); ctx.arc(cx + 11, cy - 9, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(cx + 12, cy - 10, 0.8, 0, Math.PI * 2); ctx.fill();
    // beak
    ctx.fillStyle = "#f97316";
    ctx.beginPath(); ctx.moveTo(cx + 16, cy - 8); ctx.lineTo(cx + 20, cy - 6); ctx.lineTo(cx + 16, cy - 4); ctx.closePath(); ctx.fill();
    // comb
    ctx.fillStyle = "#ef4444";
    ctx.beginPath(); ctx.arc(cx + 7, cy - 16, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 10, cy - 18, 3, 0, Math.PI * 2); ctx.fill();
    // wing
    ctx.fillStyle = "#fde68a";
    ctx.beginPath(); ctx.ellipse(cx - 4, cy + 2, 7, 4, -0.4, 0, Math.PI * 2); ctx.fill();
    // legs when hopping
    if (hop > 0.3) {
        ctx.strokeStyle = "#f97316"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx - 4, cy + 12); ctx.lineTo(cx - 8, cy + 18); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + 4, cy + 12); ctx.lineTo(cx + 8, cy + 18); ctx.stroke();
    }
    ctx.restore();
};

const drawTree = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = "#92400e";
    ctx.fillRect(x + 20, y + 28, 12, 22);
    ctx.fillStyle = "#15803d";
    ctx.beginPath(); ctx.arc(x + 26, y + 20, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#16a34a";
    ctx.beginPath(); ctx.arc(x + 26, y + 16, 11, 0, Math.PI * 2); ctx.fill();
};

// ────────────────────────────────────────────────────────────────

export default function CrossyRoad() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stateRef = useRef({
        px: Math.floor(COLS / 2), py: ROWS - 1,
        hop: 0, facingLeft: false,
        driftX: 0,  // sub-tile pixel drift when riding a log
        lanes: [] as Lane[],
        particles: [] as Particle[],
        lives: 3, score: 0, best: Number(localStorage.getItem("crossy-best") || 0),
        level: 1, phase: "start" as "start" | "playing" | "dead" | "levelup",
        deadTimer: 0, levelupTimer: 0,
        invincible: 0,
    });
    const rafRef = useRef(0);
    const [ui, setUi] = useState({ lives: 3, score: 0, best: 0, level: 1, phase: "start" as string });

    const syncUi = useCallback(() => {
        const s = stateRef.current;
        setUi({ lives: s.lives, score: s.score, best: s.best, level: s.level, phase: s.phase });
    }, []);

    const startLevel = useCallback((reset = false) => {
        const s = stateRef.current;
        if (reset) { s.lives = 3; s.score = 0; s.level = 1; }
        s.px = Math.floor(COLS / 2); s.py = ROWS - 1; s.driftX = 0;
        s.lanes = buildWorld(s.level);
        s.particles = []; s.phase = "playing"; s.hop = 0; s.invincible = 0;
        syncUi();
    }, [syncUi]);

    const splat = useCallback((x: number, y: number, type: "road" | "water") => {
        const s = stateRef.current;
        const colors = type === "water" ? ["#60a5fa","#93c5fd","#fff"] : ["#ef4444","#f97316","#fbbf24"];
        for (let i = 0; i < 16; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = 1 + Math.random() * 3;
            s.particles.push({ x: x * TILE + TILE / 2, y: y * TILE + TILE / 2, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd - 1, life: 30, color: colors[i % colors.length], r: 2 + Math.random() * 3 });
        }
    }, []);

    const die = useCallback((type: "road" | "water") => {
        const s = stateRef.current;
        if (s.invincible > 0) return;
        splat(s.px, s.py, type);
        s.lives--;
        s.phase = "dead";
        s.deadTimer = 80;
        if (s.lives <= 0 && s.score > s.best) { s.best = s.score; localStorage.setItem("crossy-best", String(s.score)); }
        syncUi();
    }, [splat, syncUi]);

    // Input
    const move = useCallback((dx: number, dy: number) => {
        const s = stateRef.current;
        if (s.phase !== "playing") return;
        const nx = Math.max(0, Math.min(COLS - 1, s.px + dx));
        const ny = Math.max(0, Math.min(ROWS - 1, s.py + dy));
        if (dx < 0) s.facingLeft = true;
        if (dx > 0) s.facingLeft = false;
        s.px = nx; s.py = ny; s.hop = 1;
        if (dy < 0) { s.score++; syncUi(); }
        if (ny === 0) { s.phase = "levelup"; s.levelupTimer = 90; s.level++; s.score += 5; syncUi(); }
    }, [syncUi]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
            const s = stateRef.current;
            if (s.phase === "start" || (s.phase === "dead" && s.lives <= 0)) { startLevel(s.phase === "start" || s.lives <= 0); return; }
            if (s.phase === "dead" && s.deadTimer <= 0) { startLevel(false); return; }
            if (s.phase === "levelup" && s.levelupTimer <= 0) { startLevel(false); return; }
            if (e.key === "ArrowUp") move(0, -1);
            if (e.key === "ArrowDown") move(0, 1);
            if (e.key === "ArrowLeft") move(-1, 0);
            if (e.key === "ArrowRight") move(1, 0);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [move, startLevel]);

    // Game loop
    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;

        const loop = () => {
            rafRef.current = requestAnimationFrame(loop);
            const s = stateRef.current;
            ctx.clearRect(0, 0, W, H);

            // ── Draw lanes ──
            for (let r = 0; r < ROWS; r++) {
                const lane = s.lanes[r];
                if (!lane) { ctx.fillStyle = LANE_COLORS.safe; ctx.fillRect(0, r * TILE, W, TILE); continue; }

                ctx.fillStyle = lane.color;
                ctx.fillRect(0, r * TILE, W, TILE);

                if (lane.type === "safe") {
                    // grass stripes
                    for (let c = 0; c < COLS; c += 2) {
                        ctx.fillStyle = GRASS_STRIPE;
                        ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
                    }
                    // trees on safe rows (not start/finish)
                    if (r !== 0 && r !== ROWS - 1) {
                        drawTree(ctx, 0, r * TILE);
                        drawTree(ctx, (COLS - 1) * TILE, r * TILE);
                    }
                }

                if (lane.type === "road") {
                    // lane markings
                    ctx.strokeStyle = STRIPE_COLOR; ctx.setLineDash([20, 20]); ctx.lineWidth = 2;
                    ctx.lineDashOffset = -lane.offset * lane.direction;
                    ctx.beginPath(); ctx.moveTo(0, r * TILE + TILE / 2); ctx.lineTo(W, r * TILE + TILE / 2); ctx.stroke();
                    ctx.setLineDash([]);
                }

                if (lane.type === "water") {
                    // ripples
                    for (let c = 0; c < COLS * 2; c++) {
                        const rx = ((c * 30 + lane.offset * lane.direction + W * 2) % (W + 40)) - 20;
                        ctx.strokeStyle = "rgba(96,165,250,0.3)"; ctx.lineWidth = 1.5;
                        ctx.beginPath(); ctx.arc(rx, r * TILE + TILE / 2, 8, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
                    }
                }

                if (lane.type === "train") {
                    // rails
                    ctx.strokeStyle = "#57534e"; ctx.lineWidth = 3; ctx.setLineDash([]);
                    [r * TILE + 14, r * TILE + TILE - 14].forEach(ry => {
                        ctx.beginPath(); ctx.moveTo(0, ry); ctx.lineTo(W, ry); ctx.stroke();
                    });
                    // sleepers
                    for (let c = 0; c <= COLS; c++) {
                        ctx.fillStyle = "#44403c"; ctx.fillRect(c * TILE - 4, r * TILE + 10, 8, TILE - 20);
                    }
                }

                // Draw objects
                if (s.phase === "playing" || s.phase === "dead" || s.phase === "levelup") {
                    lane.objects.forEach(obj => {
                        const totalW = W + obj.w + 40;
                        const ox = ((obj.x + lane.offset * lane.direction % totalW + totalW * 4) % totalW) - obj.w - 20;
                        const ry = r * TILE;
                        if (lane.type === "road") drawCar(ctx, ox, ry, obj.w, lane.direction);
                        else if (lane.type === "water") drawLog(ctx, ox, ry, obj.w);
                        else if (lane.type === "train") drawTrain(ctx, ox, ry, obj.w, lane.direction);
                    });
                }
            }

            // ── Update & collision (only when playing) ──
            if (s.phase === "playing") {
                s.hop = Math.max(0, s.hop - 0.12);
                if (s.invincible > 0) s.invincible--;

                // Move lanes
                s.lanes.forEach(lane => {
                    if (lane.speed > 0) lane.offset += lane.speed * 0.6;
                });

                // Collision check + log riding
                const lane = s.lanes[s.py];
                if (lane && lane.type !== "safe") {
                    let onLog = false;
                    let logSpeed = 0;
                    let logDir = 1;

                    lane.objects.forEach(obj => {
                        const totalW = W + obj.w + 40;
                        const ox = ((obj.x + lane.offset * lane.direction % totalW + totalW * 4) % totalW) - obj.w - 20;
                        // Use driftX to compute real pixel position of player
                        const px = s.px * TILE + TILE / 2 + s.driftX;

                        if (lane.type === "water") {
                            if (px >= ox + 4 && px <= ox + obj.w - 4) {
                                onLog = true;
                                logSpeed = lane.speed * 0.6;
                                logDir = lane.direction;
                            }
                        }
                        if ((lane.type === "road" || lane.type === "train") && px >= ox && px <= ox + obj.w) {
                            die("road");
                        }
                    });

                    if (lane.type === "water") {
                        if (!onLog) {
                            die("water");
                        } else {
                            // Ride the log — accumulate pixel drift
                            s.driftX += logSpeed * logDir;

                            // When drift crosses a tile boundary, shift tile position
                            while (s.driftX >= TILE / 2) { s.px += 1; s.driftX -= TILE; }
                            while (s.driftX <= -TILE / 2) { s.px -= 1; s.driftX += TILE; }

                            // Die if log carries player off screen
                            if (s.px < 0 || s.px >= COLS) die("water");
                        }
                    } else {
                        // Not water — reset drift
                        s.driftX = 0;
                    }
                } else {
                    // Safe lane — reset drift
                    s.driftX = 0;
                }
            }

            if (s.phase === "dead") {
                s.deadTimer--;
                if (s.deadTimer <= 0) {
                    if (s.lives > 0) { s.px = Math.floor(COLS / 2); s.py = ROWS - 1; s.driftX = 0; s.phase = "playing"; s.invincible = 60; }
                }
            }

            if (s.phase === "levelup") {
                s.levelupTimer--;
                if (s.levelupTimer <= 0) startLevel(false);
            }

            // Particles
            s.particles = s.particles.filter(p => p.life > 0);
            s.particles.forEach(p => {
                ctx.globalAlpha = p.life / 30;
                ctx.fillStyle = p.color;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
                p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life--;
            });
            ctx.globalAlpha = 1;

            // Draw chicken (offset by driftX for smooth log riding)
            if (s.phase !== "start") {
                const showChicken = s.phase !== "dead" || Math.floor(s.deadTimer / 6) % 2 === 0;
                if (showChicken) {
                    // Temporarily shift canvas for drift, then restore
                    ctx.save();
                    ctx.translate(s.driftX, 0);
                    drawChicken(ctx, s.px, s.py, s.hop, s.phase === "dead", s.facingLeft);
                    ctx.restore();
                }
            }

            // ── Overlays ──
            if (s.phase === "start") {
                ctx.fillStyle = "rgba(0,0,0,0.7)"; ctx.fillRect(0, 0, W, H);
                ctx.textAlign = "center";
                ctx.font = "bold 28px sans-serif"; ctx.fillStyle = "#fff"; ctx.fillText("🐥 Crossy Road", W/2, H/2 - 50);
                ctx.font = "13px sans-serif"; ctx.fillStyle = "#9ca3af";
                ctx.fillText("Cross all lanes to score!", W/2, H/2 - 18);
                ctx.fillText("Avoid cars & trains · Stay on logs in water", W/2, H/2 + 4);
                ctx.fillStyle = "#fbbf24"; ctx.font = "bold 15px sans-serif";
                ctx.fillText("Tap arrows below or press ENTER", W/2, H/2 + 42);
                ctx.textAlign = "left";
            }

            if (s.phase === "levelup") {
                ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(0, 0, W, H);
                ctx.textAlign = "center";
                ctx.font = "bold 26px sans-serif"; ctx.fillStyle = "#fbbf24"; ctx.fillText(`🎉 Level ${s.level - 1} Complete!`, W/2, H/2 - 10);
                ctx.font = "13px sans-serif"; ctx.fillStyle = "#d1d5db"; ctx.fillText(`+5 bonus points`, W/2, H/2 + 18);
                ctx.textAlign = "left";
            }

            if (s.phase === "dead" && s.lives <= 0 && s.deadTimer <= 0) {
                ctx.fillStyle = "rgba(0,0,0,0.75)"; ctx.fillRect(0, 0, W, H);
                ctx.textAlign = "center";
                ctx.font = "bold 26px sans-serif"; ctx.fillStyle = "#ef4444"; ctx.fillText("GAME OVER", W/2, H/2 - 40);
                ctx.font = "16px sans-serif"; ctx.fillStyle = "#fff"; ctx.fillText(`Score: ${s.score}`, W/2, H/2 - 8);
                if (s.score >= s.best && s.score > 0) { ctx.fillStyle = "#fbbf24"; ctx.font = "bold 13px sans-serif"; ctx.fillText("✦ NEW BEST! ✦", W/2, H/2 + 16); }
                ctx.font = "13px sans-serif"; ctx.fillStyle = "#9ca3af"; ctx.fillText("Tap or press Enter to restart", W/2, H/2 + 44);
                ctx.textAlign = "left";
                syncUi();
            }
        };

        rafRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafRef.current);
    }, [die, startLevel, syncUi]);

    const handleOverlayClick = () => {
        const s = stateRef.current;
        if (s.phase === "start" || (s.phase === "dead" && s.lives <= 0 && s.deadTimer <= 0)) startLevel(true);
        else if (s.phase === "levelup" && s.levelupTimer <= 0) startLevel(false);
    };

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col">
            <Navbar />

            <div className="flex flex-col items-center justify-center flex-1 py-8 px-4">
                {/* HUD */}
                <div className="flex gap-8 mb-3 font-mono">
                    <div className="text-center"><div className="text-gray-500 text-xs">SCORE</div><div className="text-yellow-400 text-xl font-bold">{ui.score}</div></div>
                    <div className="text-center"><div className="text-gray-500 text-xs">LIVES</div><div className="text-xl">{Array.from({length: ui.lives}, (_, i) => <span key={i}>❤️</span>)}{Array.from({length: Math.max(0, 3-ui.lives)}, (_, i) => <span key={i} className="opacity-20">❤️</span>)}</div></div>
                    <div className="text-center"><div className="text-gray-500 text-xs">LEVEL</div><div className="text-blue-400 text-xl font-bold">{ui.level}</div></div>
                    <div className="text-center"><div className="text-gray-500 text-xs">BEST</div><div className="text-green-400 text-xl font-bold">{ui.best}</div></div>
                </div>

                {/* Canvas */}
                <canvas
                    ref={canvasRef}
                    width={W}
                    height={H}
                    onClick={handleOverlayClick}
                    style={{ borderRadius: 12, boxShadow: "0 8px 40px rgba(0,0,0,0.7)", cursor: "pointer", display: "block" }}
                />

                {/* Mobile controls */}
                <div className="mt-5 grid grid-cols-3 gap-2">
                    <div />
                    <button onClick={() => move(0,-1)} className="p-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] border-2 border-[#3a3a3a] hover:border-yellow-500 rounded-xl text-xl font-bold transition active:scale-90">▲</button>
                    <div />
                    <button onClick={() => move(-1,0)} className="p-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] border-2 border-[#3a3a3a] hover:border-yellow-500 rounded-xl text-xl font-bold transition active:scale-90">◀</button>
                    <button onClick={() => move(0,1)} className="p-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] border-2 border-[#3a3a3a] hover:border-yellow-500 rounded-xl text-xl font-bold transition active:scale-90">▼</button>
                    <button onClick={() => move(1,0)} className="p-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] border-2 border-[#3a3a3a] hover:border-yellow-500 rounded-xl text-xl font-bold transition active:scale-90">▶</button>
                </div>

                <p className="mt-3 text-xs text-gray-600 font-mono">ARROW KEYS · CLICK CANVAS TO START</p>
            </div>
        </div>
    );
}