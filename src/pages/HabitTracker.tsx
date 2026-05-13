import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";

interface Habit {
    id: string;
    name: string;
    emoji: string;
    color: string;
    completions: string[]; // ISO date strings
}

const COLORS = ["#EAB308", "#22C55E", "#3B82F6", "#EC4899", "#8B5CF6", "#F97316", "#14B8A6", "#EF4444"];
const EMOJIS = ["💪", "📚", "🏃", "💧", "🧘", "🎯", "✍️", "🛌", "🥗", "💻", "🎵", "🚴"];

const today = () => new Date().toISOString().split("T")[0];
const dateStr = (d: Date) => d.toISOString().split("T")[0];

const getLast7Days = () =>
    Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return dateStr(d);
    });

const getStreak = (completions: string[]) => {
    let streak = 0;
    const d = new Date();
    while (true) {
        const s = dateStr(d);
        if (completions.includes(s)) {
            streak++;
            d.setDate(d.getDate() - 1);
        } else break;
    }
    return streak;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function HabitTracker() {
    const [habits, setHabits] = useState<Habit[]>(() => {
        try { return JSON.parse(localStorage.getItem("habits") || "[]"); } catch { return []; }
    });
    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState("");
    const [newEmoji, setNewEmoji] = useState("💪");
    const [newColor, setNewColor] = useState(COLORS[0]);

    useEffect(() => {
        localStorage.setItem("habits", JSON.stringify(habits));
    }, [habits]);

    const addHabit = () => {
        if (!newName.trim()) return;
        setHabits(h => [...h, {
            id: Date.now().toString(),
            name: newName.trim(),
            emoji: newEmoji,
            color: newColor,
            completions: [],
        }]);
        setNewName(""); setShowAdd(false);
    };

    const toggle = (id: string, date: string) => {
        setHabits(h => h.map(habit => {
            if (habit.id !== id) return habit;
            const has = habit.completions.includes(date);
            return { ...habit, completions: has ? habit.completions.filter(d => d !== date) : [...habit.completions, date] };
        }));
    };

    const remove = (id: string) => setHabits(h => h.filter(x => x.id !== id));

    const last7 = getLast7Days();
    const todayStr = today();
    const completedToday = habits.filter(h => h.completions.includes(todayStr)).length;

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white">
            <Navbar />
            <div className="flex flex-col items-center py-12 px-4">
                <h1 className="text-3xl font-bold mb-2">🎯 Habit Tracker</h1>
                <p className="text-gray-400 mb-8">Build streaks, track your progress</p>

                {/* Stats */}
                <div className="w-full max-w-2xl grid grid-cols-3 gap-4 mb-6">
                    {[
                        { label: "Today", value: `${completedToday}/${habits.length}`, sub: "completed" },
                        { label: "Best Streak", value: habits.length ? Math.max(0, ...habits.map(h => getStreak(h.completions))) : 0, sub: "days" },
                        { label: "Total Habits", value: habits.length, sub: "tracked" },
                    ].map(s => (
                        <div key={s.label} className="bg-[#2a2a2a] rounded-2xl p-4 text-center">
                            <p className="text-gray-400 text-xs mb-1">{s.label}</p>
                            <p className="text-2xl font-bold text-yellow-500">{s.value}</p>
                            <p className="text-gray-600 text-xs">{s.sub}</p>
                        </div>
                    ))}
                </div>

                <div className="w-full max-w-2xl space-y-3">
                    {/* Day headers */}
                    {habits.length > 0 && (
                        <div className="flex items-center gap-2 px-4 overflow-x-auto">
                            <div className="flex-1 min-w-[80px]" />
                            <div className="flex gap-1">
                                {last7.map(d => (
                                    <div key={d} className={`w-7 sm:w-8 text-center text-xs font-medium flex-shrink-0 ${d === todayStr ? "text-yellow-500" : "text-gray-500"}`}>
                                        {DAY_LABELS[new Date(d + "T12:00:00").getDay()]}
                                    </div>
                                ))}
                            </div>
                            <div className="w-12 sm:w-16 text-center text-xs text-gray-500 flex-shrink-0">Streak</div>
                        </div>
                    )}

                    {/* Habits */}
                    {habits.map(habit => {
                        const streak = getStreak(habit.completions);
                        return (
                            <div key={habit.id} className="bg-[#2a2a2a] rounded-2xl px-3 sm:px-4 py-3 flex items-center gap-2 sm:gap-3 group">
                                <span className="text-xl w-7 sm:w-8 text-center flex-shrink-0">{habit.emoji}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate text-sm sm:text-base">{habit.name}</p>
                                </div>
                                <div className="flex gap-1 items-center">
                                    {last7.map(d => {
                                        const done = habit.completions.includes(d);
                                        const isToday = d === todayStr;
                                        return (
                                            <button key={d} onClick={() => toggle(habit.id, d)}
                                                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition-all flex-shrink-0 flex items-center justify-center ${done ? "scale-95" : "hover:scale-105"}`}
                                                    style={{ background: done ? habit.color : "#1a1a1a", border: `2px solid ${isToday ? habit.color : "#3a3a3a"}` }}>
                                                {done && <span className="text-black text-xs font-bold">✓</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="w-12 sm:w-16 text-center flex-shrink-0">
                <span className="text-xs sm:text-sm font-bold" style={{ color: streak > 0 ? habit.color : "#6b7280" }}>
                  {streak > 0 ? `🔥 ${streak}` : "—"}
                </span>
                                </div>
                                <button onClick={() => remove(habit.id)}
                                        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition text-lg leading-none flex-shrink-0">×</button>
                            </div>
                        );
                    })}

                    {/* Empty state */}
                    {habits.length === 0 && !showAdd && (
                        <div className="text-center py-16 text-gray-500">
                            <p className="text-5xl mb-4">🌱</p>
                            <p>No habits yet. Add your first one!</p>
                        </div>
                    )}

                    {/* Add habit form */}
                    {showAdd && (
                        <div className="bg-[#2a2a2a] rounded-2xl p-5 space-y-4">
                            <p className="font-semibold">New Habit</p>
                            <input value={newName} onChange={e => setNewName(e.target.value)}
                                   onKeyDown={e => e.key === "Enter" && addHabit()}
                                   placeholder="Habit name..."
                                   className="w-full bg-[#1a1a1a] border border-[#3a3a3a] focus:border-yellow-500 rounded-xl px-4 py-2.5 outline-none transition"
                            />
                            <div>
                                <p className="text-gray-400 text-sm mb-2">Emoji</p>
                                <div className="flex flex-wrap gap-2">
                                    {EMOJIS.map(e => (
                                        <button key={e} onClick={() => setNewEmoji(e)}
                                                className={`w-10 h-10 rounded-xl text-xl transition ${newEmoji === e ? "bg-yellow-500/20 ring-2 ring-yellow-500" : "bg-[#1a1a1a] hover:bg-[#3a3a3a]"}`}>
                                            {e}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-2">Color</p>
                                <div className="flex gap-2">
                                    {COLORS.map(c => (
                                        <button key={c} onClick={() => setNewColor(c)}
                                                className={`w-8 h-8 rounded-full transition ${newColor === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#2a2a2a] scale-110" : ""}`}
                                                style={{ background: c }} />
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={addHabit}
                                        className="flex-1 bg-yellow-500 text-black py-2.5 rounded-xl font-semibold hover:bg-yellow-400 transition">
                                    Add Habit
                                </button>
                                <button onClick={() => setShowAdd(false)}
                                        className="px-5 bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl hover:bg-[#3a3a3a] transition">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {!showAdd && (
                        <button onClick={() => setShowAdd(true)}
                                className="w-full border-2 border-dashed border-[#3a3a3a] hover:border-yellow-500 text-gray-400 hover:text-yellow-500 py-3 rounded-2xl transition font-medium">
                            + Add Habit
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}