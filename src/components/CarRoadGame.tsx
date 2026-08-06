import React, { useEffect, useRef, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import { useCanvasScale } from "@/hooks/useCanvasScale";
import { useSEO } from '@/hooks/useSEO';

const W = 360;
const H = 580;
const LANE_COUNT = 3;
const LANE_WIDTH = W / LANE_COUNT;
const CAR_W = 44;
const CAR_H = 70;
const PLAYER_Y = H - CAR_H - 20;

const LANE_CENTERS = Array.from({ length: LANE_COUNT }, (_, i) => i * LANE_WIDTH + LANE_WIDTH / 2 - CAR_W / 2);

interface EnemyCar {
    id: number;
    lane: number;
    y: number;
    speed: number;
    color: string;
    _passed?: boolean;
}

interface Particle {
    x: number; y: number; vx: number; vy: number; life: number; color: string;
}

const ENEMY_COLORS = ['#ef4444','#f97316','#8b5cf6','#ec4899','#14b8a6','#3b82f6'];
const ROAD_COLOR = '#1f2937';
const STRIPE_COLOR = '#374151';
const MARKING_COLOR = '#fbbf24';

let nextId = 1;

const drawCar = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, isPlayer: boolean) => {
    const r = 6;
    // Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x + 4, y, CAR_W - 8, CAR_H, r);
    ctx.fill();

    // Roof
    ctx.fillStyle = isPlayer ? '#1d4ed8' : darken(color);
    ctx.beginPath();
    ctx.roundRect(x + 9, y + 14, CAR_W - 18, CAR_H - 32, r - 2);
    ctx.fill();

    // Windshield
    ctx.fillStyle = isPlayer ? '#93c5fd' : '#bfdbfe';
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.roundRect(x + 11, y + 16, CAR_W - 22, 18, 3);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Rear window
    ctx.fillStyle = '#bfdbfe';
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.roundRect(x + 11, y + CAR_H - 28, CAR_W - 22, 14, 3);
    ctx.fill();
    ctx.globalAlpha = 1;

    if (isPlayer) {
        // Headlights
        ctx.fillStyle = '#fef08a';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fef08a';
        ctx.fillRect(x + 7, y + 3, 10, 6);
        ctx.fillRect(x + CAR_W - 17, y + 3, 10, 6);
        ctx.shadowBlur = 0;
        // Taillights
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x + 7, y + CAR_H - 9, 10, 6);
        ctx.fillRect(x + CAR_W - 17, y + CAR_H - 9, 10, 6);
    } else {
        // Enemy taillights (facing down = front)
        ctx.fillStyle = '#fef08a';
        ctx.shadowBlur = 8; ctx.shadowColor = '#fef08a';
        ctx.fillRect(x + 7, y + CAR_H - 9, 10, 6);
        ctx.fillRect(x + CAR_W - 17, y + CAR_H - 9, 10, 6);
        ctx.shadowBlur = 0;
    }

    // Wheels
    ctx.fillStyle = '#111';
    [y + 10, y + CAR_H - 24].forEach(wy => {
        ctx.fillRect(x - 2, wy, 8, 14);
        ctx.fillRect(x + CAR_W - 6, wy, 8, 14);
    });
};

const darken = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, (n >> 16) - 40);
    const g = Math.max(0, ((n >> 8) & 0xff) - 40);
    const b = Math.max(0, (n & 0xff) - 40);
    return `rgb(${r},${g},${b})`;
};

const CarRoadGame: React.FC = () => {
    useSEO('Car Road Game – Yassine Jdair', 'Dodge traffic and survive as long as you can in this browser game.', '/carroadgame');
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const stateRef = useRef({
        playerLane: 1,
        playerX: LANE_CENTERS[1],
        targetX: LANE_CENTERS[1],
        enemies: [] as EnemyCar[],
        particles: [] as Particle[],
        score: 0,
        distance: 0,
        speed: 4,
        roadOffset: 0,
        sideOffset: 0,
        spawnTimer: 0,
        isGameOver: false,
        started: false,
        lives: 3,
        invincible: 0,
        best: Number(localStorage.getItem('carGame-best') || 0),
        frameCount: 0,
    });

    const [displayState, setDisplayState] = useState({
        score: 0, lives: 3, best: stateRef.current.best,
        isGameOver: false, started: false, level: 1,
    });

    const rafRef = useRef<number>(0);

    const spawnEnemy = useCallback(() => {
        const s = stateRef.current;
        const usedLanes = s.enemies.filter(e => e.y < 120).map(e => e.lane);
        const available = [0, 1, 2].filter(l => !usedLanes.includes(l));
        if (available.length === 0) return;
        const lane = available[Math.floor(Math.random() * available.length)];
        s.enemies.push({
            id: nextId++,
            lane,
            y: -CAR_H - Math.random() * 60,
            speed: s.speed * (0.85 + Math.random() * 0.6),
            color: ENEMY_COLORS[Math.floor(Math.random() * ENEMY_COLORS.length)],
        });
    }, []);

    const explode = useCallback((x: number, y: number) => {
        const s = stateRef.current;
        for (let i = 0; i < 24; i++) {
            const angle = (Math.PI * 2 * i) / 24 + Math.random() * 0.3;
            const speed = 1.5 + Math.random() * 4;
            s.particles.push({
                x: x + CAR_W / 2, y: y + CAR_H / 2,
                vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                life: 30 + Math.random() * 20,
                color: ['#ef4444','#f97316','#fbbf24','#fff'][Math.floor(Math.random() * 4)],
            });
        }
    }, []);

    const start = useCallback(() => {
        const s = stateRef.current;
        s.playerLane = 1; s.playerX = LANE_CENTERS[1]; s.targetX = LANE_CENTERS[1];
        s.enemies = []; s.particles = []; s.score = 0; s.distance = 0;
        s.speed = 4; s.roadOffset = 0; s.spawnTimer = 0;
        s.isGameOver = false; s.started = true; s.lives = 3; s.invincible = 0; s.frameCount = 0;
        setDisplayState(d => ({ ...d, score: 0, lives: 3, isGameOver: false, started: true, level: 1 }));
    }, []);

    const moveLeft = useCallback(() => {
        const s = stateRef.current;
        if (!s.started || s.isGameOver) return;
        if (s.playerLane > 0) {
            s.playerLane--;
            s.targetX = LANE_CENTERS[s.playerLane];
        }
    }, []);

    const moveRight = useCallback(() => {
        const s = stateRef.current;
        if (!s.started || s.isGameOver) return;
        if (s.playerLane < LANE_COUNT - 1) {
            s.playerLane++;
            s.targetX = LANE_CENTERS[s.playerLane];
        }
    }, []);

    // Keyboard
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') { moveLeft(); e.preventDefault(); }
            else if (e.key === 'ArrowRight' || e.key === 'd') { moveRight(); e.preventDefault(); }
            else if (e.key === 'Enter') { if (!stateRef.current.started || stateRef.current.isGameOver) start(); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [moveLeft, moveRight, start]);

    // Game loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;

        const loop = () => {
            const s = stateRef.current;
            rafRef.current = requestAnimationFrame(loop);

            ctx.clearRect(0, 0, W, H);

            // ── Road ──
            ctx.fillStyle = ROAD_COLOR;
            ctx.fillRect(0, 0, W, H);

            // Side grass
            ctx.fillStyle = '#14532d';
            ctx.fillRect(0, 0, 0, H); // No side margins on 3-lane full width

            // Road stripes (dashes)
            s.roadOffset = (s.roadOffset + (s.started && !s.isGameOver ? s.speed : 0)) % 60;
            ctx.strokeStyle = STRIPE_COLOR;
            ctx.setLineDash([30, 30]);
            ctx.lineDashOffset = -s.roadOffset;
            ctx.lineWidth = 3;
            for (let l = 1; l < LANE_COUNT; l++) {
                ctx.beginPath();
                ctx.moveTo(l * LANE_WIDTH, 0);
                ctx.lineTo(l * LANE_WIDTH, H);
                ctx.stroke();
            }
            ctx.setLineDash([]);

            // Edge lines
            ctx.strokeStyle = MARKING_COLOR;
            ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(3, 0); ctx.lineTo(3, H); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(W - 3, 0); ctx.lineTo(W - 3, H); ctx.stroke();

            if (!s.started) {
                // Start screen
                ctx.fillStyle = 'rgba(0,0,0,0.65)';
                ctx.fillRect(0, 0, W, H);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 32px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('🚗 CAR DODGE', W / 2, H / 2 - 50);
                ctx.font = '14px monospace';
                ctx.fillStyle = '#9ca3af';
                ctx.fillText('Dodge incoming traffic', W / 2, H / 2 - 16);
                ctx.fillText('3 lives · Speed increases over time', W / 2, H / 2 + 8);
                ctx.fillStyle = '#fbbf24';
                ctx.font = 'bold 16px monospace';
                ctx.fillText('TAP START or press ENTER', W / 2, H / 2 + 50);
                ctx.textAlign = 'left';
                return;
            }

            if (!s.isGameOver) {
                s.frameCount++;
                s.distance++;

                // Level / speed up every 300 frames
                const level = Math.floor(s.distance / 300) + 1;
                s.speed = Math.min(12, 4 + (level - 1) * 0.6);

                // Smooth player movement
                s.playerX += (s.targetX - s.playerX) * 0.18;

                // Spawn enemies
                const spawnInterval = Math.max(40, 90 - level * 6);
                s.spawnTimer++;
                if (s.spawnTimer >= spawnInterval) { spawnEnemy(); s.spawnTimer = 0; }

                // Move enemies
                s.enemies = s.enemies.filter(e => e.y < H + CAR_H + 10);
                s.enemies.forEach(e => {
                    e.y += e.speed + s.speed * 0.4;
                    // Score when enemy passes player
                    if (!e._passed && e.y > H) { e._passed = true; }
                });

                // Collision
                if (s.invincible <= 0) {
                    for (const e of s.enemies) {
                        const ex = LANE_CENTERS[e.lane];
                        const overlap =
                            Math.abs(ex - s.playerX) < CAR_W - 8 &&
                            Math.abs(e.y - PLAYER_Y) < CAR_H - 10;
                        if (overlap) {
                            explode(s.playerX, PLAYER_Y);
                            s.lives--;
                            s.invincible = 90;
                            s.enemies = s.enemies.filter(en => en.id !== e.id);
                            if (s.lives <= 0) {
                                s.isGameOver = true;
                                if (s.score > s.best) {
                                    s.best = s.score;
                                    localStorage.setItem('carGame-best', String(s.score));
                                }
                            }
                            setDisplayState(d => ({ ...d, lives: s.lives, isGameOver: s.lives <= 0 }));
                            break;
                        }
                    }
                } else {
                    s.invincible--;
                }

                // Score tick
                if (s.frameCount % 6 === 0) {
                    s.score++;
                    const level = Math.floor(s.distance / 300) + 1;
                    setDisplayState(d => ({ ...d, score: s.score, level }));
                }
            }

            // Draw enemies
            s.enemies.forEach(e => {
                const ex = LANE_CENTERS[e.lane];
                drawCar(ctx, ex, e.y, e.color, false);
            });

            // Draw player (flashing when invincible)
            if (s.invincible <= 0 || Math.floor(s.invincible / 6) % 2 === 0) {
                drawCar(ctx, s.playerX, PLAYER_Y, '#3b82f6', true);
            }

            // Particles
            s.particles = s.particles.filter(p => p.life > 0);
            s.particles.forEach(p => {
                ctx.globalAlpha = p.life / 50;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fill();
                p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life--;
            });
            ctx.globalAlpha = 1;

            // Game over overlay
            if (s.isGameOver) {
                ctx.fillStyle = 'rgba(0,0,0,0.72)';
                ctx.fillRect(0, 0, W, H);
                ctx.textAlign = 'center';
                ctx.fillStyle = '#ef4444';
                ctx.font = 'bold 28px monospace';
                ctx.fillText('GAME OVER', W / 2, H / 2 - 44);
                ctx.fillStyle = '#fff';
                ctx.font = '16px monospace';
                ctx.fillText(`Score: ${s.score}`, W / 2, H / 2 - 10);
                if (s.score >= s.best && s.score > 0) {
                    ctx.fillStyle = '#fbbf24';
                    ctx.font = 'bold 14px monospace';
                    ctx.fillText('✦ NEW BEST! ✦', W / 2, H / 2 + 14);
                }
                ctx.fillStyle = '#9ca3af';
                ctx.font = '13px monospace';
                ctx.fillText(`Best: ${s.best}`, W / 2, H / 2 + 38);
                ctx.fillStyle = '#fbbf24';
                ctx.font = 'bold 15px monospace';
                ctx.fillText('TAP RESTART or press ENTER', W / 2, H / 2 + 68);
                ctx.textAlign = 'left';
            }
        };

        rafRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafRef.current);
    }, [spawnEnemy, explode]);

    const { wrapRef, scale } = useCanvasScale(W, H);

    return (
        <div className="bg-[#1a1a1a] text-white flex flex-col" style={{ height: "100dvh", overflow: "hidden" }}>
            <Navbar />

            <div className="flex flex-col items-center flex-1 min-h-0 py-2 px-3" style={{ gap: 6 }}>
                {/* HUD */}
                <div className="flex gap-6 font-mono flex-shrink-0">
                    <div className="text-center">
                        <div className="text-gray-500 text-xs">SCORE</div>
                        <div className="text-yellow-400 text-xl font-bold">{displayState.score}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-gray-500 text-xs">LIVES</div>
                        <div className="text-red-400 text-xl font-bold">
                            {Array.from({ length: displayState.lives }, (_, i) => <span key={i}>❤️</span>)}
                            {Array.from({ length: Math.max(0, 3 - displayState.lives) }, (_, i) => <span key={i} className="opacity-20">❤️</span>)}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-gray-500 text-xs">LEVEL</div>
                        <div className="text-blue-400 text-xl font-bold">{displayState.level}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-gray-500 text-xs">BEST</div>
                        <div className="text-green-400 text-xl font-bold">{displayState.best}</div>
                    </div>
                </div>

                {/* Canvas — constrained by both width & height */}
                <div ref={wrapRef} className="flex-1 min-h-0 w-full flex items-center justify-center">
                    <canvas
                        ref={canvasRef}
                        width={W}
                        height={H}
                        style={{ width: W * scale, height: H * scale, display: "block", borderRadius: 10, boxShadow: "0 6px 24px rgba(0,0,0,0.7)" }}
                    />
                </div>

                {/* Start / Restart */}
                <div className="flex gap-3 flex-shrink-0">
                    {(!displayState.started || displayState.isGameOver) && (
                        <button onClick={start}
                                className="px-8 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition active:scale-95 font-mono">
                            {displayState.isGameOver ? 'RESTART' : 'START'}
                        </button>
                    )}
                </div>

                {/* Mobile controls */}
                <div className="flex gap-6 flex-shrink-0">
                    <button onPointerDown={moveLeft}
                            className="w-24 h-16 bg-[#2a2a2a] border-2 border-[#3a3a3a] hover:border-yellow-500 rounded-xl text-2xl font-bold transition active:scale-95 active:bg-[#3a3a3a] touch-manipulation">
                        ◀
                    </button>
                    <button onPointerDown={moveRight}
                            className="w-24 h-16 bg-[#2a2a2a] border-2 border-[#3a3a3a] hover:border-yellow-500 rounded-xl text-2xl font-bold transition active:scale-95 active:bg-[#3a3a3a] touch-manipulation">
                        ▶
                    </button>
                </div>

                <p className="text-xs text-gray-600 font-mono flex-shrink-0">A / ← → / D · ENTER to restart</p>
            </div>
        </div>
    );
};

export default CarRoadGame;