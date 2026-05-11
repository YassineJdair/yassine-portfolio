import Navbar from "@/components/Navbar";
import { useState } from "react";

interface ReadmeData {
    title: string;
    description: string;
    demo: string;
    tech: string;
    features: string;
    install: string;
    usage: string;
    author: string;
    github: string;
    license: string;
    badges: string[];
}

const BADGE_OPTIONS = [
    { label: "MIT License", value: "license" },
    { label: "TypeScript", value: "typescript" },
    { label: "React", value: "react" },
    { label: "Node.js", value: "nodejs" },
    { label: "Tailwind", value: "tailwind" },
    { label: "PRs Welcome", value: "prs" },
];

const BADGE_URLS: Record<string, string> = {
    license: "![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)",
    typescript: "![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)",
    react: "![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)",
    nodejs: "![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)",
    tailwind: "![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)",
    prs: "![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)",
};

const DEFAULT: ReadmeData = {
    title: "", description: "", demo: "", tech: "", features: "",
    install: "npm install\nnpm run dev", usage: "", author: "", github: "", license: "MIT", badges: [],
};

function generateReadme(d: ReadmeData): string {
    const badges = d.badges.map(b => BADGE_URLS[b]).join(" ");
    const techList = d.tech.split(",").map(t => t.trim()).filter(Boolean).map(t => `- ${t}`).join("\n");
    const featureList = d.features.split("\n").filter(Boolean).map(f => `- ${f.trim()}`).join("\n");

    return `# ${d.title || "Project Name"}

${badges ? badges + "\n" : ""}${d.description || "A short description of your project."}

${d.demo ? `## 🌐 Live Demo\n\n[View Demo](${d.demo})\n` : ""}
## 🚀 Features

${featureList || "- Feature 1\n- Feature 2\n- Feature 3"}

## 🛠️ Built With

${techList || "- Technology 1\n- Technology 2"}

## 📦 Installation

\`\`\`bash
${d.install || "npm install\nnpm run dev"}
\`\`\`

${d.usage ? `## 💡 Usage\n\n${d.usage}\n` : ""}
## 👤 Author

**${d.author || "Your Name"}**

${d.github ? `- GitHub: [@${d.github}](https://github.com/${d.github})\n` : ""}
## 📄 License

This project is [${d.license}](LICENSE) licensed.

---
*Made with ❤️ by ${d.author || "Your Name"}*`;
}

export default function ReadmeGenerator() {
    const [data, setData] = useState<ReadmeData>(DEFAULT);
    const [view, setView] = useState<"edit" | "preview">("edit");
    const [copied, setCopied] = useState(false);

    const set = (key: keyof ReadmeData, val: string) => setData(d => ({ ...d, [key]: val }));
    const toggleBadge = (b: string) => setData(d => ({
        ...d, badges: d.badges.includes(b) ? d.badges.filter(x => x !== b) : [...d.badges, b]
    }));

    const readme = generateReadme(data);

    const copy = () => {
        navigator.clipboard.writeText(readme);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const Field = ({ label, field, placeholder, multiline = false, rows = 2 }: {
        label: string; field: keyof ReadmeData; placeholder: string; multiline?: boolean; rows?: number;
    }) => (
        <div>
            <label className="text-gray-400 text-sm mb-1.5 block">{label}</label>
            {multiline ? (
                <textarea value={data[field] as string} onChange={e => set(field, e.target.value)}
                          placeholder={placeholder} rows={rows}
                          className="w-full bg-[#1a1a1a] border border-[#3a3a3a] focus:border-yellow-500 rounded-xl px-4 py-2.5 outline-none transition resize-none text-sm font-mono" />
            ) : (
                <input value={data[field] as string} onChange={e => set(field, e.target.value)}
                       placeholder={placeholder}
                       className="w-full bg-[#1a1a1a] border border-[#3a3a3a] focus:border-yellow-500 rounded-xl px-4 py-2.5 outline-none transition text-sm" />
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white">
            <Navbar />
            <div className="flex flex-col items-center py-12 px-4">
                <h1 className="text-3xl font-bold mb-2">📝 README Generator</h1>
                <p className="text-gray-400 mb-8">Fill in your project details, get a perfect README</p>

                <div className="w-full max-w-6xl">
                    <div className="flex gap-2 mb-6">
                        {(["edit", "preview"] as const).map(v => (
                            <button key={v} onClick={() => setView(v)}
                                    className={`px-6 py-2.5 rounded-xl capitalize font-medium transition ${view === v ? "bg-yellow-500 text-black" : "bg-[#2a2a2a] text-gray-400 hover:text-white"}`}>
                                {v === "edit" ? "✏️ Edit" : "👁️ Preview"}
                            </button>
                        ))}
                        <button onClick={copy}
                                className="ml-auto px-6 py-2.5 rounded-xl bg-[#2a2a2a] hover:bg-[#3a3a3a] transition text-sm">
                            {copied ? "✓ Copied!" : "📋 Copy Markdown"}
                        </button>
                    </div>

                    {view === "edit" ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-[#2a2a2a] rounded-2xl p-6 space-y-4">
                                <p className="font-semibold text-yellow-400">Project Info</p>
                                <Field label="Project Title *" field="title" placeholder="My Awesome Project" />
                                <Field label="Description *" field="description" placeholder="A brief description of what your project does..." multiline rows={3} />
                                <Field label="Live Demo URL" field="demo" placeholder="https://myproject.netlify.app" />
                                <Field label="GitHub Username" field="github" placeholder="yassinejdair" />
                                <Field label="Author Name" field="author" placeholder="Yassine Jdair" />
                                <div>
                                    <label className="text-gray-400 text-sm mb-2 block">License</label>
                                    <select value={data.license} onChange={e => set("license", e.target.value)}
                                            className="w-full bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl px-4 py-2.5 outline-none focus:border-yellow-500 transition text-sm">
                                        {["MIT", "Apache 2.0", "GPL 3.0", "BSD 3-Clause", "Unlicense"].map(l => <option key={l}>{l}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="bg-[#2a2a2a] rounded-2xl p-6 space-y-4">
                                <p className="font-semibold text-yellow-400">Details</p>
                                <Field label="Technologies (comma separated)" field="tech" placeholder="React, TypeScript, Tailwind CSS, Vite" />
                                <Field label="Features (one per line)" field="features" placeholder={"User authentication\nDark mode\nResponsive design"} multiline rows={4} />
                                <Field label="Installation & Setup" field="install" placeholder={"npm install\nnpm run dev"} multiline rows={3} />
                                <Field label="Usage / How to use" field="usage" placeholder="Describe how to use the project..." multiline rows={3} />
                                <div>
                                    <p className="text-gray-400 text-sm mb-2">Badges</p>
                                    <div className="flex flex-wrap gap-2">
                                        {BADGE_OPTIONS.map(b => (
                                            <button key={b.value} onClick={() => toggleBadge(b.value)}
                                                    className={`text-xs px-3 py-1.5 rounded-lg transition ${data.badges.includes(b.value) ? "bg-yellow-500 text-black font-medium" : "bg-[#1a1a1a] border border-[#3a3a3a] text-gray-400 hover:border-yellow-500"}`}>
                                                {b.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[#2a2a2a] rounded-2xl p-6">
            <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {readme}
            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}