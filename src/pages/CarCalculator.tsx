import Navbar from "@/components/Navbar";
import { useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import { CO2_BANDS, ENGINE_BANDS, getTaxBand, computeFuelCost } from "@/lib/carCalculations";

const fmt = (n: number) => `€${n.toLocaleString()}`;

export default function CarCalculator() {
    useSEO("Car Calculator – Yassine Jdair", "Irish motor tax calculator by CO2 or engine size, plus fuel cost estimator for any trip.", "/car-calculator");
    const [activeTab, setActiveTab] = useState<"tax" | "fuel">("tax");

    // Tax state
    const [method, setMethod] = useState<"co2" | "engine">("co2");
    const [co2, setCo2] = useState(120);
    const [engineBandIdx, setEngineBandIdx] = useState(5);
    const [isElectric, setIsElectric] = useState(false);

    // Fuel state
    const [distance, setDistance] = useState(100);
    const [distUnit, setDistUnit] = useState<"km" | "miles">("km");
    const [consumption, setConsumption] = useState(6);
    const [consUnit, setConsUnit] = useState<"L/100km" | "mpg">("L/100km");
    const [fuelPrice, setFuelPrice] = useState(1.75);
    const [fuelType, setFuelType] = useState<"petrol" | "diesel">("petrol");

    // Tax calc
    const taxBand = getTaxBand(co2, isElectric);
    const engineBand = ENGINE_BANDS[engineBandIdx];

    // Fuel calc
    const { litresUsed, fuelCost, costPer100km } = computeFuelCost(distance, distUnit, consumption, consUnit, fuelPrice);

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white">
            <Navbar />
            <div className="flex flex-col items-center py-12 px-4">
                <h1 className="text-3xl font-bold mb-2">🚗 Car Calculator</h1>
                <p className="text-gray-400 mb-8">Irish motor tax & fuel cost estimator</p>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 bg-[#2a2a2a] p-1.5 rounded-2xl w-full max-w-xs sm:max-w-none sm:w-auto">
                    <button onClick={() => setActiveTab("tax")}
                            className={`flex-1 sm:flex-none px-6 sm:px-8 py-2.5 rounded-xl font-semibold transition text-sm sm:text-base ${activeTab === "tax" ? "bg-yellow-500 text-black" : "text-gray-400 hover:text-white"}`}>
                        🏷️ Motor Tax
                    </button>
                    <button onClick={() => setActiveTab("fuel")}
                            className={`flex-1 sm:flex-none px-6 sm:px-8 py-2.5 rounded-xl font-semibold transition text-sm sm:text-base ${activeTab === "fuel" ? "bg-yellow-500 text-black" : "text-gray-400 hover:text-white"}`}>
                        ⛽ Fuel Cost
                    </button>
                </div>

                <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {activeTab === "tax" ? (
                        <>
                            {/* Tax inputs */}
                            <div className="bg-[#2a2a2a] rounded-2xl p-6 space-y-5">
                                <div>
                                    <p className="text-gray-400 text-sm mb-3">Registration date</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(["co2", "engine"] as const).map(m => (
                                            <button key={m} onClick={() => setMethod(m)}
                                                    className={`py-2.5 rounded-xl text-sm font-medium transition ${method === m ? "bg-yellow-500 text-black" : "bg-[#1a1a1a] border border-[#3a3a3a]"}`}>
                                                {m === "co2" ? "2008+ (CO₂)" : "Pre-2008 (cc)"}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {method === "co2" ? (
                                    <>
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <span className="text-gray-300">Electric Vehicle</span>
                                            <div onClick={() => setIsElectric(!isElectric)}
                                                 className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${isElectric ? "bg-yellow-500" : "bg-[#3a3a3a]"}`}>
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isElectric ? "translate-x-7" : "translate-x-1"}`} />
                                            </div>
                                        </label>
                                        {!isElectric && (
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-gray-400 text-sm">CO₂ Emissions</span>
                                                    <span className="text-yellow-500 font-bold">{co2} g/km</span>
                                                </div>
                                                <input type="range" min={1} max={300} value={co2}
                                                       onChange={e => setCo2(Number(e.target.value))}
                                                       className="w-full accent-yellow-500" />
                                                <div className="flex justify-between text-xs text-gray-600 mt-1"><span>1</span><span>300</span></div>
                                            </div>
                                        )}
                                        <div className="bg-[#1a1a1a] rounded-xl p-3">
                                            <p className="text-xs text-gray-500 mb-1">Band</p>
                                            <p className="font-medium text-yellow-400">{taxBand.label}</p>
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <p className="text-gray-400 text-sm mb-2">Engine Size</p>
                                        <select value={engineBandIdx} onChange={e => setEngineBandIdx(Number(e.target.value))}
                                                className="w-full bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl px-4 py-2.5 outline-none focus:border-yellow-500 transition">
                                            {ENGINE_BANDS.map((b, i) => <option key={i} value={i}>{b.label}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Tax results */}
                            <div className="bg-[#2a2a2a] rounded-2xl p-6 space-y-4">
                                <p className="font-semibold text-lg">Motor Tax Cost</p>
                                {(method === "co2" ? [
                                    { period: "Annual", amount: taxBand.annual },
                                    { period: "6 Months", amount: taxBand.biannual },
                                    { period: "3 Months", amount: taxBand.quarterly },
                                ] : [
                                    { period: "Annual", amount: engineBand.annual },
                                    { period: "6 Months", amount: Math.round(engineBand.annual * 0.55) },
                                    { period: "3 Months", amount: Math.round(engineBand.annual * 0.28) },
                                ]).map(({ period, amount }) => (
                                    <div key={period} className="bg-[#1a1a1a] rounded-xl p-4 flex justify-between items-center">
                                        <span className="text-gray-300">{period}</span>
                                        <span className="text-2xl font-bold text-yellow-400">{fmt(amount)}</span>
                                    </div>
                                ))}
                                <p className="text-gray-600 text-xs">* Based on 2025 Irish motor tax rates</p>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Fuel inputs */}
                            <div className="bg-[#2a2a2a] rounded-2xl p-6 space-y-5">
                                <div>
                                    <p className="text-gray-400 text-sm mb-2">Fuel Type</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(["petrol", "diesel"] as const).map(f => (
                                            <button key={f} onClick={() => setFuelType(f)}
                                                    className={`py-2.5 rounded-xl capitalize text-sm font-medium transition ${fuelType === f ? "bg-yellow-500 text-black" : "bg-[#1a1a1a] border border-[#3a3a3a]"}`}>
                                                {f === "petrol" ? "⛽ Petrol" : "🛢️ Diesel"}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-gray-400 text-sm">Distance</span>
                                        <div className="flex gap-1">
                                            {(["km", "miles"] as const).map(u => (
                                                <button key={u} onClick={() => setDistUnit(u)}
                                                        className={`text-xs px-2 py-0.5 rounded ${distUnit === u ? "bg-yellow-500 text-black" : "bg-[#3a3a3a] text-gray-400"}`}>{u}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <input type="number" value={distance} onChange={e => setDistance(Number(e.target.value))}
                                           className="w-full bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl px-4 py-2.5 outline-none focus:border-yellow-500 transition" />
                                </div>

                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-gray-400 text-sm">Fuel Consumption</span>
                                        <div className="flex gap-1">
                                            {(["L/100km", "mpg"] as const).map(u => (
                                                <button key={u} onClick={() => setConsUnit(u)}
                                                        className={`text-xs px-2 py-0.5 rounded ${consUnit === u ? "bg-yellow-500 text-black" : "bg-[#3a3a3a] text-gray-400"}`}>{u}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <input type="number" value={consumption} onChange={e => setConsumption(Number(e.target.value))}
                                           className="w-full bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl px-4 py-2.5 outline-none focus:border-yellow-500 transition" />
                                </div>

                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Fuel Price (€/litre)</p>
                                    <input type="number" step="0.01" value={fuelPrice} onChange={e => setFuelPrice(Number(e.target.value))}
                                           className="w-full bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl px-4 py-2.5 outline-none focus:border-yellow-500 transition" />
                                </div>
                            </div>

                            {/* Fuel results */}
                            <div className="bg-[#2a2a2a] rounded-2xl p-6 space-y-4">
                                <p className="font-semibold text-lg">Fuel Cost Estimate</p>
                                {[
                                    { label: "This trip", value: `€${fuelCost.toFixed(2)}`, sub: `${litresUsed.toFixed(1)}L used` },
                                    { label: "Per 100km", value: `€${costPer100km.toFixed(2)}`, sub: "running cost" },
                                    { label: "Per month (1,500km)", value: `€${(costPer100km * 15).toFixed(0)}`, sub: "estimate" },
                                    { label: "Per year (18,000km)", value: `€${(costPer100km * 180).toFixed(0)}`, sub: "estimate" },
                                ].map(({ label, value, sub }) => (
                                    <div key={label} className="bg-[#1a1a1a] rounded-xl p-4 flex justify-between items-center">
                                        <div>
                                            <p className="text-gray-300 text-sm">{label}</p>
                                            <p className="text-xs text-gray-600">{sub}</p>
                                        </div>
                                        <span className="text-2xl font-bold text-yellow-400">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}