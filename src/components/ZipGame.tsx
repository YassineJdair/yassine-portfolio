import { useState, useRef, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";

// ─── Daily seed ───────────────────────────────────────────────────────────────
const EPOCH = new Date("2025-01-01").getTime();
function getDayIndex() { return Math.floor((Date.now() - EPOCH) / 86400000); }
function todayKey() {
    const d = new Date();
    return `zip-${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// ─── Puzzle definitions ───────────────────────────────────────────────────────
// Format: [size, [r,c,n, r,c,n, …]]
// Every puzzle is derived from a known Hamiltonian path, so all are solvable.
//
// Solution families used:
//   HBOUS5  = horizontal boustrophedon 5×5 (snake L→R, R→L, …)
//   VBOUS5  = vertical boustrophedon 5×5  (snake ↓ ↑ ↓ ↑ ↓)
//   SPIRAL5 = clockwise spiral 5×5
//   LSHAPE5 = border-first path 5×5
//   HBOUS6  = horizontal boustrophedon 6×6
//   VBOUS6  = vertical boustrophedon 6×6
//   SPIRAL6 = clockwise spiral 6×6
//
// Numbers are placed at monotonically-increasing positions along those paths,
// guaranteeing a valid solution exists.

const PUZZLES: [number, number[]][] = [
    // ── HBOUS5 ─────────────────────────────────────────────────────────────────
    // pos: row0→, row1←, row2→, row3←, row4→
    // (0,0)(0,1)(0,2)(0,3)(0,4)(1,4)(1,3)(1,2)(1,1)(1,0)(2,0)…(2,4)(3,4)…(3,0)(4,0)…(4,4)
    [5, [0,0,1,  0,4,2,  4,0,3,  4,4,4]],                       // 4 corners
    [5, [0,0,1,  0,4,2,  2,0,3,  4,0,4,  4,4,5]],              // left edge then end
    [5, [0,0,1,  1,3,2,  2,2,3,  3,1,4,  4,4,5]],              // zig-zag through middle
    [5, [0,0,1,  2,2,2,  4,4,3]],                               // just start, centre, end
    [5, [0,0,1,  0,4,2,  1,0,3,  3,0,4,  4,4,5]],              // right-then-left
    [5, [0,0,1,  1,4,2,  2,0,3,  3,4,4,  4,0,5,  4,4,6]],      // checkerboard edges
    [5, [0,0,1,  0,4,2,  2,4,3,  4,4,4]],                       // top-right to bottom-right
    [5, [0,0,1,  1,1,2,  3,3,3,  4,4,4]],                       // inner diagonal
    [5, [0,0,1,  0,4,2,  2,2,3,  4,0,4,  4,4,5]],              // X-pattern

    // ── VBOUS5 ─────────────────────────────────────────────────────────────────
    // pos: col0↓, col1↑, col2↓, col3↑, col4↓
    // (0,0)(1,0)(2,0)(3,0)(4,0)(4,1)(3,1)(2,1)(1,1)(0,1)(0,2)…(4,2)(4,3)…(0,3)(0,4)…(4,4)
    [5, [0,0,1,  4,0,2,  0,2,3,  0,4,4,  4,4,5]],              // left→mid→right bottoms
    [5, [0,0,1,  1,1,2,  2,2,3,  3,3,4,  4,4,5]],              // main diagonal
    [5, [0,0,1,  4,0,2,  4,2,3,  0,4,4,  4,4,5]],              // bottom sweep
    [5, [0,0,1,  3,1,2,  2,2,3,  1,3,4,  4,4,5]],              // anti-diagonal middle

    // ── SPIRAL5 (CW) ───────────────────────────────────────────────────────────
    // (0,0)(0,1)(0,2)(0,3)(0,4)(1,4)(2,4)(3,4)(4,4)(4,3)(4,2)(4,1)(4,0)(3,0)(2,0)(1,0)
    // (1,1)(1,2)(1,3)(2,3)(3,3)(3,2)(3,1)(2,1)(2,2)
    [5, [0,0,1,  0,4,2,  4,4,3,  4,0,4,  1,1,5,  2,2,6]],      // full spiral waypoints
    [5, [0,0,1,  4,4,2,  4,0,3,  2,2,4]],                       // outer + centre
    [5, [0,0,1,  0,4,2,  1,0,3,  2,2,4]],                       // top-right, then inner
    [5, [0,0,1,  2,4,2,  4,0,3,  1,3,4,  2,2,5]],              // mid-right, bottom-left

    // ── LSHAPE5 ────────────────────────────────────────────────────────────────
    // (0,0)(1,0)(2,0)(3,0)(4,0)(4,1)(4,2)(4,3)(4,4)(3,4)(2,4)(1,4)(0,4)(0,3)(0,2)(0,1)
    // (1,1)(1,2)(1,3)(2,3)(3,3)(3,2)(3,1)(2,1)(2,2)
    [5, [0,0,1,  4,0,2,  4,4,3,  0,4,4,  2,2,5]],              // CCW border + centre
    [5, [0,0,1,  4,0,2,  0,1,3,  0,3,4,  4,4,5]],              // border-skip

    // ── HBOUS6 ─────────────────────────────────────────────────────────────────
    // pos: row0→, row1←, row2→, row3←, row4→, row5←
    [6, [0,0,1,  0,5,2,  1,0,3,  2,5,4,  3,0,5,  4,5,6,  5,0,7]], // zigzag edges
    [6, [0,0,1,  1,0,2,  2,5,3,  3,0,4,  5,0,5]],              // left edge + right peak
    [6, [0,0,1,  1,4,2,  2,5,3,  4,5,4,  5,0,5]],              // right edge emphasis
    [6, [0,0,1,  0,5,2,  2,5,3,  3,0,4,  5,5,5,  5,0,6]],      // top-right, cross, end
    [6, [0,0,1,  0,5,2,  2,5,3,  5,0,4]],                       // minimal 4-point
    [6, [0,0,1,  0,5,2,  3,0,3,  4,5,4,  5,0,5]],              // long strides

    // ── VBOUS6 ─────────────────────────────────────────────────────────────────
    // pos: col0↓, col1↑, col2↓, col3↑, col4↓, col5↑
    [6, [0,0,1,  0,1,2,  5,2,3,  0,3,4,  5,4,5,  0,5,6]],      // top/bottom alternating
    [6, [0,0,1,  5,0,2,  5,2,3,  0,3,4,  0,5,5]],              // corners + cross
    [6, [0,0,1,  5,0,2,  0,1,3,  5,2,4,  0,3,5,  5,4,6,  0,5,7]], // full alternating

    // ── SPIRAL6 (CW) ───────────────────────────────────────────────────────────
    // Outer→inner spiral, 36 cells
    // (0,0)…(0,5)(1,5)…(5,5)(5,4)…(5,0)(4,0)…(1,0)  → 20 cells
    // (1,1)…(1,4)(2,4)…(4,4)(4,3)…(4,1)(3,1)(2,1)   → 12 cells
    // (2,2)(2,3)(3,3)(3,2)                             →  4 cells
    [6, [0,0,1,  0,5,2,  5,5,3,  5,0,4,  1,0,5,  4,3,6,  3,2,7]], // full spiral pts
    [6, [0,0,1,  5,5,2,  1,0,3,  4,3,4,  3,2,5]],              // sparse spiral
    [6, [0,0,1,  0,5,2,  5,0,3,  1,1,4,  4,3,5,  3,2,6]],      // outer + inner ring
    [6, [0,0,1,  0,5,2,  5,5,3,  1,1,4,  3,1,5,  3,2,6]],      // corner spiral
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface NumCell { r: number; c: number; n: number; }
interface Stats { played: number; wins: number; streak: number; maxStreak: number; }

// ─── Component ────────────────────────────────────────────────────────────────
export default function ZipGame() {
    const dayIdx = getDayIndex();
    const [psize, flatNums] = PUZZLES[dayIdx % PUZZLES.length];

    const nums: NumCell[] = [];
    for (let i = 0; i < flatNums.length; i += 3)
        nums.push({ r: flatNums[i], c: flatNums[i + 1], n: flatNums[i + 2] });
    const maxNum = Math.max(...nums.map(n => n.n));

    const cellIdx = (r: number, c: number) => r * psize + c;
    const getNum   = (r: number, c: number) => nums.find(n => n.r === r && n.c === c);
    const isAdj    = (a: number, b: number) => {
        const ar = Math.floor(a / psize), ac = a % psize;
        const br = Math.floor(b / psize), bc = b % psize;
        return Math.abs(ar - br) + Math.abs(ac - bc) === 1;
    };

    // ── Persistence ─────────────────────────────────────────────────────────────
    const loadPath = (): number[] => {
        try {
            const raw = localStorage.getItem(todayKey());
            if (!raw) return [];
            const saved = JSON.parse(raw);
            if (saved.dayIdx !== dayIdx) return [];
            return saved.path ?? [];
        } catch { return []; }
    };
    const loadStats = (): Stats => {
        try { const r = localStorage.getItem("zip-stats"); if (r) return JSON.parse(r); } catch {}
        return { played: 0, wins: 0, streak: 0, maxStreak: 0 };
    };

    const [path, setPath] = useState<number[]>(() => loadPath());
    const [won, setWon]   = useState(() => {
        const p = loadPath();
        return p.length === psize * psize;
    });
    const [showStats, setShowStats] = useState(false);
    const [stats, setStats] = useState<Stats>(() => loadStats());

    useEffect(() => {
        localStorage.setItem(todayKey(), JSON.stringify({ path, dayIdx }));
    }, [path, dayIdx]);
    useEffect(() => {
        localStorage.setItem("zip-stats", JSON.stringify(stats));
    }, [stats]);
    useEffect(() => { if (won) setTimeout(() => setShowStats(true), 900); }, [won]);

    // ── Next required number ─────────────────────────────────────────────────────
    const getNextNum = useCallback((p: number[]) => {
        let last = 0;
        for (const idx of p) {
            const r = Math.floor(idx / psize), c = idx % psize;
            const n = getNum(r, c);
            if (n && n.n > last) last = n.n;
        }
        return last + 1;
    }, [psize, nums]); // eslint-disable-line

    // ── Try extending the path to (r, c) ────────────────────────────────────────
    const tryEnter = useCallback((r: number, c: number) => {
        const idx = cellIdx(r, c);
        setPath(prev => {
            // Start: must begin at number 1
            if (prev.length === 0) {
                return getNum(r, c)?.n === 1 ? [idx] : prev;
            }
            const last = prev[prev.length - 1];
            if (!isAdj(last, idx)) return prev;

            // Backtrack: truncate to this cell if already visited
            const pos = prev.indexOf(idx);
            if (pos !== -1) return prev.slice(0, pos + 1);

            // Numbered cell constraint: must be exactly the next required number
            const num = getNum(r, c);
            if (num && num.n !== getNextNum(prev)) return prev;

            const next = [...prev, idx];

            // Win check
            if (next.length === psize * psize && getNextNum(next) - 1 === maxNum) {
                setWon(true);
                setStats(s => {
                    const streak = s.streak + 1;
                    return { played: s.played + 1, wins: s.wins + 1, streak, maxStreak: Math.max(s.maxStreak, streak) };
                });
            }
            return next;
        });
    }, [psize, nums, maxNum, getNextNum]); // eslint-disable-line

    // ── Pointer / touch handling ─────────────────────────────────────────────────
    const gridRef    = useRef<HTMLDivElement>(null);
    const isDown     = useRef(false);

    const cellFromPt = useCallback((cx: number, cy: number): [number, number] | null => {
        const el = gridRef.current;
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const cs = rect.width / psize;
        const r = Math.floor((cy - rect.top)  / cs);
        const c = Math.floor((cx - rect.left) / cs);
        return r >= 0 && r < psize && c >= 0 && c < psize ? [r, c] : null;
    }, [psize]);

    useEffect(() => {
        const el = gridRef.current;
        if (!el) return;

        const onDown = (e: PointerEvent) => {
            if (won) return;
            e.preventDefault();
            isDown.current = true;
            el.setPointerCapture(e.pointerId);
            const cell = cellFromPt(e.clientX, e.clientY);
            if (cell) tryEnter(cell[0], cell[1]);
        };
        const onMove = (e: PointerEvent) => {
            if (!isDown.current || won) return;
            e.preventDefault();
            const cell = cellFromPt(e.clientX, e.clientY);
            if (cell) tryEnter(cell[0], cell[1]);
        };
        const onUp = () => { isDown.current = false; };

        el.addEventListener("pointerdown", onDown, { passive: false });
        el.addEventListener("pointermove", onMove, { passive: false });
        el.addEventListener("pointerup",   onUp);
        return () => {
            el.removeEventListener("pointerdown", onDown);
            el.removeEventListener("pointermove", onMove);
            el.removeEventListener("pointerup",   onUp);
        };
    }, [won, cellFromPt, tryEnter]);

    // ── Derived display state ────────────────────────────────────────────────────
    const pathSet  = new Set(path);
    const nextReq  = getNextNum(path);
    const pathColor = won ? "#22c55e" : "#3b82f6";

    // SVG polyline through cell centres (viewBox 0-100)
    const pts = path.map(idx => {
        const r = Math.floor(idx / psize), c = idx % psize;
        return `${(c + 0.5) / psize * 100},${(r + 0.5) / psize * 100}`;
    });
    const polyline = pts.join(" ");
    const lastPt   = pts[pts.length - 1];
    const sw       = (100 / psize) * 0.28; // stroke width proportional to cell size

    return (
        <div className="min-h-screen bg-[#111] text-white flex flex-col" style={{ height: "100dvh", overflow: "hidden" }}>
            <style>{`
        @keyframes zip-pop { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
        .zip-win-grid { animation: zip-pop 0.5s ease; }
        @keyframes zip-num-in { from{transform:scale(0.7);opacity:0} to{transform:scale(1);opacity:1} }
        .zip-num { animation: zip-num-in 0.2s ease; }
      `}</style>

            <Navbar />

            {/* Header */}
            <div className="border-b border-[#2a2a2a] py-3 px-4 flex items-center justify-between max-w-lg mx-auto w-full flex-shrink-0">
                <div className="text-xs text-gray-500 font-mono">
                    #{dayIdx + 1} · {new Date().toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" })}
                </div>
                <h1 className="text-xl font-black tracking-widest text-white">ZIP</h1>
                <button onClick={() => setShowStats(true)} className="text-gray-400 hover:text-white transition text-lg" aria-label="Stats">📊</button>
            </div>

            {/* Sub-header hint */}
            <div className="text-center py-1.5 px-4 flex-shrink-0">
                <p className="text-xs text-gray-500">
                    Connect <span className="text-blue-400 font-bold">1 → {maxNum}</span> in order · fill every cell
                </p>
            </div>

            {/* ── Grid ── */}
            <div className="flex flex-col items-center justify-center flex-1 min-h-0 px-4 pb-4">
                <div
                    ref={gridRef}
                    className={won ? "zip-win-grid" : ""}
                    style={{
                        position: "relative",
                        width: "100%",
                        maxWidth: Math.min(window.innerHeight * 0.55, 380, psize * 70),
                        aspectRatio: "1",
                        touchAction: "none",
                        userSelect: "none",
                        cursor: won ? "default" : "crosshair",
                    }}
                >
                    {/* Cells */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${psize}, 1fr)`,
                        gap: psize === 5 ? 4 : 3,
                        width: "100%", height: "100%",
                        position: "absolute", inset: 0,
                    }}>
                        {Array.from({ length: psize }, (_, r) =>
                            Array.from({ length: psize }, (_, c) => {
                                const idx    = cellIdx(r, c);
                                const inPath = pathSet.has(idx);
                                const num    = getNum(r, c);
                                const visited = inPath && num;
                                const isNext  = num && num.n === nextReq && !inPath;

                                return (
                                    <div key={`${r},${c}`} style={{
                                        borderRadius: psize === 5 ? 8 : 6,
                                        background: inPath
                                            ? won ? "rgba(34,197,94,0.12)" : "rgba(59,130,246,0.12)"
                                            : "#1e1e1e",
                                        border: `2px solid ${inPath
                                            ? (won ? "rgba(34,197,94,0.5)" : "rgba(59,130,246,0.4)")
                                            : "#2a2a2a"}`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        transition: "background 0.12s, border 0.12s",
                                    }}>
                                        {num && (
                                            <div className="zip-num" style={{
                                                width: "58%", height: "58%",
                                                borderRadius: "50%",
                                                background: visited
                                                    ? (won ? "#16a34a" : "#2563eb")
                                                    : isNext ? "#1d4ed8" : "#111",
                                                border: `2.5px solid ${visited
                                                    ? (won ? "#22c55e" : "#3b82f6")
                                                    : isNext ? "#3b82f6" : "#374151"}`,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontWeight: 800,
                                                fontSize: psize === 5 ? "clamp(11px,3vw,18px)" : "clamp(10px,2.6vw,15px)",
                                                color: visited || isNext ? "#fff" : "#6b7280",
                                                boxShadow: isNext ? "0 0 10px rgba(59,130,246,0.6)" : "none",
                                                transition: "all 0.2s",
                                                zIndex: 2, position: "relative",
                                            }}>
                                                {num.n}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ).flat()}
                    </div>

                    {/* SVG path overlay */}
                    <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
                    >
                        {polyline && path.length > 1 && (
                            <polyline
                                points={polyline}
                                stroke={pathColor}
                                strokeWidth={sw}
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                opacity={0.75}
                            />
                        )}
                        {/* Dot at path head */}
                        {lastPt && !won && (() => {
                            const [x, y] = lastPt.split(",").map(Number);
                            return <circle cx={x} cy={y} r={sw * 0.65} fill={pathColor} />;
                        })()}
                    </svg>
                </div>

                {/* Controls */}
                <div className="mt-4 flex items-center gap-4 flex-shrink-0">
                    {!won ? (
                        <>
                            <button
                                onClick={() => setPath([])}
                                disabled={path.length === 0}
                                className="px-5 py-2 bg-[#2a2a2a] border border-[#3a3a3a] hover:border-red-500/40 text-gray-400 hover:text-red-400 rounded-xl text-sm font-semibold transition disabled:opacity-25"
                            >↺ Reset</button>
                            {path.length > 0 && (
                                <span className="text-xs text-gray-600 font-mono">
                  {path.length}/{psize * psize} · next: <span className="text-blue-400 font-bold">{nextReq}</span>
                </span>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <span className="text-green-400 font-bold text-lg">🎉 Solved!</span>
                            <button onClick={() => setShowStats(true)}
                                    className="px-5 py-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl text-sm font-semibold hover:bg-green-500/30 transition">
                                Stats →
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Stats modal ── */}
            {showStats && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.8)" }}
                    onClick={e => { if (e.target === e.currentTarget) setShowStats(false); }}
                >
                    <div style={{
                        background: "#1a1a1a", borderRadius: 16, padding: "28px 24px",
                        width: "100%", maxWidth: 340, border: "1px solid #2a2a2a",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: 2 }}>STATISTICS</h2>
                            <button onClick={() => setShowStats(false)}
                                    style={{ background: "none", border: "none", color: "#9ca3af", fontSize: 22, cursor: "pointer" }}>×</button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 20 }}>
                            {[
                                { label: "Played",  value: stats.played },
                                { label: "Win %",   value: stats.played ? Math.round(stats.wins / stats.played * 100) : 0 },
                                { label: "Streak",  value: stats.streak },
                                { label: "Best",    value: stats.maxStreak },
                            ].map(s => (
                                <div key={s.label} style={{ textAlign: "center", background: "#2a2a2a", borderRadius: 10, padding: "10px 4px" }}>
                                    <div style={{ fontSize: 24, fontWeight: 800, color: "#3b82f6" }}>{s.value}</div>
                                    <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {won ? (
                            <div style={{ textAlign: "center", padding: 14, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12, marginBottom: 16 }}>
                                <p style={{ color: "#4ade80", fontWeight: 700, fontSize: 15 }}>✓ Today's puzzle solved!</p>
                                <p style={{ color: "#9ca3af", fontSize: 12, marginTop: 4 }}>Come back tomorrow for a new grid</p>
                            </div>
                        ) : (
                            <div style={{ textAlign: "center", padding: 14, background: "#2a2a2a", borderRadius: 12, marginBottom: 16 }}>
                                <p style={{ color: "#9ca3af", fontSize: 13 }}>Draw a path connecting <strong style={{ color: "#3b82f6" }}>1 → {maxNum}</strong></p>
                                <p style={{ color: "#6b7280", fontSize: 12, marginTop: 4 }}>Every cell must be filled</p>
                            </div>
                        )}

                        <div style={{ textAlign: "center", background: "#2a2a2a", borderRadius: 10, padding: "12px 8px" }}>
                            <p style={{ fontSize: 10, color: "#9ca3af", letterSpacing: 1 }}>NEXT PUZZLE</p>
                            <ZipCountdown />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ZipCountdown() {
    const [t, setT] = useState("");
    useEffect(() => {
        const tick = () => {
            const now  = new Date();
            const next = new Date(now); next.setHours(24, 0, 0, 0);
            const diff = next.getTime() - now.getTime();
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setT(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);
    return <p style={{ fontSize: 22, fontWeight: 800, fontFamily: "monospace", color: "#fff", marginTop: 4 }}>{t}</p>;
}