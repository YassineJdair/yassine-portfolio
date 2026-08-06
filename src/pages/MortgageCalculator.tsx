import Navbar from "@/components/Navbar";
import { useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import { calcMortgage, type BuyerType } from "@/lib/mortgageCalculations";

const fmt = (n: number) =>
    new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export default function MortgageCalculator() {
    useSEO(
        "Mortgage Calculator – Yassine Jdair",
        "Irish mortgage affordability calculator — solo or joint income, Central Bank lending limits, and Help to Buy, First Home Scheme & Local Authority Home Loan eligibility.",
        "/mortgage-calculator"
    );

    const [buyerType, setBuyerType] = useState<BuyerType>("first-time");
    const [isFreshStart, setIsFreshStart] = useState(false);
    const [isJoint, setIsJoint] = useState(false);
    const [income1, setIncome1] = useState(50000);
    const [income2, setIncome2] = useState(40000);
    const [propertyPrice, setPropertyPrice] = useState(300000);
    const [deposit, setDeposit] = useState(30000);
    const [isNewBuild, setIsNewBuild] = useState(true);
    const [interestRate, setInterestRate] = useState(4);
    const [termYears, setTermYears] = useState(30);
    const [combineHtbWithFhs, setCombineHtbWithFhs] = useState(false);

    const result = calcMortgage({
        propertyPrice,
        deposit,
        buyerType,
        isJoint,
        income1,
        income2,
        interestRate,
        termYears,
        isNewBuild,
        isFreshStart,
        combineHtbWithFhs,
    });

    const schemeCard = (label: string, eligible: boolean, reasons: string[], detail?: string) => (
        <div className={`rounded-xl p-4 border ${eligible ? "border-green-500/30 bg-green-500/5" : "border-[#3a3a3a] bg-[#1a1a1a]"}`}>
            <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm">{label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${eligible ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-gray-500/10 text-gray-400 border border-gray-500/20"}`}>
                    {eligible ? "Eligible" : "Not eligible"}
                </span>
            </div>
            {eligible && detail && <p className="text-yellow-400 font-bold text-lg">{detail}</p>}
            {!eligible && (
                <ul className="text-gray-500 text-xs space-y-0.5 mt-1">
                    {reasons.map((r, i) => <li key={i}>• {r}</li>)}
                </ul>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white">
            <Navbar />
            <div className="flex flex-col items-center py-12 px-4">
                <h1 className="text-3xl font-bold mb-2">🏠 Mortgage Calculator</h1>
                <p className="text-gray-400 mb-8">Irish mortgage affordability & buyer schemes — 2026</p>

                <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Inputs */}
                    <div className="bg-[#2a2a2a] rounded-2xl p-6 space-y-5">
                        <div>
                            <label className="text-gray-400 text-sm mb-2 block">Buyer type</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(["first-time", "second-time"] as BuyerType[]).map(t => (
                                    <button key={t} onClick={() => setBuyerType(t)}
                                            className={`py-2.5 rounded-xl text-sm font-medium transition ${buyerType === t ? "bg-yellow-500 text-black" : "bg-[#1a1a1a] border border-[#3a3a3a] hover:border-yellow-500"}`}>
                                        {t === "first-time" ? "First-time buyer" : "Second-time / subsequent"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {buyerType === "second-time" && (
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-gray-300 text-sm">Fresh Start applicant</span>
                                <div onClick={() => setIsFreshStart(!isFreshStart)}
                                     className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${isFreshStart ? "bg-yellow-500" : "bg-[#3a3a3a]"}`}>
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isFreshStart ? "translate-x-7" : "translate-x-1"}`} />
                                </div>
                            </label>
                        )}

                        <div>
                            <label className="text-gray-400 text-sm mb-2 block">Application</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[{ v: false, l: "Solo income" }, { v: true, l: "Joint income" }].map(o => (
                                    <button key={o.l} onClick={() => setIsJoint(o.v)}
                                            className={`py-2.5 rounded-xl text-sm font-medium transition ${isJoint === o.v ? "bg-yellow-500 text-black" : "bg-[#1a1a1a] border border-[#3a3a3a] hover:border-yellow-500"}`}>
                                        {o.l}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-gray-400 text-sm mb-2 block">{isJoint ? "Your gross annual income" : "Gross annual income"}</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500 font-bold">€</span>
                                <input type="number" value={income1} onChange={e => setIncome1(Number(e.target.value))}
                                       className="w-full bg-[#1a1a1a] border border-[#3a3a3a] focus:border-yellow-500 rounded-xl pl-9 pr-4 py-3 text-lg font-bold outline-none transition" />
                            </div>
                        </div>

                        {isJoint && (
                            <div>
                                <label className="text-gray-400 text-sm mb-2 block">Partner's gross annual income</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500 font-bold">€</span>
                                    <input type="number" value={income2} onChange={e => setIncome2(Number(e.target.value))}
                                           className="w-full bg-[#1a1a1a] border border-[#3a3a3a] focus:border-yellow-500 rounded-xl pl-9 pr-4 py-3 text-lg font-bold outline-none transition" />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-gray-400 text-sm mb-2 block">Property price</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500 font-bold">€</span>
                                <input type="number" value={propertyPrice} onChange={e => setPropertyPrice(Number(e.target.value))}
                                       className="w-full bg-[#1a1a1a] border border-[#3a3a3a] focus:border-yellow-500 rounded-xl pl-9 pr-4 py-3 text-lg font-bold outline-none transition" />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-gray-400 text-sm">Deposit</label>
                                <span className="text-yellow-500 font-bold">{fmt(deposit)} ({result.depositPercent.toFixed(1)}%)</span>
                            </div>
                            <input type="range" min={0} max={propertyPrice} step={1000} value={deposit}
                                   onChange={e => setDeposit(Number(e.target.value))}
                                   className="w-full accent-yellow-500" />
                        </div>

                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-gray-300 text-sm">New build / self-build</span>
                            <div onClick={() => setIsNewBuild(!isNewBuild)}
                                 className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${isNewBuild ? "bg-yellow-500" : "bg-[#3a3a3a]"}`}>
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isNewBuild ? "translate-x-7" : "translate-x-1"}`} />
                            </div>
                        </label>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-gray-400 text-sm">Interest rate</label>
                                <span className="text-yellow-500 font-bold">{interestRate.toFixed(2)}%</span>
                            </div>
                            <input type="range" min={2} max={6} step={0.05} value={interestRate}
                                   onChange={e => setInterestRate(Number(e.target.value))}
                                   className="w-full accent-yellow-500" />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-gray-400 text-sm">Term</label>
                                <span className="text-yellow-500 font-bold">{termYears} years</span>
                            </div>
                            <input type="range" min={5} max={35} value={termYears}
                                   onChange={e => setTermYears(Number(e.target.value))}
                                   className="w-full accent-yellow-500" />
                        </div>

                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-gray-300 text-sm">Combine First Home Scheme with Help to Buy</span>
                            <div onClick={() => setCombineHtbWithFhs(!combineHtbWithFhs)}
                                 className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${combineHtbWithFhs ? "bg-yellow-500" : "bg-[#3a3a3a]"}`}>
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${combineHtbWithFhs ? "translate-x-7" : "translate-x-1"}`} />
                            </div>
                        </label>
                    </div>

                    {/* Results */}
                    <div className="space-y-4">
                        {/* Affordability highlight */}
                        <div className="bg-[#2a2a2a] rounded-2xl p-6 text-center">
                            <p className="text-gray-400 text-sm mb-1">Monthly Repayment</p>
                            <p className="text-4xl font-bold text-green-400">{fmt(result.monthlyRepayment)}<span className="text-lg text-gray-500">/mo</span></p>
                            <p className={`text-sm mt-2 font-medium ${result.isAffordable ? "text-green-400" : "text-red-400"}`}>
                                {result.isAffordable ? "✓ Within Central Bank lending limits" : "✗ Exceeds Central Bank lending limits"}
                            </p>
                        </div>

                        {/* Lending breakdown */}
                        <div className="bg-[#2a2a2a] rounded-2xl p-6 space-y-3">
                            {[
                                { label: "Loan required", value: result.requiredLoan, color: "text-white" },
                                { label: `Max by income (${result.ltiMultiplier}x)`, value: result.maxLoanByLTI, color: "text-blue-400" },
                                { label: "Max by 90% LTV", value: result.maxLoanByLTV, color: "text-orange-400" },
                                { label: "Total interest over term", value: result.totalInterest, color: "text-red-400" },
                                { label: "Total repaid", value: result.totalRepaid, color: "text-gray-300" },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="flex justify-between items-center py-1 border-b border-[#3a3a3a] last:border-0">
                                    <span className="text-gray-300 text-sm">{label}</span>
                                    <span className={`font-semibold ${color}`}>{fmt(value)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Schemes */}
                        <div className="bg-[#2a2a2a] rounded-2xl p-6 space-y-3">
                            <p className="text-gray-400 text-sm mb-1">Buyer Schemes</p>
                            {schemeCard("Help to Buy", result.helpToBuy.eligible, result.helpToBuy.reasons, `Up to ${fmt(result.helpToBuy.amount)} tax rebate`)}
                            {schemeCard("First Home Scheme", result.firstHomeScheme.eligible, result.firstHomeScheme.reasons, `${fmt(result.firstHomeScheme.minEquity)} – ${fmt(result.firstHomeScheme.maxEquity)} shared equity`)}
                            {schemeCard("Local Authority Home Loan", result.localAuthorityHomeLoan.eligible, result.localAuthorityHomeLoan.reasons, "Fixed rate ~3.35–3.45%")}
                        </div>
                    </div>
                </div>

                <p className="text-gray-600 text-xs mt-6 max-w-4xl text-center">
                    * Estimates based on 2026 Central Bank of Ireland mortgage measures and published scheme rules. Property price ceilings for the First Home Scheme vary by local authority. Always confirm exact figures with a mortgage broker, your lender, or the relevant scheme provider before making decisions.
                </p>
            </div>
        </div>
    );
}
