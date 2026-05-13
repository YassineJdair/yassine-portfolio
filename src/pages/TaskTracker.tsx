import { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';

type Priority = "high" | "medium" | "low";
type Category = "Work" | "Personal" | "Learning" | "Health" | "Other";

interface Task {
    id: string;
    text: string;
    done: boolean;
    priority: Priority;
    category: Category;
    due: string;
    created: string;
    notes: string;
}

const PRIORITY_CONFIG: Record<Priority, { color: string; bg: string; label: string }> = {
    high:   { color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20",    label: "🔴 High" },
    medium: { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", label: "🟡 Medium" },
    low:    { color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20",  label: "🟢 Low" },
};

const CATEGORIES: Category[] = ["Work","Personal","Learning","Health","Other"];
const CAT_EMOJI: Record<Category, string> = { Work:"💼", Personal:"🏠", Learning:"📚", Health:"💊", Other:"🔧" };

const today = () => new Date().toISOString().split("T")[0];

const SAMPLE: Task[] = [
    { id: "1", text: "Build new portfolio features", done: false, priority: "high", category: "Work", due: today(), created: today(), notes: "" },
    { id: "2", text: "Go for a morning run", done: true, priority: "medium", category: "Health", due: today(), created: today(), notes: "30 mins" },
];

export default function TaskTracker() {
    const [tasks, setTasks] = useState<Task[]>(() => {
        try { return JSON.parse(localStorage.getItem("tasks-v2") || JSON.stringify(SAMPLE)); } catch { return SAMPLE; }
    });
    const [filter, setFilter] = useState<"all"|"active"|"done">("all");
    const [catFilter, setCatFilter] = useState<Category|"All">("All");
    const [priorityFilter, setPriorityFilter] = useState<Priority|"All">("All");
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    // Form state
    const [text, setText] = useState("");
    const [priority, setPriority] = useState<Priority>("medium");
    const [category, setCategory] = useState<Category>("Work");
    const [due, setDue] = useState(today());
    const [notes, setNotes] = useState("");

    useEffect(() => { localStorage.setItem("tasks-v2", JSON.stringify(tasks)); }, [tasks]);

    const clearForm = () => { setText(""); setPriority("medium"); setCategory("Work"); setDue(today()); setNotes(""); setEditId(null); setShowForm(false); };

    const save = () => {
        if (!text.trim()) return;
        if (editId) {
            setTasks(ts => ts.map(t => t.id === editId ? { ...t, text: text.trim(), priority, category, due, notes } : t));
        } else {
            setTasks(ts => [...ts, { id: Date.now().toString(), text: text.trim(), priority, category, due, created: today(), notes, done: false }]);
        }
        clearForm();
    };

    const startEdit = (t: Task) => {
        setText(t.text); setPriority(t.priority); setCategory(t.category); setDue(t.due); setNotes(t.notes);
        setEditId(t.id); setShowForm(true);
    };

    const toggle = (id: string) => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
    const remove = (id: string) => setTasks(ts => ts.filter(t => t.id !== id));

    const filtered = useMemo(() =>
            tasks
                .filter(t => filter === "all" || (filter === "active" ? !t.done : t.done))
                .filter(t => catFilter === "All" || t.category === catFilter)
                .filter(t => priorityFilter === "All" || t.priority === priorityFilter)
                .filter(t => !search || t.text.toLowerCase().includes(search.toLowerCase()))
                .sort((a, b) => {
                    if (a.done !== b.done) return a.done ? 1 : -1;
                    const po = { high: 0, medium: 1, low: 2 };
                    return po[a.priority] - po[b.priority];
                }),
        [tasks, filter, catFilter, priorityFilter, search]);

    const stats = useMemo(() => ({
        total: tasks.length,
        done: tasks.filter(t => t.done).length,
        high: tasks.filter(t => t.priority === "high" && !t.done).length,
        overdue: tasks.filter(t => !t.done && t.due && t.due < today()).length,
    }), [tasks]);

    const isOverdue = (t: Task) => !t.done && t.due && t.due < today();

    return (
        <Layout>
            <div className="py-12 px-4">
                <div className="max-w-3xl mx-auto space-y-5">
                    <h1 className="text-3xl font-bold text-center">✅ Task Tracker</h1>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: "Total", value: stats.total, color: "text-white" },
                            { label: "Done", value: stats.done, color: "text-green-400" },
                            { label: "🔴 Urgent", value: stats.high, color: "text-red-400" },
                            { label: "Overdue", value: stats.overdue, color: "text-orange-400" },
                        ].map(s => (
                            <div key={s.label} className="bg-[#2a2a2a] rounded-2xl p-3 text-center border border-[#3a3a3a]">
                                <div className="text-gray-500 text-xs">{s.label}</div>
                                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Progress bar */}
                    {stats.total > 0 && (
                        <div className="bg-[#2a2a2a] rounded-2xl p-4">
                            <div className="flex justify-between text-xs text-gray-400 mb-2">
                                <span>Progress</span>
                                <span>{stats.done}/{stats.total} tasks</span>
                            </div>
                            <div className="h-2.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                                     style={{ width: `${(stats.done / stats.total) * 100}%` }} />
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="space-y-2">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."
                                   className="w-full bg-[#2a2a2a] border border-[#3a3a3a] focus:border-yellow-500 rounded-xl pl-9 pr-4 py-2.5 outline-none transition text-sm" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(["all","active","done"] as const).map(f => (
                                <button key={f} onClick={() => setFilter(f)}
                                        className={`px-4 py-1.5 rounded-xl text-sm capitalize transition ${filter === f ? "bg-yellow-500 text-black font-medium" : "bg-[#2a2a2a] text-gray-400 border border-[#3a3a3a] hover:border-yellow-500"}`}>
                                    {f}
                                </button>
                            ))}
                            <select value={catFilter} onChange={e => setCatFilter(e.target.value as any)}
                                    className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-1.5 text-sm outline-none text-gray-400">
                                <option>All</option>
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value as any)}
                                    className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-1.5 text-sm outline-none text-gray-400">
                                <option>All</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                    </div>

                    {/* Add/Edit form */}
                    {showForm ? (
                        <div className="bg-[#2a2a2a] rounded-2xl p-5 space-y-3 border border-yellow-500/30">
                            <p className="font-semibold">{editId ? "Edit Task" : "New Task"}</p>
                            <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && save()}
                                   placeholder="What needs to be done?" autoFocus
                                   className="w-full bg-[#1a1a1a] border border-[#3a3a3a] focus:border-yellow-500 rounded-xl px-4 py-2.5 outline-none text-sm" />
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Priority</label>
                                    <select value={priority} onChange={e => setPriority(e.target.value as Priority)}
                                            className="w-full bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-500">
                                        <option value="high">🔴 High</option>
                                        <option value="medium">🟡 Medium</option>
                                        <option value="low">🟢 Low</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Category</label>
                                    <select value={category} onChange={e => setCategory(e.target.value as Category)}
                                            className="w-full bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-500">
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Due date</label>
                                <input type="date" value={due} onChange={e => setDue(e.target.value)}
                                       className="w-full bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-500" />
                            </div>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)" rows={2}
                                      className="w-full bg-[#1a1a1a] border border-[#3a3a3a] focus:border-yellow-500 rounded-xl px-4 py-2.5 outline-none text-sm resize-none" />
                            <div className="flex gap-2">
                                <button onClick={save} className="flex-1 bg-yellow-500 text-black py-2.5 rounded-xl font-semibold hover:bg-yellow-400 transition text-sm">
                                    {editId ? "Save Changes" : "Add Task"}
                                </button>
                                <button onClick={clearForm} className="px-5 bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl hover:bg-[#3a3a3a] transition text-sm text-gray-400">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setShowForm(true)}
                                className="w-full border-2 border-dashed border-[#3a3a3a] hover:border-yellow-500 text-gray-400 hover:text-yellow-500 py-3 rounded-2xl transition font-medium text-sm">
                            + Add Task
                        </button>
                    )}

                    {/* Task list */}
                    <div className="space-y-2">
                        {filtered.length === 0 && <p className="text-gray-500 text-sm text-center py-8">No tasks match your filters</p>}
                        {filtered.map(t => (
                            <div key={t.id} className={`bg-[#2a2a2a] rounded-2xl px-4 py-3 border group transition ${t.done ? "opacity-60" : ""} ${isOverdue(t) ? "border-orange-500/30" : "border-[#3a3a3a]"}`}>
                                <div className="flex items-start gap-3">
                                    <button onClick={() => toggle(t.id)}
                                            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${t.done ? "bg-yellow-500 border-yellow-500" : "border-gray-500 hover:border-yellow-500"}`}>
                                        {t.done && <span className="text-black text-xs font-bold">✓</span>}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${t.done ? "line-through text-gray-500" : ""}`}>{t.text}</p>
                                        {t.notes && <p className="text-xs text-gray-600 mt-0.5 truncate">{t.notes}</p>}
                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${PRIORITY_CONFIG[t.priority].bg} ${PRIORITY_CONFIG[t.priority].color}`}>
                        {PRIORITY_CONFIG[t.priority].label}
                      </span>
                                            <span className="text-xs text-gray-500">{CAT_EMOJI[t.category]} {t.category}</span>
                                            {t.due && (
                                                <span className={`text-xs ${isOverdue(t) ? "text-orange-400 font-medium" : "text-gray-600"}`}>
                          📅 {isOverdue(t) ? "Overdue · " : ""}{new Date(t.due + "T12:00:00").toLocaleDateString("en-IE", { day: "numeric", month: "short" })}
                        </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                                        <button onClick={() => startEdit(t)} className="p-1.5 text-gray-500 hover:text-yellow-400 transition text-xs">✏️</button>
                                        <button onClick={() => remove(t.id)} className="p-1.5 text-gray-500 hover:text-red-400 transition text-lg leading-none">×</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {tasks.filter(t => t.done).length > 0 && (
                        <button onClick={() => setTasks(ts => ts.filter(t => !t.done))}
                                className="text-xs text-gray-600 hover:text-red-400 transition">
                            🗑 Clear {tasks.filter(t => t.done).length} completed task{tasks.filter(t=>t.done).length!==1?"s":""}
                        </button>
                    )}
                </div>
            </div>
        </Layout>
    );
}