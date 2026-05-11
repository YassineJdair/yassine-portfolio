import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/providers/ThemeProvider";

const ventures = [
    {
        name: "Maison D'Oud",
        description: "Premium bold oud fragrances",
        url: "https://www.maisondoud.com",
        emoji: "🪔",
    },
    {
        name: "AutoLab",
        description: "Automotive customisation",
        url: "https://www.autolab.ie",
        emoji: "🚗",
    },
];

const Navbar = () => {
    const [venturesOpen, setVenturesOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setVenturesOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <nav className="bg-background border-b border-border/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-xl font-bold text-foreground">
                            Yassine Jdair
                        </Link>
                    </div>

                    <div className="flex items-center space-x-8">
                        <Link to="/projects" className="text-foreground hover:text-primary transition-colors">
                            Projects
                        </Link>
                        <Link to="/experience" className="text-foreground hover:text-primary transition-colors">
                            Experience
                        </Link>
                        <Link to="/games" className="text-foreground hover:text-primary transition-colors">
                            Games
                        </Link>
                        <Link to="/about" className="text-foreground hover:text-primary transition-colors">
                            About Me
                        </Link>

                        {/* My Ventures dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setVenturesOpen(v => !v)}
                                className="flex items-center gap-1 text-foreground hover:text-primary transition-colors"
                            >
                                My Ventures
                                <svg
                                    className={`w-3.5 h-3.5 mt-0.5 transition-transform duration-200 ${venturesOpen ? "rotate-180" : ""}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {venturesOpen && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-background border border-border/50 rounded-xl shadow-xl overflow-hidden z-50">
                                    {ventures.map((v) => (
                                        <a
                                            key={v.name}
                                            href={v.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={() => setVenturesOpen(false)}
                                            className="flex items-start gap-3 px-4 py-3 hover:bg-accent/30 transition-colors group"
                                        >
                                            <span className="text-xl mt-0.5">{v.emoji}</span>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {v.name}
                          </span>
                                                    <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{v.description}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>

                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;