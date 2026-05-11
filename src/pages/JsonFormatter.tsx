import Navbar from "@/components/Navbar";
import { useState } from "react";

export default function JsonFormatter() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [indent, setIndent] = useState(2);

    const parse = () => {
        try { return JSON.parse(input); }
        catch (e: any) { setError(e.message); setOutput(""); return null; }
    };

    const format = () => {
        const p = parse(); if (!p) return;
        setOutput(JSON.stringify(p, null, indent));
        setError("");
    };

    const minify = () => {
        const p = parse(); if (!p) return;
        setOutput(JSON.stringify(p));
        setError("");
    };

    const validate = () => {
        const p = parse();
        if (p !== null) { setError(""); setOutput("✅ Valid JSON!"); }
    };

    const clear = () => { setInput(""); setOutput(""); setError(""); };

    const copy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const sample = () => {
        setInput(JSON.stringify({
            name: "Yassine Jdair",
            role: "Software Engineer",
            skills: ["JavaScript", "TypeScript", "React", "Node.js"],
            contact: { email: "yassinejdair@gmail.com", phone: "+353 85 124 4472" },
            available: true
        }, null, 2));
        setOutput(""); setError("");
    };

    // Simple syntax highlight
    const highlight = (json: string) => {
        if (json === "✅ Valid JSON!") return <span className="text-green-400 text-lg">{json}</span>;
        return json.split("\n").map((line, i) => (
            <div key={i}>
                {line.split(/(".*?"|\b\d+\.?\d*\b|true|false|null)/).map((part, j) => {
                    if (/^".*"$/.test(part)) {
                        const isKey = line.indexOf(part) < line.indexOf(":");
                        return <span key={j} className={isKey ? "text-blue-300" : "text-green-300"}>{part}</span>;
                    }
                    if (/^\d/.test(part)) return <span key={j} className="text-yellow-300">{part}</span>;
                    if (part === "true" || part === "false") return <span key={j} className="text-orange-400">{part}</span>;
                    if (part === "null") return <span key={j} className="text-red-400">{part}</span>;
                    return <span key={j} className="text-gray-300">{part}</span>;
                })}
            </div>
        ));
    };

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white">
            <Navbar />
            <div className="flex flex-col items-center py-12 px-4">
                <h1 className="text-3xl font-bold mb-2">🔧 JSON Formatter</h1>
                <p className="text-gray-400 mb-6">Format, validate and minify JSON instantly</p>

                {/* Controls */}
                <div className="flex flex-wrap gap-2 mb-6 justify-center">
                    <button onClick={format} className="bg-yellow-500 text-black px-5 py-2 rounded-xl font-semibold hover:bg-yellow-400 transition text-sm">Format</button>
                    <button onClick={minify} className="bg-[#2a2a2a] border border-[#3a3a3a] px-5 py-2 rounded-xl hover:bg-[#3a3a3a] transition text-sm">Minify</button>
                    <button onClick={validate} className="bg-[#2a2a2a] border border-[#3a3a3a] px-5 py-2 rounded-xl hover:bg-[#3a3a3a] transition text-sm">Validate</button>
                    <button onClick={sample} className="bg-[#2a2a2a] border border-[#3a3a3a] px-5 py-2 rounded-xl hover:bg-[#3a3a3a] transition text-sm">Sample</button>
                    <button onClick={clear} className="bg-[#2a2a2a] border border-[#3a3a3a] px-5 py-2 rounded-xl hover:bg-[#3a3a3a] transition text-sm text-gray-400">Clear</button>
                    <select value={indent} onChange={e => setIndent(+e.target.value)}
                            className="bg-[#2a2a2a] border border-[#3a3a3a] px-3 py-2 rounded-xl text-sm outline-none cursor-pointer">
                        <option value={2}>2 spaces</option>
                        <option value={4}>4 spaces</option>
                        <option value={1}>1 space</option>
                    </select>
                </div>

                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Input */}
                    <div className="bg-[#2a2a2a] rounded-2xl p-4 flex flex-col">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-gray-400 text-sm font-medium">Input</span>
                            <span className="text-xs text-gray-600">{input.length} chars</span>
                        </div>
                        <textarea
                            value={input}
                            onChange={e => { setInput(e.target.value); setError(""); }}
                            placeholder='Paste your JSON here...'
                            spellCheck={false}
                            className="flex-1 min-h-[400px] bg-[#111] text-gray-200 font-mono text-sm p-4 rounded-xl outline-none resize-none border border-[#3a3a3a] focus:border-yellow-500 transition"
                        />
                    </div>

                    {/* Output */}
                    <div className="bg-[#2a2a2a] rounded-2xl p-4 flex flex-col">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-gray-400 text-sm font-medium">Output</span>
                            <button onClick={copy} disabled={!output || !!error}
                                    className="text-xs px-3 py-1 rounded-lg bg-[#3a3a3a] hover:bg-[#4a4a4a] disabled:opacity-30 transition">
                                {copied ? "✓ Copied!" : "Copy"}
                            </button>
                        </div>

                        {error ? (
                            <div className="flex-1 min-h-[400px] bg-[#111] rounded-xl border border-red-500/30 p-4">
                                <p className="text-red-400 text-xs font-semibold mb-2">❌ Invalid JSON</p>
                                <p className="text-red-300 font-mono text-sm">{error}</p>
                            </div>
                        ) : (
                            <div className="flex-1 min-h-[400px] bg-[#111] rounded-xl border border-[#3a3a3a] p-4 overflow-auto font-mono text-sm leading-6">
                                {output
                                    ? highlight(output)
                                    : <span className="text-gray-600">Formatted output will appear here...</span>
                                }
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}