import React, { useEffect, useRef, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import { useCanvasScale } from '@/hooks/useCanvasScale';
import { useSEO } from '@/hooks/useSEO';

const W = 360;
const H = 580;

const PLAYER_W = 40;
const PLAYER_H = 28;
const PLAYER_Y = H - PLAYER_H - 20;
const PLAYER_SPEED = 6;

const BULLET_SPEED = 8;
const ENEMY_BULLET_SPEED = 4;

const ENEMY_W = 28;
const ENEMY_H = 22;
const ENEMY_COLS = 6;
const ENEMY_H_GAP = 12;
const ENEMY_V_GAP = 14;
const FORMATION_TOP = 60;

interface Vec { x: number; y: number; }
interface Enemy { x: number; y: number; alive: boolean; hp: number; }
interface Boss { x: number; y: number; w: number; h: number; hp: number; maxHp: number; dir: number; fireTimer: number; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; }

const isBossLevel = (level: number) => level % 5 === 0;

const SpaceShooterGame: React.FC = () => {
    useSEO(
        'Space Shooter – Yassine Jdair',
        'Arcade space shooter with waves of enemies and boss levels. Built from scratch, playable on mobile.',
        '/space-shooter'
    );

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number>(0);

    const s = useRef({
        playerX: W / 2 - PLAYER_W / 2,
        moveLeft: false,
        moveRight: false,
        dragging: false,
        bullets: [] as Vec[],
        enemyBullets: [] as Vec[],
        enemies: [] as Enemy[],
        enemyDir: 1,
        enemySpeed: 1,
        boss: null as Boss | null,
        fireTimer: 0,
        particles: [] as Particle[],
        score: 0,
        level: 1,
        lives: 3,
        best: Number(localStorage.getItem('shooter-best') || 0),
        invincible: 0,
        phase: 'start' as 'start' | 'playing' | 'levelIntro' | 'over',
        levelIntroTimer: 0,
        frameCount: 0,
        stars: Array.from({ length: 50 }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            speed: 0.5 + Math.random() * 1.5,
            size: Math.random() < 0.2 ? 2 : 1,
        })),
    });

    const [hud, setHud] = useState({
        score: 0, lives: 3, level: 1, best: s.current.best,
        phase: 'start' as typeof s.current.phase,
        bossHp: 0, bossMaxHp: 0,
    });

    const spawnWave = useCallback((level: number) => {
        const st = s.current;
        st.bullets = [];
        st.enemyBullets = [];
        st.enemyDir = 1;
        st.enemySpeed = Math.min(3, 1 + level * 0.15);

        if (isBossLevel(level)) {
            st.enemies = [];
            st.boss = {
                x: W / 2 - 55, y: 60, w: 110, h: 60,
                hp: 10 + level * 2, maxHp: 10 + level * 2,
                dir: 1, fireTimer: 0,
            };
        } else {
            st.boss = null;
            const rows = Math.min(2 + Math.floor(level / 2), 5);
            const enemies: Enemy[] = [];
            const totalW = ENEMY_COLS * ENEMY_W + (ENEMY_COLS - 1) * ENEMY_H_GAP;
            const startX = (W - totalW) / 2;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < ENEMY_COLS; c++) {
                    enemies.push({
                        x: startX + c * (ENEMY_W + ENEMY_H_GAP),
                        y: FORMATION_TOP + r * (ENEMY_H + ENEMY_V_GAP),
                        alive: true,
                        hp: 1,
                    });
                }
            }
            st.enemies = enemies;
        }
    }, []);

    const explode = useCallback((x: number, y: number, color: string) => {
        const st = s.current;
        for (let i = 0; i < 16; i++) {
            const angle = (Math.PI * 2 * i) / 16 + Math.random() * 0.3;
            const speed = 1 + Math.random() * 3;
            st.particles.push({
                x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                life: 24 + Math.random() * 16, color,
            });
        }
    }, []);

    const start = useCallback(() => {
        const st = s.current;
        st.playerX = W / 2 - PLAYER_W / 2;
        st.particles = [];
        st.score = 0;
        st.level = 1;
        st.lives = 3;
        st.invincible = 0;
        st.fireTimer = 0;
        st.frameCount = 0;
        spawnWave(1);
        st.phase = 'playing';
        setHud(h => ({ ...h, score: 0, lives: 3, level: 1, phase: 'playing' }));
    }, [spawnWave]);

    // Keyboard
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const st = s.current;
            if (['ArrowLeft', 'ArrowRight', 'a', 'd', ' '].includes(e.key)) e.preventDefault();
            if (e.key === 'ArrowLeft' || e.key === 'a') st.moveLeft = true;
            if (e.key === 'ArrowRight' || e.key === 'd') st.moveRight = true;
            if (e.key === 'Enter' || e.key === ' ') {
                if (st.phase === 'start' || st.phase === 'over') start();
            }
        };
        const onKeyUp = (e: KeyboardEvent) => {
            const st = s.current;
            if (e.key === 'ArrowLeft' || e.key === 'a') st.moveLeft = false;
            if (e.key === 'ArrowRight' || e.key === 'd') st.moveRight = false;
        };
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, [start]);

    // Drag-to-move on canvas (primary mobile control)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const moveToClientX = (clientX: number) => {
            const rect = canvas.getBoundingClientRect();
            const canvasX = ((clientX - rect.left) / rect.width) * W;
            s.current.playerX = Math.max(0, Math.min(W - PLAYER_W, canvasX - PLAYER_W / 2));
        };

        const onTouchStart = (e: TouchEvent) => {
            e.preventDefault();
            const st = s.current;
            if (st.phase === 'start' || st.phase === 'over') { start(); return; }
            st.dragging = true;
            moveToClientX(e.touches[0].clientX);
        };
        const onTouchMove = (e: TouchEvent) => {
            if (!s.current.dragging) return;
            e.preventDefault();
            moveToClientX(e.touches[0].clientX);
        };
        const onTouchEnd = (e: TouchEvent) => {
            e.preventDefault();
            s.current.dragging = false;
        };

        canvas.addEventListener('touchstart', onTouchStart, { passive: false });
        canvas.addEventListener('touchmove', onTouchMove, { passive: false });
        canvas.addEventListener('touchend', onTouchEnd, { passive: false });
        return () => {
            canvas.removeEventListener('touchstart', onTouchStart);
            canvas.removeEventListener('touchmove', onTouchMove);
            canvas.removeEventListener('touchend', onTouchEnd);
        };
    }, [start]);

    const holdLeft = (v: boolean) => { s.current.moveLeft = v; };
    const holdRight = (v: boolean) => { s.current.moveRight = v; };

    // Main loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;

        const loop = () => {
            rafRef.current = requestAnimationFrame(loop);
            const st = s.current;
            st.frameCount++;

            // Stars always drift
            st.stars.forEach(star => {
                star.y += star.speed;
                if (star.y > H) { star.y = 0; star.x = Math.random() * W; }
            });

            if (st.phase === 'playing') {
                // Player movement
                if (st.moveLeft) st.playerX -= PLAYER_SPEED;
                if (st.moveRight) st.playerX += PLAYER_SPEED;
                st.playerX = Math.max(0, Math.min(W - PLAYER_W, st.playerX));

                // Auto-fire
                st.fireTimer++;
                const fireInterval = Math.max(10, 18 - st.level);
                if (st.fireTimer >= fireInterval) {
                    st.fireTimer = 0;
                    st.bullets.push({ x: st.playerX + PLAYER_W / 2 - 2, y: PLAYER_Y });
                }

                // Move player bullets
                st.bullets.forEach(b => b.y -= BULLET_SPEED);
                st.bullets = st.bullets.filter(b => b.y > -10);

                // Move enemy bullets
                st.enemyBullets.forEach(b => b.y += ENEMY_BULLET_SPEED);
                st.enemyBullets = st.enemyBullets.filter(b => b.y < H + 10);

                // Formation movement
                const alive = st.enemies.filter(e => e.alive);
                if (alive.length > 0) {
                    let hitEdge = false;
                    alive.forEach(e => {
                        if (e.x <= 8 || e.x + ENEMY_W >= W - 8) hitEdge = true;
                    });
                    alive.forEach(e => {
                        e.x += st.enemySpeed * st.enemyDir;
                    });
                    if (hitEdge) {
                        st.enemyDir *= -1;
                        alive.forEach(e => { e.y += 14; });
                    }

                    // Random enemy fire
                    const fireChance = 0.003 + st.level * 0.001;
                    if (st.enemyBullets.length < 4 + st.level && Math.random() < fireChance * alive.length) {
                        const shooter = alive[Math.floor(Math.random() * alive.length)];
                        st.enemyBullets.push({ x: shooter.x + ENEMY_W / 2 - 2, y: shooter.y + ENEMY_H });
                    }

                    // Invasion check
                    if (alive.some(e => e.y + ENEMY_H >= PLAYER_Y)) {
                        st.lives = 0;
                    }
                }

                // Boss movement
                if (st.boss) {
                    const boss = st.boss;
                    boss.x += 1.5 * boss.dir * (1 + st.level * 0.05);
                    if (boss.x <= 10 || boss.x + boss.w >= W - 10) boss.dir *= -1;
                    boss.fireTimer++;
                    const bossFireInterval = Math.max(30, 60 - st.level * 2);
                    if (boss.fireTimer >= bossFireInterval) {
                        boss.fireTimer = 0;
                        st.enemyBullets.push({ x: boss.x + boss.w / 2 - 2, y: boss.y + boss.h });
                        st.enemyBullets.push({ x: boss.x + boss.w / 2 - 20, y: boss.y + boss.h });
                        st.enemyBullets.push({ x: boss.x + boss.w / 2 + 16, y: boss.y + boss.h });
                    }
                }

                // Player bullets vs enemies
                st.bullets.forEach(b => {
                    st.enemies.forEach(e => {
                        if (!e.alive) return;
                        if (b.y < e.y + ENEMY_H && b.y + 8 > e.y && b.x < e.x + ENEMY_W && b.x + 4 > e.x) {
                            e.alive = false;
                            b.y = -999;
                            st.score += 10 * st.level;
                            explode(e.x + ENEMY_W / 2, e.y + ENEMY_H / 2, '#f97316');
                        }
                    });
                    if (st.boss && b.y < H) {
                        const boss = st.boss;
                        if (b.x < boss.x + boss.w && b.x + 4 > boss.x && b.y < boss.y + boss.h && b.y + 8 > boss.y) {
                            boss.hp--;
                            b.y = -999;
                            st.score += 5;
                            explode(b.x, b.y, '#facc15');
                            if (boss.hp <= 0) {
                                st.score += 300;
                                explode(boss.x + boss.w / 2, boss.y + boss.h / 2, '#ef4444');
                                st.boss = null;
                            }
                        }
                    }
                });
                st.bullets = st.bullets.filter(b => b.y > -50);

                // Enemy bullets vs player
                if (st.invincible <= 0) {
                    st.enemyBullets = st.enemyBullets.filter(b => {
                        const hit = b.x < st.playerX + PLAYER_W - 6 && b.x + 4 > st.playerX + 6 &&
                            b.y < PLAYER_Y + PLAYER_H && b.y + 6 > PLAYER_Y;
                        if (hit) {
                            st.lives--;
                            st.invincible = 90;
                            explode(st.playerX + PLAYER_W / 2, PLAYER_Y + PLAYER_H / 2, '#38bdf8');
                        }
                        return !hit;
                    });

                    // Enemy body collision with player
                    st.enemies.forEach(e => {
                        if (!e.alive) return;
                        const overlap = e.x < st.playerX + PLAYER_W && e.x + ENEMY_W > st.playerX &&
                            e.y < PLAYER_Y + PLAYER_H && e.y + ENEMY_H > PLAYER_Y;
                        if (overlap) {
                            e.alive = false;
                            st.lives--;
                            st.invincible = 90;
                            explode(st.playerX + PLAYER_W / 2, PLAYER_Y + PLAYER_H / 2, '#38bdf8');
                        }
                    });
                } else {
                    st.invincible--;
                }

                // Level clear check
                const enemiesLeft = st.enemies.some(e => e.alive);
                if (!enemiesLeft && !st.boss) {
                    st.level++;
                    st.phase = 'levelIntro';
                    st.levelIntroTimer = 90;
                }

                if (st.lives <= 0) {
                    st.phase = 'over';
                    if (st.score > st.best) {
                        st.best = st.score;
                        localStorage.setItem('shooter-best', String(st.score));
                    }
                }

                setHud({
                    score: st.score, lives: Math.max(0, st.lives), level: st.level,
                    best: st.best, phase: st.phase,
                    bossHp: st.boss?.hp ?? 0, bossMaxHp: st.boss?.maxHp ?? 0,
                });
            } else if (st.phase === 'levelIntro') {
                st.levelIntroTimer--;
                if (st.levelIntroTimer <= 0) {
                    spawnWave(st.level);
                    st.phase = 'playing';
                    setHud(h => ({ ...h, level: st.level, phase: 'playing' }));
                }
            }

            // Particles always update
            st.particles = st.particles.filter(p => p.life > 0);
            st.particles.forEach(p => {
                p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life--;
            });

            draw(ctx, st);
        };

        rafRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafRef.current);
    }, [explode, spawnWave]);

    function draw(ctx: CanvasRenderingContext2D, st: typeof s.current) {
        ctx.fillStyle = '#0b1020';
        ctx.fillRect(0, 0, W, H);

        // Stars
        st.stars.forEach(star => {
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.fillRect(star.x, star.y, star.size, star.size);
        });

        if (st.phase === 'start') {
            ctx.textAlign = 'center';
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 28px monospace';
            ctx.fillText('🚀 SPACE SHOOTER', W / 2, H / 2 - 60);
            ctx.font = '13px monospace';
            ctx.fillStyle = '#9ca3af';
            ctx.fillText('Drag to move · Auto-fire is on', W / 2, H / 2 - 24);
            ctx.fillText('Boss fight every 5 levels', W / 2, H / 2 - 4);
            ctx.fillStyle = '#facc15';
            ctx.font = 'bold 15px monospace';
            ctx.fillText('TAP or press ENTER to start', W / 2, H / 2 + 40);
            ctx.textAlign = 'left';
            return;
        }

        // Player ship
        if (st.invincible <= 0 || Math.floor(st.invincible / 6) % 2 === 0) {
            drawShip(ctx, st.playerX, PLAYER_Y);
        }

        // Enemies
        st.enemies.forEach(e => {
            if (!e.alive) return;
            drawAlien(ctx, e.x, e.y);
        });

        // Boss
        if (st.boss) {
            const boss = st.boss;
            ctx.fillStyle = '#7f1d1d';
            ctx.beginPath();
            ctx.roundRect(boss.x, boss.y, boss.w, boss.h, 10);
            ctx.fill();
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.roundRect(boss.x + 10, boss.y + 10, boss.w - 20, boss.h - 24, 8);
            ctx.fill();
            ctx.fillStyle = '#fca5a5';
            ctx.beginPath();
            ctx.arc(boss.x + boss.w / 2, boss.y + boss.h / 2, 8, 0, Math.PI * 2);
            ctx.fill();
            // HP bar
            const pct = Math.max(0, boss.hp / boss.maxHp);
            ctx.fillStyle = '#374151';
            ctx.fillRect(boss.x, boss.y - 10, boss.w, 5);
            ctx.fillStyle = pct > 0.3 ? '#22c55e' : '#ef4444';
            ctx.fillRect(boss.x, boss.y - 10, boss.w * pct, 5);
        }

        // Bullets
        ctx.fillStyle = '#38bdf8';
        st.bullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 10));
        ctx.fillStyle = '#f87171';
        st.enemyBullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 8));

        // Particles
        st.particles.forEach(p => {
            ctx.globalAlpha = Math.max(0, p.life / 40);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        if (st.phase === 'levelIntro') {
            ctx.fillStyle = 'rgba(0,0,0,0.55)';
            ctx.fillRect(0, 0, W, H);
            ctx.textAlign = 'center';
            ctx.fillStyle = isBossLevel(st.level) ? '#ef4444' : '#facc15';
            ctx.font = 'bold 26px monospace';
            ctx.fillText(isBossLevel(st.level) ? 'BOSS INCOMING' : `LEVEL ${st.level}`, W / 2, H / 2);
            ctx.textAlign = 'left';
        }

        if (st.phase === 'over') {
            ctx.fillStyle = 'rgba(0,0,0,0.72)';
            ctx.fillRect(0, 0, W, H);
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 28px monospace';
            ctx.fillText('GAME OVER', W / 2, H / 2 - 44);
            ctx.fillStyle = '#fff';
            ctx.font = '16px monospace';
            ctx.fillText(`Score: ${st.score}`, W / 2, H / 2 - 10);
            if (st.score >= st.best && st.score > 0) {
                ctx.fillStyle = '#facc15';
                ctx.font = 'bold 14px monospace';
                ctx.fillText('✦ NEW BEST! ✦', W / 2, H / 2 + 14);
            }
            ctx.fillStyle = '#9ca3af';
            ctx.font = '13px monospace';
            ctx.fillText(`Best: ${st.best}`, W / 2, H / 2 + 38);
            ctx.fillStyle = '#facc15';
            ctx.font = 'bold 15px monospace';
            ctx.fillText('TAP or ENTER to restart', W / 2, H / 2 + 68);
            ctx.textAlign = 'left';
        }
    }

    function drawShip(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.moveTo(x + PLAYER_W / 2, y);
        ctx.lineTo(x + PLAYER_W, y + PLAYER_H);
        ctx.lineTo(x, y + PLAYER_H);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#93c5fd';
        ctx.beginPath();
        ctx.arc(x + PLAYER_W / 2, y + PLAYER_H - 8, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.shadowBlur = 8; ctx.shadowColor = '#fef08a';
        ctx.fillRect(x + 4, y + PLAYER_H - 4, 6, 6);
        ctx.fillRect(x + PLAYER_W - 10, y + PLAYER_H - 4, 6, 6);
        ctx.shadowBlur = 0;
    }

    function drawAlien(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.roundRect(x, y, ENEMY_W, ENEMY_H, 5);
        ctx.fill();
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(x + 5, y + 6, 4, 4);
        ctx.fillRect(x + ENEMY_W - 9, y + 6, 4, 4);
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(x - 2, y + ENEMY_H - 4, 6, 4);
        ctx.fillRect(x + ENEMY_W - 4, y + ENEMY_H - 4, 6, 4);
    }

    const { wrapRef, scale } = useCanvasScale(W, H);

    return (
        <div className="bg-[#0b1020] text-white flex flex-col" style={{ height: '100dvh', overflow: 'hidden' }}>
            <Navbar />
            <div className="flex flex-col items-center flex-1 min-h-0 py-2 px-3" style={{ gap: 6 }}>
                {/* HUD */}
                <div className="flex gap-6 font-mono flex-shrink-0">
                    <div className="text-center">
                        <div className="text-gray-500 text-xs">SCORE</div>
                        <div className="text-yellow-400 text-xl font-bold">{hud.score}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-gray-500 text-xs">LIVES</div>
                        <div className="text-xl font-bold">
                            {Array.from({ length: hud.lives }, (_, i) => <span key={i}>❤️</span>)}
                            {Array.from({ length: Math.max(0, 3 - hud.lives) }, (_, i) => <span key={i} className="opacity-20">❤️</span>)}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-gray-500 text-xs">LEVEL</div>
                        <div className="text-purple-400 text-xl font-bold">{hud.level}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-gray-500 text-xs">BEST</div>
                        <div className="text-green-400 text-xl font-bold">{hud.best}</div>
                    </div>
                </div>

                {/* Canvas */}
                <div ref={wrapRef} className="flex-1 min-h-0 w-full flex items-center justify-center">
                    <canvas
                        ref={canvasRef}
                        width={W}
                        height={H}
                        onClick={() => {
                            if (hud.phase === 'start' || hud.phase === 'over') start();
                        }}
                        style={{ width: W * scale, height: H * scale, display: 'block', borderRadius: 10, boxShadow: '0 6px 24px rgba(0,0,0,0.7)', touchAction: 'none' }}
                    />
                </div>

                {/* Start / Restart */}
                <div className="flex gap-3 flex-shrink-0">
                    {(hud.phase === 'start' || hud.phase === 'over') && (
                        <button onClick={start}
                                className="px-8 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition active:scale-95 font-mono">
                            {hud.phase === 'over' ? 'RESTART' : 'START'}
                        </button>
                    )}
                </div>

                {/* Mobile controls */}
                <div className="flex gap-6 flex-shrink-0">
                    <button
                        onPointerDown={() => holdLeft(true)}
                        onPointerUp={() => holdLeft(false)}
                        onPointerLeave={() => holdLeft(false)}
                        className="w-24 h-16 bg-[#171e33] border-2 border-[#2a3350] hover:border-purple-500 rounded-xl text-2xl font-bold transition active:scale-95 active:bg-[#232c4d] touch-manipulation">
                        ◀
                    </button>
                    <button
                        onPointerDown={() => holdRight(true)}
                        onPointerUp={() => holdRight(false)}
                        onPointerLeave={() => holdRight(false)}
                        className="w-24 h-16 bg-[#171e33] border-2 border-[#2a3350] hover:border-purple-500 rounded-xl text-2xl font-bold transition active:scale-95 active:bg-[#232c4d] touch-manipulation">
                        ▶
                    </button>
                </div>

                <p className="text-xs text-gray-600 font-mono flex-shrink-0">A / ← → / D · DRAG ON SCREEN · AUTO-FIRE</p>
            </div>
        </div>
    );
};

export default SpaceShooterGame;
