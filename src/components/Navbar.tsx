import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/providers/ThemeProvider";
import { Menu, X } from "lucide-react";

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
    {
        name: "HydroSolutions",
        description: "Mobile detailing & window cleaning",
        url: "https://www.hydrosolutions.ie",
        emoji: "💧",
    },
];

const NAV_LINKS = [
    { to: "/projects", label: "Projects" },
    { to: "/experience", label: "Experience" },
    { to: "/games", label: "Games" },
    { to: "/about", label: "About Me" },
];

const Navbar = () => {
    const [venturesOpen, setVenturesOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileVenturesOpen, setMobileVenturesOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    // Close mobile menu on route change
    useEffect(() => { setMenuOpen(false); setMobileVenturesOpen(false); }, [location.pathname]);

    // Close ventures dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setVenturesOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [menuOpen]);

    return (
        <>
            <nav className="bg-background border-b border-border/40 relative z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link to="/" className="text-xl font-bold text-foreground">
                                Yassine Jdair
                            </Link>
                        </div>

                        {/* Desktop nav */}
                        <div className="hidden md:flex items-center space-x-8">
                            {NAV_LINKS.map(l => (
                                <Link key={l.to} to={l.to} className="text-foreground hover:text-primary transition-colors">
                                    {l.label}
                                </Link>
                            ))}

                            {/* My Ventures dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setVenturesOpen(v => !v)}
                                    className="flex items-center gap-1 text-foreground hover:text-primary transition-colors"
                                >
                                    My Ventures
                                    <svg className={`w-3.5 h-3.5 mt-0.5 transition-transform duration-200 ${venturesOpen ? "rotate-180" : ""}`}
                                         fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {venturesOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-background border border-border/50 rounded-xl shadow-xl overflow-hidden z-50">
                                        {ventures.map((v) => (
                                            <a key={v.name} href={v.url} target="_blank" rel="noreferrer"
                                               onClick={() => setVenturesOpen(false)}
                                               className="flex items-start gap-3 px-4 py-3 hover:bg-accent/30 transition-colors group">
                                                <span className="text-xl mt-0.5">{v.emoji}</span>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{v.name}</span>
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

                        {/* Mobile right side: theme toggle + hamburger */}
                        <div className="flex md:hidden items-center gap-2">
                            <ThemeToggle />
                            <button
                                onClick={() => setMenuOpen(o => !o)}
                                className="p-2 rounded-lg text-foreground hover:text-primary hover:bg-accent/20 transition-colors"
                                aria-label="Toggle menu"
                            >
                                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile menu overlay */}
            {menuOpen && (
                <div className="fixed inset-0 z-30 md:hidden" onClick={() => setMenuOpen(false)}>
                    <div className="absolute inset-0 bg-black/40" />
                </div>
            )}

            {/* Mobile menu drawer */}
            <div className={`fixed top-16 left-0 right-0 z-30 md:hidden bg-background border-b border-border/40 shadow-lg transition-all duration-200 ease-in-out ${menuOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0 pointer-events-none"}`}>
                <div className="px-4 py-3 space-y-1">
                    {NAV_LINKS.map(l => (
                        <Link key={l.to} to={l.to}
                              onClick={() => setMenuOpen(false)}
                              className="block px-3 py-3 rounded-lg text-foreground hover:text-primary hover:bg-accent/20 transition-colors font-medium">
                            {l.label}
                        </Link>
                    ))}

                    {/* My Ventures accordion */}
                    <div>
                        <button onClick={() => setMobileVenturesOpen(o => !o)}
                                className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-foreground hover:text-primary hover:bg-accent/20 transition-colors font-medium">
                            My Ventures
                            <svg className={`w-4 h-4 transition-transform duration-200 ${mobileVenturesOpen ? "rotate-180" : ""}`}
                                 fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {mobileVenturesOpen && (
                            <div className="ml-3 mt-1 space-y-1 border-l-2 border-border/40 pl-3">
                                {ventures.map(v => (
                                    <a key={v.name} href={v.url} target="_blank" rel="noreferrer"
                                       onClick={() => setMenuOpen(false)}
                                       className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/20 transition-colors group">
                                        <span className="text-lg">{v.emoji}</span>
                                        <div>
                                            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{v.name}</p>
                                            <p className="text-xs text-muted-foreground">{v.description}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;