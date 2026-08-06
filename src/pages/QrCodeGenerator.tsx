import Navbar from "@/components/Navbar";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { useSEO } from "@/hooks/useSEO";

const COLORS = [
    { label: "Black on White", dark: "#000000", light: "#ffffff" },
    { label: "White on Black", dark: "#ffffff", light: "#000000" },
    { label: "Black on Yellow", dark: "#000000", light: "#eab308" },
];

export default function QrCodeGenerator() {
    useSEO("QR Code Generator – Yassine Jdair", "Generate a downloadable QR code from any text or URL, instantly and entirely in your browser.", "/qr-code-generator");

    const [text, setText] = useState("https://www.yassinejdair.dev");
    const [size, setSize] = useState(320);
    const [colorIdx, setColorIdx] = useState(0);
    const [transparentBg, setTransparentBg] = useState(false);
    const [error, setError] = useState("");
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        if (!text) {
            setError("");
            const ctx = canvasRef.current.getContext("2d");
            ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            return;
        }

        const { dark, light } = COLORS[colorIdx];
        QRCode.toCanvas(canvasRef.current, text, {
            width: size,
            margin: 2,
            color: { dark, light: transparentBg ? "#00000000" : light },
        })
            .then(() => setError(""))
            .catch(() => setError("Couldn't generate a QR code for that input."));
    }, [text, size, colorIdx, transparentBg]);

    const download = () => {
        if (!canvasRef.current) return;
        const link = document.createElement("a");
        link.download = "qrcode.png";
        link.href = canvasRef.current.toDataURL("image/png");
        link.click();
    };

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white">
            <Navbar />
            <div className="flex flex-col items-center py-12 px-4">
                <h1 className="text-3xl font-bold mb-2">📱 QR Code Generator</h1>
                <p className="text-gray-400 mb-8">Turn any text or URL into a downloadable QR code</p>

                <div className="w-full max-w-md space-y-4">
                    {/* Preview */}
                    <div className="bg-[#2a2a2a] rounded-2xl p-6 flex flex-col items-center gap-4">
                        <div
                            className={`rounded-xl p-3 ${transparentBg ? "" : "bg-white"}`}
                            style={transparentBg ? {
                                backgroundImage:
                                    "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                                backgroundSize: "16px 16px",
                                backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                            } : undefined}
                        >
                            <canvas ref={canvasRef} className="rounded" />
                        </div>
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        <button
                            onClick={download}
                            disabled={!text || !!error}
                            className="w-full bg-yellow-500 text-black py-3 rounded-xl font-bold hover:bg-yellow-400 active:scale-95 disabled:opacity-30 transition"
                        >
                            ⬇ Download PNG
                        </button>
                    </div>

                    {/* Settings */}
                    <div className="bg-[#2a2a2a] rounded-2xl p-5 space-y-5">
                        <div>
                            <label className="text-gray-400 text-sm mb-2 block">Text or URL</label>
                            <textarea
                                value={text}
                                onChange={e => setText(e.target.value)}
                                rows={3}
                                className="w-full bg-[#1a1a1a] border border-[#3a3a3a] focus:border-yellow-500 rounded-xl px-4 py-3 outline-none transition resize-none"
                                placeholder="Enter text or a URL..."
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-gray-400 text-sm">Size</label>
                                <span className="text-yellow-500 font-bold">{size}px</span>
                            </div>
                            <input
                                type="range"
                                min={128}
                                max={512}
                                step={16}
                                value={size}
                                onChange={e => setSize(Number(e.target.value))}
                                className="w-full accent-yellow-500"
                            />
                        </div>

                        <div>
                            <label className="text-gray-400 text-sm mb-2 block">Colours</label>
                            <div className="grid grid-cols-3 gap-2">
                                {COLORS.map((c, i) => (
                                    <button
                                        key={c.label}
                                        onClick={() => setColorIdx(i)}
                                        className={`py-2 rounded-xl text-xs font-medium transition border ${colorIdx === i ? "border-yellow-500 bg-[#1a1a1a]" : "border-[#3a3a3a] bg-[#1a1a1a] hover:border-yellow-500/50"}`}
                                    >
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-gray-300 text-sm">Transparent background</span>
                            <div onClick={() => setTransparentBg(!transparentBg)}
                                 className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${transparentBg ? "bg-yellow-500" : "bg-[#3a3a3a]"}`}>
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${transparentBg ? "translate-x-7" : "translate-x-1"}`} />
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
