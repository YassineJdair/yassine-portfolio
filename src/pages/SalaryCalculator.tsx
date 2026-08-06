import Navbar from "@/components/Navbar";
import { useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import { calcTax, type Status } from "@/lib/salaryTax";

const fmt = (n: number) =>
    new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export default function SalaryCalculator() {
    useSEO("Salary Calculator – Yassine Jdair", "Irish PAYE, USC & PRSI calculator. See your exact take-home pay with pension deductions and tax breakdown.", "/salary-calculator");
    const [gross, setGross] = useState(50000);
    const [status, setStatus] = useState<Status>("single");
    const [pension, setPension] = useState(5);
    const [period, setPeriod] = useState<"annual" | "monthly" | "weekly">("annual");

    const result = calcTax(gross, status, pension);

    const divide = (n: number) => period === "annual" ? n : period === "monthly" ? n / 12 : n / 52;
    const label = period === "annual" ? "/yr" : period === "monthly" ? "/mo" : "/wk";

    const bars = [
        { label: "Net Pay", value: result.net, color: "bg-green-500" },
        { label: "Income Tax", value: result.incomeTax, color: "bg-red-500" },
        { label: "USC", value: result.usc, color: "bg-orange-500" },
        { label: "PRSI", value: result.prsi, color: "bg-yellow-500" },
        { label: "Pension", value: result.gross * (pension / 100), color: "bg-blue-500" },
    ];

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white">
            <Navbar />
            <div className="flex flex-col items-center py-12 px-4">
                <h1 className="text-3xl font-bold mb-2">💰 Salary Calculator</h1>
                <p className="text-gray-400 mb-8">Irish PAYE, USC & PRSI — 2025 tax year</p>

                <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Inputs */}
                    <div className="bg-[#2a2a2a] rounded-2xl p-6 space-y-6">
                        <div>
                            <label className="text-gray-400 text-sm mb-2 block">Gross Annual Salary</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500 font-bold">€</span>
                                <input
                                    type="number"
                                    value={gross}
                                    onChange={e => setGross(Number(e.target.value))}
                                    className="w-full bg-[#1a1a1a] border border-[#3a3a3a] focus:border-yellow-500 rounded-xl pl-9 pr-4 py-3 text-lg font-bold outline-none transition"
                                />
                            </div>
                            <input type="range" min={15000} max={200000} step={1000} value={gross}
                                   onChange={e => setGross(Number(e.target.value))}
                                   className="w-full mt-3 accent-yellow-500" />
                            <div className="flex justify-between text-xs text-gray-600 mt-1"><span>€15k</span><span>€200k</span></div>
                        </div>

                        <div>
                            <label className="text-gray-400 text-sm mb-2 block">Marital Status</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(["single", "married"] as Status[]).map(s => (
                                    <button key={s} onClick={() => setStatus(s)}
                                            className={`py-2.5 rounded-xl capitalize font-medium transition ${status === s ? "bg-yellow-500 text-black" : "bg-[#1a1a1a] border border-[#3a3a3a] hover:border-yellow-500"}`}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-gray-400 text-sm">Pension Contribution</label>
                                <span className="text-yellow-500 font-bold">{pension}%</span>
                            </div>
                            <input type="range" min={0} max={25} value={pension}
                                   onChange={e => setPension(Number(e.target.value))}
                                   className="w-full accent-yellow-500" />
                            <div className="flex justify-between text-xs text-gray-600 mt-1"><span>0%</span><span>25%</span></div>
                        </div>

                        <div>
                            <label className="text-gray-400 text-sm mb-2 block">View by</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(["annual", "monthly", "weekly"] as const).map(p => (
                                    <button key={p} onClick={() => setPeriod(p)}
                                            className={`py-2 rounded-xl capitalize text-sm font-medium transition ${period === p ? "bg-yellow-500 text-black" : "bg-[#1a1a1a] border border-[#3a3a3a] hover:border-yellow-500"}`}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="space-y-4">
                        {/* Take home highlight */}
                        <div className="bg-[#2a2a2a] rounded-2xl p-6 text-center">
                            <p className="text-gray-400 text-sm mb-1">Take Home Pay</p>
                            <p className="text-4xl font-bold text-green-400">{fmt(divide(result.net))}<span className="text-lg text-gray-500">{label}</span></p>
                            <p className="text-gray-500 text-sm mt-1">Effective tax rate: {result.effectiveRate.toFixed(1)}%</p>
                        </div>

                        {/* Breakdown */}
                        <div className="bg-[#2a2a2a] rounded-2xl p-6 space-y-3">
                            {[
                                { label: "Gross Salary", value: result.gross, color: "text-white" },
                                { label: "Income Tax (PAYE)", value: -result.incomeTax, color: "text-red-400" },
                                { label: "USC", value: -result.usc, color: "text-orange-400" },
                                { label: "PRSI", value: -result.prsi, color: "text-yellow-400" },
                                { label: `Pension (${pension}%)`, value: -(result.gross * pension / 100), color: "text-blue-400" },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="flex justify-between items-center py-1 border-b border-[#3a3a3a] last:border-0">
                                    <span className="text-gray-300 text-sm">{label}</span>
                                    <span className={`font-semibold ${color}`}>{value < 0 ? "-" : ""}{fmt(Math.abs(divide(value)))}</span>
                                </div>
                            ))}
                            <div className="flex justify-between items-center pt-2">
                                <span className="font-bold">Net Pay</span>
                                <span className="font-bold text-green-400 text-lg">{fmt(divide(result.net))}</span>
                            </div>
                        </div>

                        {/* Visual bar */}
                        <div className="bg-[#2a2a2a] rounded-2xl p-6">
                            <p className="text-gray-400 text-sm mb-3">Breakdown</p>
                            <div className="flex h-6 rounded-full overflow-hidden mb-3">
                                {bars.filter(b => b.value > 0).map(b => (
                                    <div key={b.label} className={b.color} style={{ width: `${(b.value / result.gross) * 100}%` }} />
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {bars.filter(b => b.value > 0).map(b => (
                                    <div key={b.label} className="flex items-center gap-2 text-xs">
                                        <div className={`w-2.5 h-2.5 rounded-full ${b.color} shrink-0`} />
                                        <span className="text-gray-400">{b.label} ({((b.value / result.gross) * 100).toFixed(1)}%)</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <p className="text-gray-600 text-xs mt-6">* Estimates based on 2025 tax rates. Always consult a tax professional for accurate advice.</p>
            </div>
        </div>
    );
}