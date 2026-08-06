import Navbar from "@/components/Navbar";
import { useState, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useSEO } from "@/hooks/useSEO";

interface Entry {
    id: string;
    label: string;
    amount: number;
    category: string;
    type: "income" | "expense";
    date: string; // YYYY-MM-DD
    recurring: boolean;
}

interface Budget {
    category: string;
    limit: number;
}

const EXPENSE_CATS = [
    "🏠 Housing", "🚗 Transport", "🛒 Groceries", "🍔 Eating Out",
    "💡 Utilities", "📱 Subscriptions", "🎮 Entertainment", "👕 Clothing",
    "💊 Health", "📚 Education", "✈️ Travel", "💰 Savings", "🔧 Other",
];
const INCOME_CATS = ["💼 Salary", "💻 Freelance", "📈 Investments", "🏠 Rental", "🎁 Other Income"];

const CAT_COLORS = [
    "#EAB308","#22C55E","#3B82F6","#EC4899","#8B5CF6",
    "#F97316","#14B8A6","#EF4444","#06B6D4","#84CC16","#F59E0B","#6366F1","#78716C",
];

const fmt = (n: number) =>
    new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const fmtFull = (n: number) =>
    new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(n);

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const todayStr = () => new Date().toISOString().split("T")[0];

export default function ExpenseTracker() {
    useSEO("Finance Tracker – Yassine Jdair", "Full budget planner with income vs expenses, category budgets, transaction history, and smart insights.", "/expense-tracker");
    const [entries, setEntries] = useLocalStorage<Entry[]>("et-entries", []);
    const [budgets, setBudgets] = useLocalStorage<Budget[]>("et-budgets", []);

    const now = new Date();
    const [viewMonth, setViewMonth] = useState(now.getMonth());
    const [viewYear, setViewYear] = useState(now.getFullYear());
    const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "budgets" | "insights">("overview");

    // Form
    const [type, setType] = useState<"income" | "expense">("expense");
    const [label, setLabel] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState(EXPENSE_CATS[0]);
    const [date, setDate] = useState(todayStr());
    const [recurring, setRecurring] = useState(false);

    // Filters
    const [search, setSearch] = useState("");
    const [filterCat, setFilterCat] = useState("All");

    // Budget form
    const [budgetCat, setBudgetCat] = useState(EXPENSE_CATS[0]);
    const [budgetLimit, setBudgetLimit] = useState("");

    // Month entries
    const monthEntries = useMemo(() =>
        entries.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
        }), [entries, viewMonth, viewYear]);

    const totalIncome = monthEntries.filter(e => e.type === "income").reduce((s, e) => s + e.amount, 0);
    const totalExpenses = monthEntries.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;

    const add = () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
        const entry: Entry = {
            id: Date.now().toString(),
            label: label.trim() || category,
            amount: Number(amount),
            category,
            type,
            date,
            recurring,
        };
        setEntries(e => [entry, ...e]);
        setLabel(""); setAmount(""); setRecurring(false);
    };

    const remove = (id: string) => setEntries(e => e.filter(x => x.id !== id));

    // Expense by category
    const expByCategory = useMemo(() => {
        const map: Record<string, number> = {};
        monthEntries.filter(e => e.type === "expense").forEach(e => {
            map[e.category] = (map[e.category] || 0) + e.amount;
        });
        return Object.entries(map).sort((a, b) => b[1] - a[1]);
    }, [monthEntries]);

    // Last 6 months data
    const last6Months = useMemo(() => {
        return Array.from({ length: 6 }, (_, i) => {
            const d = new Date(viewYear, viewMonth - 5 + i, 1);
            const m = d.getMonth(), y = d.getFullYear();
            const mes = entries.filter(e => {
                const ed = new Date(e.date);
                return ed.getMonth() === m && ed.getFullYear() === y;
            });
            return {
                label: MONTHS[m],
                income: mes.filter(e => e.type === "income").reduce((s, e) => s + e.amount, 0),
                expense: mes.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0),
            };
        });
    }, [entries, viewMonth, viewYear]);

    const maxBar = Math.max(...last6Months.map(m => Math.max(m.income, m.expense)), 1);

    // Filtered transactions
    const filtered = useMemo(() =>
            monthEntries
                .filter(e => filterCat === "All" || e.category === filterCat)
                .filter(e => !search || e.label.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase()))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        [monthEntries, filterCat, search]);

    // Budget tracking
    const budgetStatus = useMemo(() =>
        budgets.map(b => {
            const spent = monthEntries.filter(e => e.type === "expense" && e.category === b.category).reduce((s, e) => s + e.amount, 0);
            const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
            return { ...b, spent, pct };
        }), [budgets, monthEntries]);

    const addBudget = () => {
        if (!budgetLimit || isNaN(Number(budgetLimit))) return;
        setBudgets(b => {
            const existing = b.findIndex(x => x.category === budgetCat);
            if (existing >= 0) { const nb = [...b]; nb[existing].limit = Number(budgetLimit); return nb; }
            return [...b, { category: budgetCat, limit: Number(budgetLimit) }];
        });
        setBudgetLimit("");
    };

    // Insights
    const insights = useMemo(() => {
        const tips: { icon: string; text: string; color: string }[] = [];
        if (savingsRate < 0) tips.push({ icon: "🚨", text: "You're spending more than you earn this month!", color: "text-red-400" });
        else if (savingsRate < 10) tips.push({ icon: "⚠️", text: `Savings rate is low at ${savingsRate.toFixed(1)}%. Aim for 20%+.`, color: "text-orange-400" });
        else tips.push({ icon: "✅", text: `Great! You're saving ${savingsRate.toFixed(1)}% of your income.`, color: "text-green-400" });

        const topCat = expByCategory[0];
        if (topCat) tips.push({ icon: "📊", text: `Biggest spend: ${topCat[0]} at ${fmt(topCat[1])} (${totalExpenses > 0 ? ((topCat[1]/totalExpenses)*100).toFixed(0) : 0}% of expenses).`, color: "text-blue-400" });

        const overBudget = budgetStatus.filter(b => b.pct > 100);
        if (overBudget.length > 0) tips.push({ icon: "🔴", text: `Over budget in ${overBudget.length} categor${overBudget.length > 1 ? "ies" : "y"}: ${overBudget.map(b => b.category.split(" ")[1]).join(", ")}.`, color: "text-red-400" });

        const recurring = monthEntries.filter(e => e.recurring && e.type === "expense");
        if (recurring.length > 0) tips.push({ icon: "🔁", text: `${recurring.length} recurring expense${recurring.length > 1 ? "s" : ""} totalling ${fmt(recurring.reduce((s, e) => s + e.amount, 0))}.`, color: "text-yellow-400" });

        return tips;
    }, [savingsRate, expByCategory, totalExpenses, budgetStatus, monthEntries]);

    const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
    const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };
    const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear();

    const tabs = ["overview", "transactions", "budgets", "insights"] as const;

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white pb-12">
            <Navbar />
            <div className="flex flex-col items-center px-4 py-12">
                {/* Header */}
                <div className="bg-[#2a2a2a] border-b border-[#3a3a3a] px-4 py-6 w-full">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">💳 Finance Tracker</h1>
                                <p className="text-gray-400 text-sm">Budget · Expenses · Insights</p>
                            </div>
                            {/* Month navigator */}
                            <div className="flex items-center gap-3 bg-[#1a1a1a] rounded-2xl px-4 py-2 self-start sm:self-auto">
                                <button onClick={prevMonth} className="text-gray-400 hover:text-white transition px-1">‹</button>
                                <span className="font-semibold min-w-[120px] text-center">{MONTHS[viewMonth]} {viewYear}</span>
                                <button onClick={nextMonth} disabled={isCurrentMonth} className="text-gray-400 hover:text-white disabled:opacity-30 transition px-1">›</button>
                            </div>
                        </div>

                        {/* Summary cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                            {[
                                { label: "Income", value: fmt(totalIncome), color: "text-green-400", border: "border-green-500/20" },
                                { label: "Expenses", value: fmt(totalExpenses), color: "text-red-400", border: "border-red-500/20" },
                                { label: "Balance", value: fmt(balance), color: balance >= 0 ? "text-green-400" : "text-red-400", border: balance >= 0 ? "border-green-500/20" : "border-red-500/20" },
                                { label: "Savings Rate", value: `${savingsRate.toFixed(1)}%`, color: savingsRate >= 20 ? "text-green-400" : savingsRate >= 10 ? "text-yellow-400" : "text-red-400", border: "border-yellow-500/20" },
                            ].map(c => (
                                <div key={c.label} className={`bg-[#1a1a1a] rounded-2xl p-3 border ${c.border}`}>
                                    <p className="text-gray-500 text-xs mb-1">{c.label}</p>
                                    <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-5xl px-0 mt-6 space-y-6">
                    {/* Tabs — scrollable on very small screens */}
                    <div className="flex gap-1 bg-[#2a2a2a] p-1.5 rounded-2xl overflow-x-auto">
                        {tabs.map(t => (
                            <button key={t} onClick={() => setActiveTab(t)}
                                    className={`flex-1 min-w-[72px] py-2 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap ${activeTab === t ? "bg-yellow-500 text-black" : "text-gray-400 hover:text-white"}`}>
                                {t === "overview" ? "📊 Overview" : t === "transactions" ? "💳 Txns" : t === "budgets" ? "🎯 Budgets" : "💡 Insights"}
                            </button>
                        ))}
                    </div>

                    {/* ── OVERVIEW ── */}
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Add entry */}
                                <div className="bg-[#2a2a2a] rounded-2xl p-5 space-y-3">
                                    <p className="font-semibold">Add Transaction</p>
                                    <div className="flex gap-2">
                                        {(["expense", "income"] as const).map(t => (
                                            <button key={t} onClick={() => { setType(t); setCategory(t === "income" ? INCOME_CATS[0] : EXPENSE_CATS[0]); }}
                                                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${type === t ? t === "expense" ? "bg-red-500 text-white" : "bg-green-500 text-white" : "bg-[#1a1a1a] border border-[#3a3a3a]"}`}>
                                                {t === "expense" ? "➖ Expense" : "➕ Income"}
                                            </button>
                                        ))}
                                    </div>
                                    <select value={category} onChange={e => setCategory(e.target.value)}
                                            className="w-full bg-[#1a1a1a] border border-[#3a3a3a] focus:border-yellow-500 rounded-xl px-4 py-2.5 outline-none transition text-sm">
                                        {(type === "income" ? INCOME_CATS : EXPENSE_CATS).map(c => <option key={c}>{c}</option>)}
                                    </select>
                                    <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Description (optional)"
                                           className="w-full bg-[#1a1a1a] border border-[#3a3a3a] focus:border-yellow-500 rounded-xl px-4 py-2.5 outline-none transition text-sm" />
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 text-sm">€</span>
                                            <input value={amount} onChange={e => setAmount(e.target.value)} onKeyDown={e => e.key === "Enter" && add()}
                                                   type="number" placeholder="Amount"
                                                   className="w-full bg-[#1a1a1a] border border-[#3a3a3a] focus:border-yellow-500 rounded-xl pl-7 pr-3 py-2.5 outline-none transition text-sm" />
                                        </div>
                                        <input value={date} onChange={e => setDate(e.target.value)} type="date"
                                               className="w-full bg-[#1a1a1a] border border-[#3a3a3a] focus:border-yellow-500 rounded-xl px-3 py-2.5 outline-none transition text-sm" />
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-400 hover:text-white transition">
                                        <div onClick={() => setRecurring(!recurring)}
                                             className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${recurring ? "bg-yellow-500" : "bg-[#3a3a3a]"}`}>
                                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${recurring ? "translate-x-5" : "translate-x-0.5"}`} />
                                        </div>
                                        Recurring monthly
                                    </label>
                                    <button onClick={add}
                                            className="w-full bg-yellow-500 text-black py-2.5 rounded-xl font-semibold hover:bg-yellow-400 transition text-sm">
                                        Add {type === "income" ? "Income" : "Expense"}
                                    </button>
                                </div>

                                {/* Category breakdown */}
                                <div className="bg-[#2a2a2a] rounded-2xl p-5">
                                    <p className="font-semibold mb-4">Expense Breakdown</p>
                                    {expByCategory.length === 0 ? (
                                        <p className="text-gray-500 text-sm text-center py-10">No expenses this month</p>
                                    ) : (
                                        <div className="space-y-2.5">
                                            {expByCategory.slice(0, 6).map(([cat, val], i) => (
                                                <div key={cat}>
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="text-gray-300 truncate">{cat}</span>
                                                        <span className="text-gray-400 ml-2 shrink-0">{fmt(val)} · {totalExpenses > 0 ? ((val/totalExpenses)*100).toFixed(0) : 0}%</span>
                                                    </div>
                                                    <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full transition-all duration-500"
                                                             style={{ width: `${(val/totalExpenses)*100}%`, background: CAT_COLORS[i % CAT_COLORS.length] }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Budget progress */}
                            {totalIncome > 0 && (
                                <div className="bg-[#2a2a2a] rounded-2xl p-5">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-400">Monthly budget used</span>
                                        <span className={totalExpenses > totalIncome ? "text-red-400 font-semibold" : "text-gray-300"}>
                    {fmt(totalExpenses)} / {fmt(totalIncome)}
                  </span>
                                    </div>
                                    <div className="h-5 bg-[#1a1a1a] rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2 ${totalExpenses > totalIncome ? "bg-red-500" : totalExpenses/totalIncome > 0.8 ? "bg-orange-500" : "bg-green-500"}`}
                                             style={{ width: `${Math.min(100, (totalExpenses/totalIncome)*100)}%` }}>
                                            {totalExpenses/totalIncome > 0.2 && <span className="text-xs font-bold text-white">{((totalExpenses/totalIncome)*100).toFixed(0)}%</span>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 6-month bar chart */}
                            <div className="bg-[#2a2a2a] rounded-2xl p-5">
                                <p className="font-semibold mb-5">6-Month Overview</p>
                                <div className="flex items-end gap-2 h-36">
                                    {last6Months.map((m, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                            <div className="w-full flex gap-0.5 items-end" style={{ height: "100px" }}>
                                                <div className="flex-1 rounded-t-sm bg-green-500/70 transition-all duration-500"
                                                     style={{ height: `${maxBar > 0 ? (m.income/maxBar)*100 : 0}%`, minHeight: m.income > 0 ? "4px" : "0" }} />
                                                <div className="flex-1 rounded-t-sm bg-red-500/70 transition-all duration-500"
                                                     style={{ height: `${maxBar > 0 ? (m.expense/maxBar)*100 : 0}%`, minHeight: m.expense > 0 ? "4px" : "0" }} />
                                            </div>
                                            <span className={`text-xs ${i === 5 ? "text-yellow-400 font-bold" : "text-gray-500"}`}>{m.label}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-4 mt-3 justify-center">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400"><div className="w-3 h-3 rounded-sm bg-green-500/70" />Income</div>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400"><div className="w-3 h-3 rounded-sm bg-red-500/70" />Expenses</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── TRANSACTIONS ── */}
                    {activeTab === "transactions" && (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
                                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..."
                                           className="w-full bg-[#2a2a2a] border border-[#3a3a3a] focus:border-yellow-500 rounded-xl pl-9 pr-4 py-2.5 outline-none transition text-sm" />
                                </div>
                                <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                                        className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2.5 outline-none text-sm">
                                    <option>All</option>
                                    {[...EXPENSE_CATS, ...INCOME_CATS].map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="bg-[#2a2a2a] rounded-2xl overflow-hidden">
                                {filtered.length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-12">No transactions found</p>
                                ) : (
                                    filtered.map((e, i) => (
                                        <div key={e.id} className={`flex items-center gap-3 px-5 py-3.5 group hover:bg-[#3a3a3a] transition ${i < filtered.length - 1 ? "border-b border-[#3a3a3a]" : ""}`}>
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                                                 style={{ background: e.type === "income" ? "#22C55E20" : "#EF444420" }}>
                                                {e.type === "income" ? "↑" : "↓"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium truncate">{e.label}</p>
                                                    {e.recurring && <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">🔁</span>}
                                                </div>
                                                <p className="text-xs text-gray-500">{e.category} · {new Date(e.date + "T12:00:00").toLocaleDateString("en-IE", { day: "numeric", month: "short" })}</p>
                                            </div>
                                            <span className={`font-semibold text-sm shrink-0 ${e.type === "income" ? "text-green-400" : "text-red-400"}`}>
                      {e.type === "income" ? "+" : "-"}{fmtFull(e.amount)}
                    </span>
                                            <button onClick={() => remove(e.id)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition text-xl leading-none ml-1">×</button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {filtered.length > 0 && (
                                <div className="flex justify-between text-sm text-gray-500 px-1">
                                    <span>{filtered.length} transaction{filtered.length !== 1 ? "s" : ""}</span>
                                    <span>Net: <span className={balance >= 0 ? "text-green-400" : "text-red-400"}>{fmt(
                                        filtered.reduce((s, e) => s + (e.type === "income" ? e.amount : -e.amount), 0)
                                    )}</span></span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── BUDGETS ── */}
                    {activeTab === "budgets" && (
                        <div className="space-y-4">
                            <div className="bg-[#2a2a2a] rounded-2xl p-5 space-y-3">
                                <p className="font-semibold">Set Category Budget</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <select value={budgetCat} onChange={e => setBudgetCat(e.target.value)}
                                            className="bg-[#1a1a1a] border border-[#3a3a3a] focus:border-yellow-500 rounded-xl px-4 py-2.5 outline-none transition text-sm">
                                        {EXPENSE_CATS.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 text-sm">€</span>
                                        <input value={budgetLimit} onChange={e => setBudgetLimit(e.target.value)}
                                               onKeyDown={e => e.key === "Enter" && addBudget()}
                                               type="number" placeholder="Monthly limit"
                                               className="w-full bg-[#1a1a1a] border border-[#3a3a3a] focus:border-yellow-500 rounded-xl pl-7 pr-3 py-2.5 outline-none transition text-sm" />
                                    </div>
                                </div>
                                <button onClick={addBudget}
                                        className="w-full bg-yellow-500 text-black py-2.5 rounded-xl font-semibold hover:bg-yellow-400 transition text-sm">
                                    Set Budget
                                </button>
                            </div>

                            {budgetStatus.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-8">No budgets set yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {budgetStatus.map(b => (
                                        <div key={b.category} className="bg-[#2a2a2a] rounded-2xl p-4 group">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-medium text-sm">{b.category}</span>
                                                <div className="flex items-center gap-3">
                        <span className={`text-sm font-semibold ${b.pct > 100 ? "text-red-400" : b.pct > 80 ? "text-orange-400" : "text-gray-300"}`}>
                          {fmt(b.spent)} / {fmt(b.limit)}
                        </span>
                                                    <button onClick={() => setBudgets(bs => bs.filter(x => x.category !== b.category))}
                                                            className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition text-lg leading-none">×</button>
                                                </div>
                                            </div>
                                            <div className="h-3 bg-[#1a1a1a] rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all duration-500 ${b.pct > 100 ? "bg-red-500" : b.pct > 80 ? "bg-orange-500" : "bg-green-500"}`}
                                                     style={{ width: `${Math.min(100, b.pct)}%` }} />
                                            </div>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-xs text-gray-600">{b.pct.toFixed(0)}% used</span>
                                                {b.pct > 100
                                                    ? <span className="text-xs text-red-400">Over by {fmt(b.spent - b.limit)}</span>
                                                    : <span className="text-xs text-gray-600">{fmt(b.limit - b.spent)} left</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── INSIGHTS ── */}
                    {activeTab === "insights" && (
                        <div className="space-y-4">
                            {insights.map((tip, i) => (
                                <div key={i} className="bg-[#2a2a2a] rounded-2xl p-4 flex items-start gap-3">
                                    <span className="text-2xl shrink-0">{tip.icon}</span>
                                    <p className={`text-sm leading-relaxed ${tip.color}`}>{tip.text}</p>
                                </div>
                            ))}

                            {/* Top spending days */}
                            <div className="bg-[#2a2a2a] rounded-2xl p-5">
                                <p className="font-semibold mb-4">Spending by Category</p>
                                {expByCategory.length === 0 ? <p className="text-gray-500 text-sm">No expenses this month</p> : (
                                    <div className="space-y-3">
                                        {expByCategory.map(([cat, val], i) => (
                                            <div key={cat} className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: CAT_COLORS[i % CAT_COLORS.length] }} />
                                                <span className="text-sm text-gray-300 flex-1 truncate">{cat}</span>
                                                <span className="text-sm font-semibold">{fmt(val)}</span>
                                                <span className="text-xs text-gray-500 w-10 text-right">{totalExpenses > 0 ? ((val/totalExpenses)*100).toFixed(0) : 0}%</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Clear data */}
                            <div className="bg-[#2a2a2a] rounded-2xl p-5">
                                <p className="font-semibold mb-1 text-red-400">Danger Zone</p>
                                <p className="text-gray-500 text-xs mb-4">This will delete all transactions and budgets permanently.</p>
                                <button onClick={() => { if (confirm("Delete all data?")) { setEntries([]); setBudgets([]); }}}
                                        className="px-5 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition text-sm">
                                    Clear All Data
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}