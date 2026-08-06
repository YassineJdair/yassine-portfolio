import { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '@/components/Layout';
import { useSEO } from '@/hooks/useSEO';

type Mode = 'focus' | 'short' | 'long';

interface Task { id: string; text: string; done: boolean; pomos: number; }
interface Log { time: string; label: string; duration: number; }

const DEFAULTS = { focus: 25, short: 5, long: 15 };
const MODE_COLORS: Record<Mode, string> = { focus: "text-red-400", short: "text-green-400", long: "text-blue-400" };
const MODE_BG: Record<Mode, string> = { focus: "bg-red-500", short: "bg-green-500", long: "bg-blue-500" };
const MODE_LABELS: Record<Mode, string> = { focus: "Focus", short: "Short Break", long: "Long Break" };

export default function PomodoroTimer() {
    useSEO("Pomodoro Timer – Yassine Jdair", "Productivity tool using the Pomodoro technique to improve focus and work efficiency.", "/pomodoro-timer");
    const [mode, setMode] = useState<Mode>('focus');
    const [durations, setDurations] = useState(DEFAULTS);
    const [seconds, setSeconds] = useState(DEFAULTS.focus * 60);
    const [running, setRunning] = useState(false);
    const [sessions, setSessions] = useState(0);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [log, setLog] = useState<Log[]>([]);
    const [newTask, setNewTask] = useState("");
    const [activeTask, setActiveTask] = useState<string | null>(null);
    const [tab, setTab] = useState<"timer"|"tasks"|"log">("timer");
    const [editDur, setEditDur] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const total = durations[mode] * 60;
    const progress = seconds / total;

    const switchMode = useCallback((m: Mode) => {
        setMode(m); setSeconds(durations[m] * 60); setRunning(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
    }, [durations]);

    const addToLog = useCallback((m: Mode, dur: number) => {
        setLog(l => [{
            time: new Date().toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" }),
            label: MODE_LABELS[m],
            duration: Math.round((dur * 60 - seconds) / 60),
        }, ...l].slice(0, 50));
    }, [seconds]);

    useEffect(() => {
        if (!running) return;
        intervalRef.current = setInterval(() => {
            setSeconds(s => {
                if (s <= 1) {
                    // Session complete
                    if (mode === 'focus') {
                        const ns = sessions + 1;
                        setSessions(ns);
                        // Mark active task pomo
                        if (activeTask) setTasks(ts => ts.map(t => t.id === activeTask ? { ...t, pomos: t.pomos + 1 } : t));
                        addToLog('focus', durations.focus);
                        const next: Mode = ns % 4 === 0 ? 'long' : 'short';
                        setMode(next); setRunning(false);
                        return durations[next] * 60;
                    } else {
                        addToLog(mode, durations[mode]);
                        setMode('focus'); setRunning(false);
                        return durations.focus * 60;
                    }
                }
                return s - 1;
            });
        }, 1000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [running, mode, sessions, durations, activeTask, addToLog]);

    const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

    const circumference = 2 * Math.PI * 54;

    const addTask = () => {
        if (!newTask.trim()) return;
        setTasks(t => [...t, { id: Date.now().toString(), text: newTask.trim(), done: false, pomos: 0 }]);
        setNewTask("");
    };

    const totalFocusTime = log.filter(l => l.label === "Focus").reduce((s, l) => s + l.duration, 0);

    return (
        <Layout>
            <div className="py-12 px-4">
                <div className="max-w-lg mx-auto space-y-5">
                    <h1 className="text-3xl font-bold text-center">🍅 Pomodoro Timer</h1>

                    {/* Tabs */}
                    <div className="flex bg-[#1a1a1a] rounded-2xl p-1 gap-1">
                        {(["timer","tasks","log"] as const).map(t => (
                            <button key={t} onClick={() => setTab(t)}
                                    className={`flex-1 py-2 rounded-xl capitalize text-sm font-medium transition ${tab === t ? "bg-yellow-500 text-black" : "text-gray-400 hover:text-white"}`}>
                                {t === "timer" ? "⏱ Timer" : t === "tasks" ? `📋 Tasks (${tasks.filter(t=>!t.done).length})` : "📊 Log"}
                            </button>
                        ))}
                    </div>

                    {/* ── TIMER ── */}
                    {tab === "timer" && (
                        <div className="bg-[#2a2a2a] rounded-2xl p-6 space-y-5">
                            {/* Mode selector */}
                            <div className="flex gap-2">
                                {(["focus","short","long"] as Mode[]).map(m => (
                                    <button key={m} onClick={() => switchMode(m)}
                                            className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${mode === m ? `${MODE_BG[m]} text-white` : "bg-[#1a1a1a] text-gray-400 hover:text-white border border-[#3a3a3a]"}`}>
                                        {m === "focus" ? "Focus" : m === "short" ? "Short" : "Long"}
                                    </button>
                                ))}
                            </div>

                            {/* Clock */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="relative w-40 h-40">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                        <circle cx="60" cy="60" r="54" fill="none" stroke="#1a1a1a" strokeWidth="10" />
                                        <circle cx="60" cy="60" r="54" fill="none"
                                                stroke={mode === "focus" ? "#ef4444" : mode === "short" ? "#22c55e" : "#3b82f6"}
                                                strokeWidth="10" strokeLinecap="round"
                                                strokeDasharray={circumference}
                                                strokeDashoffset={circumference * (1 - progress)}
                                                style={{ transition: "stroke-dashoffset 1s linear" }} />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className={`text-3xl font-mono font-bold ${MODE_COLORS[mode]}`}>{fmt(seconds)}</span>
                                        <span className="text-xs text-gray-500 mt-1">{MODE_LABELS[mode]}</span>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex gap-3">
                                    <button onClick={() => setRunning(r => !r)}
                                            className={`px-8 py-2.5 rounded-xl font-bold transition ${running ? "bg-gray-600 hover:bg-gray-500" : `${MODE_BG[mode]} hover:opacity-90`} text-white`}>
                                        {running ? "⏸ Pause" : "▶ Start"}
                                    </button>
                                    <button onClick={() => { switchMode(mode); setRunning(false); }}
                                            className="px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#3a3a3a] hover:bg-[#3a3a3a] transition text-gray-400">
                                        ↺
                                    </button>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: "Sessions", value: sessions },
                                    { label: "Focus time", value: `${totalFocusTime}m` },
                                    { label: "Until long", value: `${4 - (sessions % 4)} left` },
                                ].map(s => (
                                    <div key={s.label} className="bg-[#1a1a1a] rounded-xl p-3 text-center">
                                        <div className="text-gray-500 text-xs">{s.label}</div>
                                        <div className="text-white font-bold mt-0.5">{s.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Active task */}
                            {tasks.filter(t => !t.done).length > 0 && (
                                <div>
                                    <p className="text-gray-400 text-xs mb-2">Working on</p>
                                    <select value={activeTask || ""} onChange={e => setActiveTask(e.target.value || null)}
                                            className="w-full bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-500">
                                        <option value="">— Select a task —</option>
                                        {tasks.filter(t => !t.done).map(t => <option key={t.id} value={t.id}>{t.text}</option>)}
                                    </select>
                                </div>
                            )}

                            {/* Custom durations */}
                            <button onClick={() => setEditDur(d => !d)} className="text-xs text-gray-500 hover:text-yellow-400 transition">
                                {editDur ? "▲ Hide" : "▼ Custom durations"}
                            </button>
                            {editDur && (
                                <div className="grid grid-cols-3 gap-2">
                                    {(["focus","short","long"] as Mode[]).map(m => (
                                        <div key={m}>
                                            <label className="text-xs text-gray-500 block mb-1">{MODE_LABELS[m]} (min)</label>
                                            <input type="number" min={1} max={120} value={durations[m]}
                                                   onChange={e => { const v = Number(e.target.value); setDurations(d => ({ ...d, [m]: v })); if (mode === m) setSeconds(v * 60); }}
                                                   className="w-full bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg px-2 py-1.5 text-sm outline-none focus:border-yellow-500" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── TASKS ── */}
                    {tab === "tasks" && (
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()}
                                       placeholder="Add a task..."
                                       className="flex-1 bg-[#2a2a2a] border border-[#3a3a3a] focus:border-yellow-500 rounded-xl px-4 py-2.5 outline-none text-sm" />
                                <button onClick={addTask} className="bg-yellow-500 text-black px-5 py-2.5 rounded-xl font-semibold hover:bg-yellow-400 transition text-sm">Add</button>
                            </div>

                            {tasks.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-8">No tasks yet</p>
                            ) : (
                                tasks.map(t => (
                                    <div key={t.id} className={`bg-[#2a2a2a] rounded-2xl px-4 py-3 flex items-center gap-3 ${t.done ? "opacity-50" : ""}`}>
                                        <button onClick={() => setTasks(ts => ts.map(x => x.id === t.id ? { ...x, done: !x.done } : x))}
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition ${t.done ? "bg-yellow-500 border-yellow-500" : "border-gray-500 hover:border-yellow-500"}`}>
                                            {t.done && <span className="text-black text-xs font-bold">✓</span>}
                                        </button>
                                        <span className={`flex-1 text-sm ${t.done ? "line-through text-gray-500" : ""}`}>{t.text}</span>
                                        {t.pomos > 0 && <span className="text-xs text-red-400 shrink-0">🍅×{t.pomos}</span>}
                                        <button onClick={() => setTasks(ts => ts.filter(x => x.id !== t.id))}
                                                className="text-gray-600 hover:text-red-400 transition text-lg leading-none">×</button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* ── LOG ── */}
                    {tab === "log" && (
                        <div className="space-y-2">
                            {log.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-8">No sessions yet</p>
                            ) : (
                                log.map((l, i) => (
                                    <div key={i} className="bg-[#2a2a2a] rounded-xl px-4 py-3 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-500 font-mono">{l.time}</span>
                                            <span className={`text-sm font-medium ${l.label === "Focus" ? "text-red-400" : "text-green-400"}`}>{l.label}</span>
                                        </div>
                                        <span className="text-xs text-gray-500">{l.duration}m</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}