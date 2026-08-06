import { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "@/components/Navbar";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useSEO } from "@/hooks/useSEO";

// ─── Daily seed ───────────────────────────────────────────────────────────────
const EPOCH = new Date("2025-01-01").getTime();
function getDayIndex() { return Math.floor((Date.now() - EPOCH) / 86400000); }
function todayKey() {
    const d = new Date();
    return `pat-${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// ─── Puzzle definitions ───────────────────────────────────────────────────────
// 25-char binary string (row-major 5×5), then reveal label shown after solving.
// All solutions are hand-crafted from verified pixel art shapes.
const PUZZLES: [string, string][] = [
    ["0010000100111110010000100", "Plus"],
    ["0101011111111110111000100", "Heart"],
    ["1111110001100011000111111", "Frame"],
    ["0010001110111110001000100", "Arrow Up"],
    ["0100001100011110110001000", "Arrow Right"],
    ["1111100100001000010000100", "T Shape"],
    ["1000010000100001000011111", "L Shape"],
    ["0000100001000010000111111", "J Shape"],
    ["0010001110111110111000100", "Diamond"],
    ["1010111111111110111010101", "Star"],
    ["0111010101100011000101110", "Face"],
    ["1111011110100001000010000", "Flag"],
    ["1010111111111110111001110", "Crown"],
    ["0111001010010100111000100", "Goblet"],
    ["1111101110001000111011111", "Hourglass"],
    ["0111011111111110101001010", "Mushroom"],
    ["0010001110011101111101010", "Rocket"],
    ["0110000100001000010001110", "Number 1"],
    ["1000011000111001111011111", "Staircase"],
    ["0011100100011000100011000", "Lightning"],
    ["1010101010101010101010101", "Checkerboard"],
    ["1000101010001000101010001", "Bowtie"],
    ["1111000010001000100001111", "Letter Z"],
    ["0010001110111111000110001", "Mountain"],
    ["0010001110011101111100000", "Pyramid"],
    ["1000110001111111000110001", "Letter H"],
    ["0111011000100001100001110", "Pac Shape"],
    ["1000111011010100111000100", "Wave"],
    ["0010001110111110011000100", "Tree"],
    ["1111100001000010000111111", "C Shape"],
];

// ─── Nonogram helpers ─────────────────────────────────────────────────────────
function computeClue(line: boolean[]): number[] {
    const r: number[] = [];
    let run = 0;
    for (const x of line) { if (x) run++; else if (run) { r.push(run); run = 0; } }
    if (run) r.push(run);
    return r.length ? r : [0];
}
function cluesMatch(a: number[], b: number[]) {
    return a.length === b.length && a.every((v, i) => v === b[i]);
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Cell  = "unknown" | "filled" | "marked"; // marked = "definitely empty"
type Mode  = "fill" | "mark";
interface Stats { played: number; wins: number; streak: number; maxStreak: number; }

// ─── Component ────────────────────────────────────────────────────────────────
export default function PatchesGame() {
    useSEO("Daily Patches – Yassine Jdair", "Nonogram puzzle, fill the grid from number clues.", "/patches");
    const N = 5;
    const dayIdx   = getDayIndex();
    const [solStr, label] = PUZZLES[dayIdx % PUZZLES.length];
    const solution = solStr.split("").map(c => c === "1");

    // Pre-compute answer clues
    const rowClues = Array.from({ length: N }, (_, r) =>
        computeClue(solution.slice(r * N, r * N + N)));
    const colClues = Array.from({ length: N }, (_, c) =>
        computeClue(solution.filter((_, i) => i % N === c)));

    // ── Persistence ─────────────────────────────────────────────────────────────
    const blank = (): Cell[][] => Array.from({ length: N }, () => Array(N).fill("unknown" as Cell));

    const loadGrid = (): Cell[][] => {
        try {
            const raw = localStorage.getItem(todayKey());
            if (raw) { const s = JSON.parse(raw); if (s.dayIdx === dayIdx) return s.grid; }
        } catch {}
        return blank();
    };
    const [grid, setGrid]       = useState<Cell[][]>(() => loadGrid());
    const [won, setWon]         = useState(() => loadGrid().every(row => row.every(c => c !== "unknown") && true)
        && (() => { const g = loadGrid(); return rowClues.every((rc, r) => cluesMatch(computeClue(g[r].map(c => c === "filled")), rc)) && colClues.every((cc, c) => cluesMatch(computeClue(g.map(row => row[c] === "filled")), cc)); })()
    );
    const [mode, setMode]       = useState<Mode>("fill");
    const [showStats, setShowStats] = useState(false);
    const [showReveal, setShowReveal] = useState(false);
    const [stats, setStats]     = useLocalStorage<Stats>("pat-stats", { played: 0, wins: 0, streak: 0, maxStreak: 0 });
    const [flash, setFlash]     = useState<string | null>(null);

    useEffect(() => {
        localStorage.setItem(todayKey(), JSON.stringify({ grid, dayIdx }));
    }, [grid, dayIdx]);
    useEffect(() => { if (won) setTimeout(() => { setShowReveal(true); }, 700); }, [won]);

    // ── Win check ──────────────────────────────────────────────────────────────
    const checkWin = useCallback((g: Cell[][]): boolean => {
        return rowClues.every((rc, r) => cluesMatch(computeClue(g[r].map(c => c === "filled")), rc))
            && colClues.every((cc, c) => cluesMatch(computeClue(g.map(row => row[c] === "filled")), cc));
    }, [rowClues, colClues]);

    // ── Cell interaction ────────────────────────────────────────────────────────
    const handleCell = useCallback((r: number, c: number, action: Mode) => {
        if (won) return;
        setGrid(prev => {
            const next = prev.map(row => [...row]);
            const cur  = next[r][c];
            if (action === "fill") {
                next[r][c] = cur === "filled" ? "unknown" : "filled";
            } else {
                next[r][c] = cur === "marked" ? "unknown" : "marked";
            }
            if (checkWin(next)) {
                setWon(true);
                setStats(s => {
                    const streak = s.streak + 1;
                    return { played: s.played + 1, wins: s.wins + 1, streak, maxStreak: Math.max(s.maxStreak, streak) };
                });
            }
            return next;
        });
    }, [won, checkWin]);

    // Pointer drag — track which action started the drag so it stays consistent
    const dragAction = useRef<Mode | null>(null);
    const dragStart  = useCallback((r: number, c: number, e: React.PointerEvent) => {
        e.preventDefault();
        (e.target as Element).releasePointerCapture(e.pointerId);
        const action = e.button === 2 ? "mark" : mode;
        dragAction.current = action;
        handleCell(r, c, action);
    }, [mode, handleCell]);
    const dragEnter  = useCallback((r: number, c: number) => {
        if (dragAction.current) handleCell(r, c, dragAction.current);
    }, [handleCell]);
    useEffect(() => {
        const stop = () => { dragAction.current = null; };
        window.addEventListener("pointerup",   stop);
        window.addEventListener("pointercancel", stop);
        return () => { window.removeEventListener("pointerup", stop); window.removeEventListener("pointercancel", stop); };
    }, []);

    // ── Keyboard shortcuts ──────────────────────────────────────────────────────
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "f" || e.key === "F") setMode("fill");
            if (e.key === "m" || e.key === "M") setMode("mark");
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // ── Derived display ─────────────────────────────────────────────────────────
    const rowDone = rowClues.map((rc, r) => cluesMatch(computeClue(grid[r].map(c => c === "filled")), rc));
    const colDone = colClues.map((cc, c) => cluesMatch(computeClue(grid.map(row => row[c] === "filled")), cc));
    const maxColClueLen = Math.max(...colClues.map(c => c.length));

    // Filled count for progress
    const filled  = grid.flat().filter(c => c === "filled").length;
    const total   = solution.filter(Boolean).length;

    return (
        <div className="bg-[#111] text-white flex flex-col" style={{ height: "100dvh", overflow: "hidden" }}>
            <style>{`
        @keyframes pat-win { 0%{transform:scale(1)} 50%{transform:scale(1.04);filter:brightness(1.3)} 100%{transform:scale(1)} }
        .pat-win { animation: pat-win 0.5s ease; }
        @keyframes pat-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
        @keyframes pat-reveal { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
      `}</style>

            <Navbar />

            {/* Header */}
            <div className="border-b border-[#2a2a2a] py-2.5 px-4 flex items-center justify-between max-w-lg mx-auto w-full flex-shrink-0">
                <div className="text-xs text-gray-500 font-mono">
                    #{dayIdx + 1} · {new Date().toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" })}
                </div>
                <h1 className="text-xl font-black tracking-widest">PATCHES</h1>
                <button onClick={() => setShowStats(true)} className="text-gray-400 hover:text-white transition">📊</button>
            </div>

            {/* Sub-header */}
            <div className="text-center py-1.5 flex-shrink-0">
                <p className="text-xs text-gray-500">Fill the grid · numbers = runs of filled cells in each row/column</p>
            </div>

            {/* ── Main grid area ── */}
            <div className="flex flex-col items-center justify-center flex-1 min-h-0 px-3 pb-2">
                <div style={{ display: "inline-block" }}>

                    {/* Column clues + grid */}
                    <div style={{ display: "flex", alignItems: "flex-end" }}>

                        {/* Top-left spacer (for row clue column) */}
                        <div style={{ width: 48, flexShrink: 0 }} />

                        {/* Column clues */}
                        <div style={{ display: "flex", gap: 4 }}>
                            {colClues.map((clues, c) => (
                                <div key={c} style={{
                                    width: 44, display: "flex", flexDirection: "column",
                                    alignItems: "center", justifyContent: "flex-end",
                                    paddingBottom: 4, gap: 1,
                                }}>
                                    {clues.map((n, i) => (
                                        <span key={i} style={{
                                            fontSize: 13, fontWeight: 700, lineHeight: "16px",
                                            color: colDone[c] ? "#22c55e" : "#e5e7eb",
                                            transition: "color 0.2s",
                                        }}>{n}</span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Row clues + cells */}
                    <div className={won ? "pat-win" : ""}>
                        {Array.from({ length: N }, (_, r) => (
                            <div key={r} style={{ display: "flex", alignItems: "center", gap: 4, marginTop: r === 0 ? 0 : 4 }}>

                                {/* Row clue */}
                                <div style={{
                                    width: 48, display: "flex", justifyContent: "flex-end",
                                    alignItems: "center", gap: 3, paddingRight: 4, flexShrink: 0,
                                }}>
                                    {rowClues[r].map((n, i) => (
                                        <span key={i} style={{
                                            fontSize: 13, fontWeight: 700,
                                            color: rowDone[r] ? "#22c55e" : "#e5e7eb",
                                            transition: "color 0.2s",
                                        }}>{n}</span>
                                    ))}
                                </div>

                                {/* Cells */}
                                {Array.from({ length: N }, (_, c) => {
                                    const state = grid[r][c];
                                    const bg    = state === "filled"  ? (won ? "#22c55e" : "#e5e7eb")
                                        : state === "marked"  ? "#1e1e1e"
                                            : "#1e1e1e";
                                    const border = state === "filled"  ? (won ? "#22c55e" : "#e5e7eb")
                                        : state === "marked"  ? "#2a2a2a"
                                            : "#2a2a2a";

                                    return (
                                        <div
                                            key={c}
                                            onPointerDown={e => dragStart(r, c, e)}
                                            onPointerEnter={() => dragEnter(r, c)}
                                            onContextMenu={e => e.preventDefault()}
                                            style={{
                                                width: 44, height: 44,
                                                background: bg,
                                                border: `2px solid ${border}`,
                                                borderRadius: 6,
                                                cursor: won ? "default" : "pointer",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                transition: "background 0.08s, border 0.08s",
                                                touchAction: "none",
                                                userSelect: "none",
                                                flexShrink: 0,
                                            }}
                                        >
                                            {state === "marked" && (
                                                <span style={{ fontSize: 16, color: "#4b5563", fontWeight: 900, lineHeight: 1 }}>✕</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Controls ── */}
                <div className="mt-4 flex items-center gap-3 flex-shrink-0">
                    {!won ? (
                        <>
                            {/* Mode toggle */}
                            <div className="flex rounded-xl overflow-hidden border border-[#2a2a2a]">
                                <button
                                    onClick={() => setMode("fill")}
                                    style={{
                                        padding: "8px 16px", fontSize: 13, fontWeight: 700,
                                        background: mode === "fill" ? "#e5e7eb" : "#1e1e1e",
                                        color:      mode === "fill" ? "#111"    : "#6b7280",
                                        border: "none", cursor: "pointer", transition: "all 0.15s",
                                    }}
                                >■ Fill</button>
                                <button
                                    onClick={() => setMode("mark")}
                                    style={{
                                        padding: "8px 16px", fontSize: 13, fontWeight: 700,
                                        background: mode === "mark" ? "#374151" : "#1e1e1e",
                                        color:      mode === "mark" ? "#fff"    : "#6b7280",
                                        border: "none", borderLeft: "1px solid #2a2a2a", cursor: "pointer", transition: "all 0.15s",
                                    }}
                                >✕ Mark</button>
                            </div>

                            {/* Reset */}
                            <button
                                onClick={() => { setGrid(blank()); setWon(false); }}
                                className="px-4 py-2 bg-[#1e1e1e] border border-[#2a2a2a] hover:border-red-500/40 text-gray-500 hover:text-red-400 rounded-xl text-sm font-semibold transition"
                            >↺</button>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <span className="text-green-400 font-bold text-base">🎉 Solved!</span>
                            <button onClick={() => setShowStats(true)}
                                    className="px-5 py-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl text-sm font-semibold hover:bg-green-500/30 transition">
                                Stats →
                            </button>
                        </div>
                    )}
                </div>

                {/* Progress */}
                {!won && filled > 0 && (
                    <div className="mt-2 flex-shrink-0">
                        <div style={{ width: 230, height: 4, background: "#2a2a2a", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ width: `${Math.min(100, (filled / total) * 100)}%`, height: "100%", background: "#3b82f6", borderRadius: 4, transition: "width 0.2s" }} />
                        </div>
                        <p className="text-center text-xs text-gray-600 font-mono mt-1">{filled}/{total} filled</p>
                    </div>
                )}
            </div>

            {/* ── Win reveal modal ── */}
            {showReveal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.8)" }}
                    onClick={() => { setShowReveal(false); setShowStats(true); }}
                >
                    <div style={{
                        background: "#1a1a1a", borderRadius: 20, padding: "32px 28px",
                        textAlign: "center", animation: "pat-reveal 0.4s ease",
                        border: "1px solid #2a2a2a", maxWidth: 300,
                    }}>
                        {/* Pixel preview of the solved image */}
                        <div style={{
                            display: "grid", gridTemplateColumns: `repeat(${N}, 1fr)`,
                            gap: 3, width: 120, margin: "0 auto 16px",
                        }}>
                            {solution.map((filled, i) => (
                                <div key={i} style={{
                                    aspectRatio: "1", borderRadius: 3,
                                    background: filled ? "#22c55e" : "#1e1e1e",
                                    border: "1px solid #2a2a2a",
                                }} />
                            ))}
                        </div>
                        <p style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: 2 }}>{label.toUpperCase()}</p>
                        <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 6 }}>Tap to see your stats</p>
                    </div>
                </div>
            )}

            {/* ── Stats modal ── */}
            {showStats && !showReveal && (
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
                                    <div style={{ fontSize: 24, fontWeight: 800, color: "#e5e7eb" }}>{s.value}</div>
                                    <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* How to play */}
                        <div style={{ background: "#2a2a2a", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", letterSpacing: 1, marginBottom: 8 }}>HOW TO PLAY</p>
                            <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.6 }}>
                                Numbers show the <strong style={{ color: "#e5e7eb" }}>runs of filled cells</strong> in each row/column, left-to-right and top-to-bottom.
                                Use <strong style={{ color: "#e5e7eb" }}>■ Fill</strong> to fill cells, <strong style={{ color: "#e5e7eb" }}>✕ Mark</strong> to flag empty cells.
                                Drag to fill multiple cells at once.
                            </p>
                        </div>

                        <div style={{ textAlign: "center", background: "#2a2a2a", borderRadius: 10, padding: "12px 8px" }}>
                            <p style={{ fontSize: 10, color: "#9ca3af", letterSpacing: 1 }}>NEXT PUZZLE</p>
                            <PatchCountdown />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function PatchCountdown() {
    const [t, setT] = useState("");
    useEffect(() => {
        const tick = () => {
            const now  = new Date(); const next = new Date(now); next.setHours(24, 0, 0, 0);
            const diff = next.getTime() - now.getTime();
            const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
            setT(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
        };
        tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
    }, []);
    return <p style={{ fontSize: 22, fontWeight: 800, fontFamily: "monospace", color: "#fff", marginTop: 4 }}>{t}</p>;
}