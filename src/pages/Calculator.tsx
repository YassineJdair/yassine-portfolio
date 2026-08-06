import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import { useSEO } from '@/hooks/useSEO';

type HistoryEntry = { expr: string; result: string };

const BTN = "flex items-center justify-center rounded-xl font-semibold text-lg h-14 transition-all duration-100 active:scale-95 cursor-pointer select-none";

export default function Calculator() {
    useSEO(
        "Calculator – Yassine Jdair",
        "A modern calculator app with scientific functions, history and keyboard support.",
        "/calculator"
    );

    const [display, setDisplay] = useState("0");
    const [expression, setExpression] = useState("");
    const [stored, setStored] = useState<string | null>(null);
    const [op, setOp] = useState<string | null>(null);
    const [fresh, setFresh] = useState(false);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [mem, setMem] = useState(0);
    const [justCalc, setJustCalc] = useState(false);

    const push = useCallback((val: string, expr: string, result: string) => {
        setHistory(h => [{ expr, result }, ...h].slice(0, 20));
    }, []);

    const inputDigit = useCallback((d: string) => {
        setJustCalc(false);
        setDisplay(prev => {
            if (fresh || prev === "0" || justCalc) { setFresh(false); return d; }
            return prev.length < 14 ? prev + d : prev;
        });
    }, [fresh, justCalc]);

    const inputDot = useCallback(() => {
        setFresh(false); setJustCalc(false);
        setDisplay(prev => {
            const p = fresh ? "0" : prev;
            return p.includes(".") ? p : p + ".";
        });
    }, [fresh]);

    const clear = useCallback(() => {
        setDisplay("0"); setExpression(""); setStored(null); setOp(null); setFresh(false); setJustCalc(false);
    }, []);

    const toggleSign = useCallback(() => setDisplay(d => String(-parseFloat(d))), []);
    const percent = useCallback(() => setDisplay(d => String(parseFloat(d) / 100)), []);

    const calculate = useCallback((a: number, b: number, o: string): number => {
        switch (o) {
            case "+": return a + b;
            case "−": return a - b;
            case "×": return a * b;
            case "÷": return b !== 0 ? a / b : NaN;
            case "^": return Math.pow(a, b);
            default: return b;
        }
    }, []);

    const setOperator = useCallback((nextOp: string) => {
        const val = parseFloat(display);
        if (stored !== null && op && !fresh) {
            const result = calculate(parseFloat(stored), val, op);
            const expr = `${stored} ${op} ${display}`;
            const res = isNaN(result) ? "Error" : String(+result.toFixed(10));
            push("", expr, res);
            setDisplay(res);
            setStored(res);
            setExpression(`${res} ${nextOp}`);
        } else {
            setStored(display);
            setExpression(`${display} ${nextOp}`);
        }
        setOp(nextOp);
        setFresh(true);
        setJustCalc(false);
    }, [display, stored, op, fresh, calculate, push]);

    const equals = useCallback(() => {
        if (!op || stored === null) return;
        const a = parseFloat(stored), b = parseFloat(display);
        const result = calculate(a, b, op);
        const expr = `${stored} ${op} ${display} =`;
        const res = isNaN(result) ? "Error" : String(+result.toFixed(10));
        push("", expr, res);
        setDisplay(res);
        setExpression(expr);
        setStored(null); setOp(null); setFresh(true); setJustCalc(true);
    }, [op, stored, display, calculate, push]);

    const scientific = useCallback((fn: string) => {
        const v = parseFloat(display);
        const map: Record<string, number> = {
            "√": Math.sqrt(v), "x²": v * v, "1/x": 1 / v,
            "sin": Math.sin(v * Math.PI / 180), "cos": Math.cos(v * Math.PI / 180),
            "tan": Math.tan(v * Math.PI / 180), "log": Math.log10(v),
            "ln": Math.log(v), "π": Math.PI, "e": Math.E,
        };
        const result = map[fn];
        const res = isNaN(result) ? "Error" : String(+result.toFixed(10));
        push("", `${fn}(${display})`, res);
        setDisplay(res); setJustCalc(true); setFresh(true);
    }, [display, push]);

    // Keyboard
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key >= "0" && e.key <= "9") inputDigit(e.key);
            else if (e.key === ".") inputDot();
            else if (e.key === "+") setOperator("+");
            else if (e.key === "-") setOperator("−");
            else if (e.key === "*") setOperator("×");
            else if (e.key === "/") { e.preventDefault(); setOperator("÷"); }
            else if (e.key === "Enter" || e.key === "=") equals();
            else if (e.key === "Escape") clear();
            else if (e.key === "Backspace") setDisplay(d => d.length > 1 ? d.slice(0, -1) : "0");
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [inputDigit, inputDot, setOperator, equals, clear]);

    const fmt = (d: string) => {
        if (d === "Error" || d.includes(".") || d.includes("e")) return d;
        const n = Number(d);
        if (isNaN(n)) return d;
        return n.toLocaleString("en");
    };

    const BtnRow = ({ children }: { children: React.ReactNode }) => <div className="grid grid-cols-4 gap-2">{children}</div>;
    const Btn = ({ label, onClick, variant = "default", span = 1 }: { label: string; onClick: () => void; variant?: string; span?: number }) => {
        const cls = {
            default: "bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white border border-[#3a3a3a]",
            op: "bg-yellow-500 hover:bg-yellow-400 text-black",
            fn: "bg-[#1a1a1a] hover:bg-[#2a2a2a] text-yellow-400 border border-[#3a3a3a] text-sm",
            action: "bg-[#374151] hover:bg-[#4b5563] text-white border border-[#4b5563]",
            equals: "bg-yellow-500 hover:bg-yellow-400 text-black",
            danger: "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20",
        }[variant] || "";
        return (
            <button onClick={onClick} className={`${BTN} ${cls} ${span === 2 ? "col-span-2" : ""}`}>{label}</button>
        );
    };

    return (
        <Layout>
            <div className="flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-sm space-y-3">
                    <h1 className="text-2xl font-bold text-center mb-4">🧮 Calculator</h1>

                    {/* Display */}
                    <div className="bg-[#111] rounded-2xl p-4 border border-[#2a2a2a]">
                        <div className="text-gray-500 text-sm h-5 text-right truncate">{expression || " "}</div>
                        <div className="text-white text-4xl font-mono text-right truncate mt-1">{fmt(display)}</div>
                        <div className="flex justify-between items-center mt-2">
                            <div className="flex gap-2">
                                <button onClick={() => { setMem(parseFloat(display)); }} className="text-xs text-gray-500 hover:text-yellow-400">M+</button>
                                <button onClick={() => setDisplay(String(mem))} className="text-xs text-gray-500 hover:text-yellow-400">MR</button>
                                <button onClick={() => setMem(0)} className="text-xs text-gray-500 hover:text-yellow-400">MC</button>
                            </div>
                            <button onClick={() => setShowHistory(h => !h)} className="text-xs text-gray-500 hover:text-yellow-400">
                                {showHistory ? "Hide History" : "History"} ({history.length})
                            </button>
                        </div>
                    </div>

                    {/* History */}
                    {showHistory && history.length > 0 && (
                        <div className="bg-[#111] rounded-2xl border border-[#2a2a2a] max-h-36 overflow-y-auto p-3 space-y-1">
                            {history.map((h, i) => (
                                <div key={i} className="flex justify-between text-sm cursor-pointer hover:bg-[#2a2a2a] rounded px-2 py-0.5"
                                     onClick={() => { setDisplay(h.result); setJustCalc(true); setFresh(true); }}>
                                    <span className="text-gray-500 truncate">{h.expr}</span>
                                    <span className="text-white ml-2 shrink-0">{h.result}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Scientific row */}
                    <div className="grid grid-cols-4 gap-2">
                        {["√","x²","sin","cos"].map(f => <Btn key={f} label={f} onClick={() => scientific(f)} variant="fn" />)}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {["tan","log","ln","1/x"].map(f => <Btn key={f} label={f} onClick={() => scientific(f)} variant="fn" />)}
                    </div>

                    {/* Main buttons */}
                    <div className="grid grid-cols-4 gap-2">
                        <Btn label="AC" onClick={clear} variant="danger" />
                        <Btn label="+/−" onClick={toggleSign} variant="action" />
                        <Btn label="%" onClick={percent} variant="action" />
                        <Btn label="÷" onClick={() => setOperator("÷")} variant="op" />
                    </div>
                    <BtnRow>
                        {["7","8","9"].map(d => <Btn key={d} label={d} onClick={() => inputDigit(d)} />)}
                        <Btn label="×" onClick={() => setOperator("×")} variant="op" />
                    </BtnRow>
                    <BtnRow>
                        {["4","5","6"].map(d => <Btn key={d} label={d} onClick={() => inputDigit(d)} />)}
                        <Btn label="−" onClick={() => setOperator("−")} variant="op" />
                    </BtnRow>
                    <BtnRow>
                        {["1","2","3"].map(d => <Btn key={d} label={d} onClick={() => inputDigit(d)} />)}
                        <Btn label="+" onClick={() => setOperator("+")} variant="op" />
                    </BtnRow>
                    <BtnRow>
                        <Btn label="^" onClick={() => setOperator("^")} variant="action" />
                        <Btn label="0" onClick={() => inputDigit("0")} />
                        <Btn label="." onClick={inputDot} />
                        <Btn label="=" onClick={equals} variant="equals" />
                    </BtnRow>
                </div>
            </div>
        </Layout>
    );
}