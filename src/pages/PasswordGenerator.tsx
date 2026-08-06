import Navbar from "@/components/Navbar";
import { useState, useCallback } from "react";
import { useSEO } from "@/hooks/useSEO";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const NUMS = "0123456789";
const SYMS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

export default function PasswordGenerator() {
    useSEO("Password Generator – Yassine Jdair", "Generate strong, secure passwords with custom length, character sets, and a strength indicator.", "/password-generator");
    const [length, setLength] = useState(16);
    const [upper, setUpper] = useState(true);
    const [lower, setLower] = useState(true);
    const [nums, setNums] = useState(true);
    const [syms, setSyms] = useState(false);
    const [password, setPassword] = useState("");
    const [copied, setCopied] = useState(false);
    const [history, setHistory] = useState<string[]>([]);

    const generate = useCallback(() => {
        let chars = "";
        if (upper) chars += UPPER;
        if (lower) chars += LOWER;
        if (nums) chars += NUMS;
        if (syms) chars += SYMS;
        if (!chars) return;
        const pwd = Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
        setPassword(pwd);
        setCopied(false);
        setHistory(h => [pwd, ...h].slice(0, 5));
    }, [length, upper, lower, nums, syms]);

    const copy = (text = password) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const strength = (() => {
        let s = 0;
        if (length >= 10) s++;
        if (length >= 16) s++;
        if (upper && lower) s++;
        if (nums) s++;
        if (syms) s++;
        if (s <= 2) return { label: "Weak", color: "bg-red-500", w: "25%" };
        if (s === 3) return { label: "Fair", color: "bg-yellow-400", w: "50%" };
        if (s === 4) return { label: "Strong", color: "bg-green-500", w: "75%" };
        return { label: "Very Strong", color: "bg-emerald-400", w: "100%" };
    })();

    const Toggle = ({ label, value, set }: { label: string; value: boolean; set: (v: boolean) => void }) => (
        <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-gray-300 group-hover:text-white transition">{label}</span>
            <div onClick={() => set(!value)}
                 className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${value ? "bg-yellow-500" : "bg-[#3a3a3a]"}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-7" : "translate-x-1"}`} />
            </div>
        </label>
    );

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white">
            <Navbar />
            <div className="flex flex-col items-center py-12 px-4">
                <h1 className="text-3xl font-bold mb-2">🔐 Password Generator</h1>
                <p className="text-gray-400 mb-8">Generate secure, random passwords instantly</p>

                <div className="w-full max-w-md space-y-4">
                    {/* Output */}
                    <div className="bg-[#2a2a2a] rounded-2xl p-5 space-y-4">
                        <div className="bg-[#1a1a1a] rounded-xl px-4 py-3 flex items-center gap-3 min-h-[56px]">
            <span className="font-mono text-base break-all flex-1 text-yellow-100">
              {password || <span className="text-gray-600">Click generate...</span>}
            </span>
                            <button onClick={() => copy()} disabled={!password}
                                    className="shrink-0 px-3 py-1.5 rounded-lg bg-[#3a3a3a] hover:bg-[#4a4a4a] disabled:opacity-30 transition text-sm">
                                {copied ? "✓ Copied" : "Copy"}
                            </button>
                        </div>

                        {/* Strength bar */}
                        {password && (
                            <div>
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-gray-400">Strength</span>
                                    <span className="font-medium">{strength.label}</span>
                                </div>
                                <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-500 ${strength.color}`} style={{ width: strength.w }} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Settings */}
                    <div className="bg-[#2a2a2a] rounded-2xl p-5 space-y-5">
                        <div>
                            <div className="flex justify-between mb-2.5">
                                <span className="text-gray-300">Length</span>
                                <span className="text-yellow-500 font-bold tabular-nums">{length}</span>
                            </div>
                            <input type="range" min={6} max={64} value={length}
                                   onChange={e => setLength(+e.target.value)}
                                   className="w-full h-2 rounded-full accent-yellow-500 cursor-pointer" />
                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                                <span>6</span><span>64</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Toggle label="Uppercase (A-Z)" value={upper} set={setUpper} />
                            <Toggle label="Lowercase (a-z)" value={lower} set={setLower} />
                            <Toggle label="Numbers (0-9)" value={nums} set={setNums} />
                            <Toggle label="Symbols (!@#...)" value={syms} set={setSyms} />
                        </div>

                        <button onClick={generate}
                                className="w-full bg-yellow-500 text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-yellow-400 active:scale-95 transition">
                            ⟳ Generate Password
                        </button>
                    </div>

                    {/* History */}
                    {history.length > 0 && (
                        <div className="bg-[#2a2a2a] rounded-2xl p-5">
                            <p className="text-gray-400 text-sm mb-3">Recent passwords</p>
                            <div className="space-y-2">
                                {history.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between bg-[#1a1a1a] rounded-xl px-3 py-2 gap-2">
                                        <span className="font-mono text-xs text-gray-400 truncate flex-1">{p}</span>
                                        <button onClick={() => copy(p)} className="text-xs text-yellow-500 hover:text-yellow-400 shrink-0">Copy</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}