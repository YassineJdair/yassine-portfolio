import { useEffect, useRef, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";

// ─── Word list (500 curated 5-letter words) ───────────────────────────────────
const WORDS = [
    "crane","slate","stare","arose","least","train","resin","stone","shine","piano",
    "brave","crisp","dwarf","elope","fraud","grout","hasty","inbox","joust","knack",
    "lance","mirth","nymph","ounce","perch","quilt","raven","scone","tapir","ulcer",
    "venom","waltz","xenon","yacht","zippy","abbey","abode","adorn","afoul","agile",
    "alarm","album","algae","alibi","align","aloft","aloof","altar","amble","amend",
    "amuse","angel","angst","annex","antic","anvil","aphid","apple","aptly","arena",
    "argon","aroma","array","asset","atone","attic","audit","augur","avail","avoid",
    "awake","award","aweigh","axiom","azure","babel","badge","baize","barge","baron",
    "basin","batch","beach","beard","beset","bevel","bison","blade","blare","blast",
    "blaze","bleak","bleed","blend","blimp","blink","bliss","bloat","block","blood",
    "bloom","blown","blues","blunt","blurb","blurt","boast","boded","boggy","bolts",
    "booze","borax","bough","brace","brash","brawl","breed","breve","bribe","bride",
    "brill","briny","brisk","broil","brook","broth","brown","bruit","brunt","brush",
    "brute","budge","bugle","bulge","bulky","bully","bumpy","bunny","buoyed","burly",
    "cabin","cadet","camel","canal","candy","cargo","carol","caste","cavil","cedar",
    "chafe","chain","chair","chalk","champ","chaos","chard","charm","chasm","cheek",
    "chess","chide","chill","chimp","chips","chord","cinch","civic","civil","claim",
    "clamp","clasp","class","clave","cleat","cleft","clerk","click","cliff","climb",
    "cling","cloak","clone","close","clout","clove","clown","clump","clung","coast",
    "cobra","comet","comic","comma","copal","coral","corps","couch","cough","could",
    "count","covet","coward","creak","creed","creek","creep","crept","crest","crime",
    "croak","croon","cross","crowd","crown","crumb","crush","crust","crypt","cubic",
    "cumbersome","curly","curry","cycle","cynic","daily","dairy","daunt","debut",
    "decal","decoy","decry","defer","delve","depot","depth","derby","detox","devil",
    "dingo","disco","divan","dodgy","dogma","dolly","donor","dowdy","dowel","downy",
    "draft","drape","drawl","dread","dream","dredge","drink","drive","drool","droop",
    "drove","drown","druid","dryer","duchy","dumps","dunes","dunce","dusky","dusty",
    "eager","early","easel","eight","ember","emote","empower","endow","enjoy","epoch",
    "erode","evoke","exact","exert","exile","exist","expel","extra","exult","fable",
    "facet","faint","fairy","faith","faker","fancy","fatal","fauna","feast","feint",
    "ferry","fetch","fever","fiery","filth","finch","first","fjord","fizzy","flail",
    "flake","flame","flank","flare","flask","flaunt","fleck","fleet","flesh","flint",
    "flirt","float","flock","floor","floss","flour","flout","fluid","flunk","flute",
    "foamy","folio","force","forge","forth","forum","frail","frame","freed","fresh",
    "frisk","fritz","front","frost","froth","froze","frown","fruit","frump","funky",
    "funny","futon","gavel","gauze","gecko","genre","girth","gizmo","glaze","gleam",
    "glean","glide","gloss","glove","glyph","gnarl","gnome","golem","goose","graft",
    "grail","grain","grasp","grate","grave","gravy","graze","great","greed","greet",
    "grime","grind","gripe","groan","groin","groom","grope","gross","grove","growl",
    "gruel","gruff","guile","guise","gulch","gulls","gusto","gypsy","haiku","haunt",
    "haven","hedge","hefty","heist","helix","heron","hijab","hinge","hippo","hoard",
    "holly","homer","honey","honor","hooks","horde","horse","hound","hover","humid",
    "humor","hustle","hyena","icily","ideal","idiom","igloo","image","impel","inane",
    "incur","inept","infer","infix","inlay","innate","inter","intro","inure","irate",
    "irony","issue","ivory","japan","jerky","jewel","jiffy","jingo","joint","jolly",
    "joker","jovial","judge","jumbo","jumpy","junto","karma","kayak","kebab","khaki",
    "kinky","kneel","knife","knoll","knead","kudos","label","ladle","larva","laser",
    "latch","latch","lathe","latte","layer","leach","leafy","leave","ledge","lemon",
    "level","light","lilac","lithe","lingo","liner","liver","llama","lodge","lofty",
    "lorry","lover","lucid","lucky","lusty","lymph","lyric","magic","magma","maize",
    "major","mambo","manga","maple","march","marsh","mason","match","mauve","maxim",
    "mayor","meaty","medic","melee","mercy","merge","messy","metal","micro","might",
    "mimic","mince","minus","misty","mitre","modus","mogul","month","moody","moose",
    "mourn","muddy","mulch","mummy","murky","mused","mushy","musty","nadir","naive",
    "naval","nervy","night","ninja","nitro","noble","noise","north","notch","novel",
    "nudge","nurse","nymph","oaken","occur","ochre","offer","often","olive","ombre",
    "onset","opera","optic","orbit","order","other","otter","ought","outdo","outgo",
    "ovary","ovoid","oxide","ozone","paddy","pagan","paint","panda","panic","papal",
    "party","pasta","pasty","patch","patsy","pause","peace","peach","penal","penny",
    "perky","petty","phase","phone","photo","piano","piece","pilot","pixel","pizza",
    "place","plaid","plain","plait","plank","plant","plasm","plate","plaza","plead",
    "pleat","plumb","plume","plump","plunk","plush","poach","point","polar","polka",
    "polyp","porch","pound","pouty","power","prank","prawn","press","price","pride",
    "prime","prism","privy","probe","prowl","prude","prune","psalm","pubic","pudgy",
    "pulse","punch","puppy","pygmy","quaff","quake","qualm","query","queue","quick",
    "quota","quote","radon","rafts","rainy","rally","rancid","range","rapid","regal",
    "reign","relax","remit","remix","repay","repel","repot","rerun","retro","revel",
    "rhino","rhyme","rider","ridge","rigid","rivet","robot","rocky","rogue","rouge",
    "rough","round","rover","rowdy","rupee","rushy","rusty","sadly","saint","sandy",
    "savor","savvy","scald","scalp","scam","scarf","scarp","scene","scone","scoop",
    "score","scout","scowl","scram","screw","scrub","seize","servo","seven","sewer",
    "shade","shake","shall","shame","shank","shark","sharp","shave","shawl","sheep",
    "sheer","shelf","shell","shift","shirt","shock","shore","short","shout","shred",
    "shrew","shrub","shrug","shunt","siege","sigma","silky","silly","since","sixth",
    "sixty","skate","skiff","skim","skimp","skirt","skull","skunk","slain","slang",
    "slant","slash","slave","sleek","sleep","sleet","slept","slick","slink","slope",
    "sloth","slump","slunk","slurp","smack","small","smash","smear","smile","smite",
    "smock","smote","snake","snare","snarl","sneak","snide","sniff","snore","snort",
    "snout","snowy","snuck","snuff","soapy","solve","sonic","sorry","south","space",
    "spade","spare","spark","spasm","spawn","speed","spell","spend","spice","spill",
    "spite","splat","spoke","spool","spore","sport","spout","sprig","spunk","squad",
    "squat","squid","staff","staid","stain","stake","stalk","stall","stamp","stand",
    "stark","start","stash","stave","stead","steed","steel","steep","steer","stern",
    "stiff","still","sting","stink","stock","stomp","stool","stoop","store","storm",
    "stomp","story","stout","stove","strap","straw","stray","strip","strum","strut",
    "stung","stunk","stunt","style","suave","sugar","suite","sulky","sunny","surge",
    "swamp","swarm","swear","sweat","sweep","sweet","swept","swell","swift","swill",
    "swipe","swirl","swoop","swore","synod","syrup","taboo","talon","tangy","taunt",
    "tawny","tease","teeth","tempo","tense","tenth","tepid","terse","thank","thatch",
    "theft","thelma","there","thick","thief","thing","think","thorn","those","three",
    "threw","throw","thumb","thump","tiara","tidal","tiger","tight","tiled","tinge",
    "tipsy","titan","today","token","tonal","tonic","topaz","torch","total","totem",
    "touch","tough","towel","tower","toxic","trace","track","trail","trait","tramp",
    "trash","trawl","tread","treat","trend","trial","tribe","trick","trite","troop",
    "trout","trove","truce","truck","truly","trump","trunk","tryst","tummy","tuner",
    "tunic","twang","tweak","twirl","twist","tying","udder","ultra","uncut","under",
    "unfit","unify","until","unzip","upper","upset","urban","usage","usher","utmost",
    "utter","valor","valve","vapid","vault","vaunt","vague","vying","vicar","vigor",
    "viral","visor","visit","vital","vivid","vocal","vodka","voice","voila","volley",
    "voter","vouch","vowel","vying","wafer","wager","waken","weald","weave","wedge",
    "weedy","weigh","weird","whack","whale","wheat","wheel","where","which","while",
    "whiff","whirl","white","whole","whose","widen","wield","windy","witty","woken",
    "world","wormy","worst","wrath","wring","wrote","wryly","yearn","yield","young",
    "yourn","zesty","zilch","zonal",
].map(w => w.toUpperCase()).filter(w => w.length === 5);

// Remove duplicates
const WORD_LIST = [...new Set(WORDS)];

// ─── Daily word (same for everyone on a given date) ──────────────────────────
const EPOCH = new Date("2025-01-01").getTime();
function getDayIndex() {
    return Math.floor((Date.now() - EPOCH) / 86400000);
}
function getTodayWord() {
    return WORD_LIST[getDayIndex() % WORD_LIST.length];
}
function todayKey() {
    const d = new Date();
    return `dw-${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type TileState = "empty" | "typed" | "correct" | "present" | "absent";
type Phase = "playing" | "won" | "lost";

interface SavedGame {
    guesses: string[];
    phase: Phase;
    dayIndex: number;
}

interface Stats {
    played: number;
    wins: number;
    streak: number;
    maxStreak: number;
    distribution: number[]; // wins by guess count [1..6]
}

// ─── Evaluate a guess ─────────────────────────────────────────────────────────
function evaluate(guess: string, target: string): TileState[] {
    const result: TileState[] = Array(5).fill("absent");
    const targetLetters = target.split("");
    const guessLetters = guess.split("");
    const used = Array(5).fill(false);

    // First pass: correct
    guessLetters.forEach((l, i) => {
        if (l === targetLetters[i]) { result[i] = "correct"; used[i] = true; }
    });
    // Second pass: present
    guessLetters.forEach((l, i) => {
        if (result[i] === "correct") return;
        const ti = targetLetters.findIndex((tl, j) => tl === l && !used[j]);
        if (ti !== -1) { result[i] = "present"; used[ti] = true; }
    });
    return result;
}

// ─── Keyboard rows ────────────────────────────────────────────────────────────
const KB_ROWS = [
    ["Q","W","E","R","T","Y","U","I","O","P"],
    ["A","S","D","F","G","H","J","K","L"],
    ["ENTER","Z","X","C","V","B","N","M","⌫"],
];

// ─── Tile colors ──────────────────────────────────────────────────────────────
const TILE_COLORS: Record<TileState, { bg: string; border: string; text: string }> = {
    empty:   { bg: "transparent",   border: "#3a3a3a", text: "#fff" },
    typed:   { bg: "transparent",   border: "#888",    text: "#fff" },
    correct: { bg: "#16a34a",       border: "#16a34a", text: "#fff" },
    present: { bg: "#ca8a04",       border: "#ca8a04", text: "#fff" },
    absent:  { bg: "#374151",       border: "#374151", text: "#fff" },
};

const KB_COLORS: Record<string, { bg: string; text: string }> = {
    correct: { bg: "#16a34a", text: "#fff" },
    present: { bg: "#ca8a04", text: "#fff" },
    absent:  { bg: "#374151", text: "#999" },
    default: { bg: "#4b5563", text: "#fff" },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function DailyWord() {
    const target = getTodayWord();
    const dayIdx = getDayIndex();

    // Load saved game
    const loadSaved = (): { guesses: string[]; phase: Phase } => {
        try {
            const raw = localStorage.getItem(todayKey());
            if (raw) {
                const saved: SavedGame = JSON.parse(raw);
                if (saved.dayIndex === dayIdx) return { guesses: saved.guesses, phase: saved.phase };
            }
        } catch {}
        return { guesses: [], phase: "playing" };
    };

    const loadStats = (): Stats => {
        try {
            const raw = localStorage.getItem("dw-stats");
            if (raw) return JSON.parse(raw);
        } catch {}
        return { played: 0, wins: 0, streak: 0, maxStreak: 0, distribution: [0,0,0,0,0,0] };
    };

    const saved = loadSaved();
    const [guesses, setGuesses] = useState<string[]>(saved.guesses);
    const [current, setCurrent] = useState("");
    const [phase, setPhase] = useState<Phase>(saved.phase);
    const [revealedRows, setRevealedRows] = useState<Set<number>>(() => {
        const s = new Set<number>();
        saved.guesses.forEach((_, i) => s.add(i));
        return s;
    });
    const [shakeRow, setShakeRow] = useState<number | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const [showStats, setShowStats] = useState(false);
    const [stats, setStats] = useState<Stats>(loadStats);
    const [copied, setCopied] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Save game state
    useEffect(() => {
        localStorage.setItem(todayKey(), JSON.stringify({ guesses, phase, dayIndex: dayIdx }));
    }, [guesses, phase, dayIdx]);

    // Save stats
    useEffect(() => {
        localStorage.setItem("dw-stats", JSON.stringify(stats));
    }, [stats]);

    // Show stats after game ends
    useEffect(() => {
        if (phase !== "playing") {
            const t = setTimeout(() => setShowStats(true), 1600);
            return () => clearTimeout(t);
        }
    }, [phase]);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2000);
    };

    const shake = (row: number) => {
        setShakeRow(row);
        setTimeout(() => setShakeRow(null), 600);
    };

    const submit = useCallback(() => {
        if (phase !== "playing") return;
        const word = current.toUpperCase();
        if (word.length < 5) { shake(guesses.length); showToast("Not enough letters"); return; }
        if (!WORD_LIST.includes(word)) { shake(guesses.length); showToast("Not in word list"); return; }

        const nextGuesses = [...guesses, word];
        setGuesses(nextGuesses);
        setCurrent("");

        // Animate this row's reveal
        const rowIdx = guesses.length;
        setTimeout(() => setRevealedRows(r => new Set(r).add(rowIdx)), 0);

        const won = word === target;
        const lost = !won && nextGuesses.length >= 6;
        const newPhase: Phase = won ? "won" : lost ? "lost" : "playing";

        if (newPhase !== "playing") {
            setPhase(newPhase);
            setStats(prev => {
                const dist = [...prev.distribution];
                if (won) dist[nextGuesses.length - 1]++;
                const streak = won ? prev.streak + 1 : 0;
                return {
                    played: prev.played + 1,
                    wins: won ? prev.wins + 1 : prev.wins,
                    streak,
                    maxStreak: Math.max(prev.maxStreak, streak),
                    distribution: dist,
                };
            });
            setTimeout(() => showToast(won ? WIN_MESSAGES[Math.min(nextGuesses.length - 1, 5)] : `The word was ${target}`), 1800);
        }
    }, [current, guesses, phase, target]);

    const press = useCallback((key: string) => {
        if (phase !== "playing") return;
        if (key === "ENTER") { submit(); return; }
        if (key === "⌫" || key === "BACKSPACE") { setCurrent(c => c.slice(0, -1)); return; }
        if (/^[A-Z]$/.test(key) && current.length < 5) setCurrent(c => c + key);
    }, [phase, current, submit]);

    // Physical keyboard
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            if (e.key === "Enter") { e.preventDefault(); submit(); }
            else if (e.key === "Backspace") press("BACKSPACE");
            else if (/^[a-zA-Z]$/.test(e.key)) press(e.key.toUpperCase());
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [press, submit]);

    // ── Build tile states ──────────────────────────────────────────────────────
    const getTileStates = (rowIdx: number): TileState[] => {
        const revealed = revealedRows.has(rowIdx);
        if (rowIdx < guesses.length && revealed) return evaluate(guesses[rowIdx], target);
        if (rowIdx < guesses.length) return Array(5).fill("typed");
        if (rowIdx === guesses.length) {
            return Array(5).fill(null).map((_, i) =>
                i < current.length ? "typed" : "empty"
            );
        }
        return Array(5).fill("empty");
    };

    const getLetter = (rowIdx: number, colIdx: number): string => {
        if (rowIdx < guesses.length) return guesses[rowIdx][colIdx] ?? "";
        if (rowIdx === guesses.length) return current[colIdx] ?? "";
        return "";
    };

    // ── Keyboard letter states (best = correct > present > absent) ─────────────
    const keyStates = (() => {
        const map: Record<string, TileState> = {};
        const rank: Record<TileState, number> = { correct: 3, present: 2, absent: 1, typed: 0, empty: 0 };
        guesses.forEach(g => {
            if (revealedRows.has(guesses.indexOf(g))) {
                evaluate(g, target).forEach((state, i) => {
                    const l = g[i];
                    if ((rank[state] ?? 0) > (rank[map[l]] ?? 0)) map[l] = state;
                });
            }
        });
        return map;
    })();

    // ── Share ─────────────────────────────────────────────────────────────────
    const shareResult = () => {
        const header = `Daily Word #${dayIdx + 1}  ${phase === "won" ? guesses.length : "X"}/6`;
        const grid = guesses.map(g =>
            evaluate(g, target).map(s =>
                s === "correct" ? "🟩" : s === "present" ? "🟨" : "⬛"
            ).join("")
        ).join("\n");
        navigator.clipboard.writeText(`${header}\n\n${grid}\n\nhttps://yassinejdair.ie`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ── Time until next word ──────────────────────────────────────────────────
    const [countdown, setCountdown] = useState("");
    useEffect(() => {
        const tick = () => {
            const now = new Date();
            const next = new Date(now);
            next.setHours(24, 0, 0, 0);
            const diff = next.getTime() - now.getTime();
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setCountdown(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="min-h-screen bg-[#111] text-white flex flex-col select-none">
            {/* Injected animations */}
            <style>{`
        @keyframes tile-flip {
          0%   { transform: scaleY(1); }
          40%  { transform: scaleY(0); }
          60%  { transform: scaleY(0); }
          100% { transform: scaleY(1); }
        }
        @keyframes tile-pop {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-6px); }
          40%     { transform: translateX(6px); }
          60%     { transform: translateX(-4px); }
          80%     { transform: translateX(4px); }
        }
        @keyframes bounce-in {
          0%   { transform: scale(0.85); opacity: 0; }
          60%  { transform: scale(1.05); }
          100% { transform: scale(1);    opacity: 1; }
        }
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .tile-flip-row .tile { animation: tile-flip 0.5s ease forwards; }
        .tile-pop { animation: tile-pop 0.1s ease; }
        .row-shake { animation: shake 0.5s ease; }
      `}</style>

            <Navbar />

            {/* Header */}
            <div className="border-b border-[#2a2a2a] py-3 px-4 flex items-center justify-between max-w-xl mx-auto w-full">
                <div className="text-xs text-gray-500 font-mono">
                    #{dayIdx + 1} · {new Date().toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" })}
                </div>
                <h1 className="text-lg font-bold tracking-widest">DAILY WORD</h1>
                <button onClick={() => setShowStats(true)} className="text-gray-400 hover:text-white transition text-xl" aria-label="Stats">📊</button>
            </div>

            {/* Toast */}
            {toast && (
                <div style={{ position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)", zIndex: 100,
                    animation: "toast-in 0.2s ease", background: "#fff", color: "#111",
                    padding: "8px 18px", borderRadius: 8, fontWeight: 600, fontSize: 14, whiteSpace: "nowrap" }}>
                    {toast}
                </div>
            )}

            {/* Grid */}
            <div className="flex flex-col items-center justify-center flex-1 gap-1.5 py-4 px-4">
                {Array.from({ length: 6 }, (_, rowIdx) => {
                    const states = getTileStates(rowIdx);
                    const isRevealed = revealedRows.has(rowIdx) && rowIdx < guesses.length;
                    const isShaking = shakeRow === rowIdx;

                    return (
                        <div
                            key={rowIdx}
                            className={isShaking ? "row-shake" : ""}
                            style={{ display: "flex", gap: 6 }}
                        >
                            {Array.from({ length: 5 }, (_, colIdx) => {
                                const state = states[colIdx];
                                const letter = getLetter(rowIdx, colIdx);
                                const c = TILE_COLORS[state];
                                const delay = isRevealed ? colIdx * 120 : 0;
                                const isTyped = rowIdx === guesses.length && colIdx === current.length - 1 && letter;

                                return (
                                    <div
                                        key={colIdx}
                                        className={isTyped ? "tile-pop" : ""}
                                        style={{
                                            width: 58, height: 58,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            border: `2px solid ${c.border}`,
                                            background: isRevealed ? c.bg : state === "typed" ? "transparent" : "transparent",
                                            color: c.text,
                                            fontSize: 26, fontWeight: 800,
                                            borderRadius: 4,
                                            transition: isRevealed ? `background-color 0s ${delay}ms, border-color 0s ${delay}ms` : "border-color 0.1s",
                                            animation: isRevealed ? `tile-flip 0.5s ease ${delay}ms forwards` : undefined,
                                        }}
                                    >
                                        {/* We need to show colour AFTER the flip midpoint — achieved by delayed background-color transition */}
                                        <span style={{ animation: isRevealed ? `tile-flip 0.5s ease ${delay}ms forwards` : undefined, display: "block" }}>
                      {letter}
                    </span>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            {/* On-screen keyboard */}
            <div className="flex flex-col items-center gap-1.5 pb-6 px-2">
                {KB_ROWS.map((row, ri) => (
                    <div key={ri} style={{ display: "flex", gap: 5 }}>
                        {row.map(key => {
                            const state = keyStates[key];
                            const colors = state ? KB_COLORS[state] : KB_COLORS.default;
                            const isWide = key === "ENTER" || key === "⌫";
                            return (
                                <button
                                    key={key}
                                    onPointerDown={e => { e.preventDefault(); press(key); }}
                                    style={{
                                        width: isWide ? 56 : 36,
                                        height: 56,
                                        background: colors.bg,
                                        color: colors.text,
                                        border: "none",
                                        borderRadius: 6,
                                        fontSize: isWide ? 11 : 15,
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        transition: "background 0.2s",
                                        touchAction: "manipulation",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        userSelect: "none",
                                    }}
                                >
                                    {key}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Stats modal */}
            {showStats && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.75)" }}
                    onClick={e => { if (e.target === e.currentTarget) setShowStats(false); }}
                >
                    <div
                        style={{ background: "#1a1a1a", borderRadius: 16, padding: "28px 24px", width: "100%", maxWidth: 380,
                            animation: "bounce-in 0.3s ease", border: "1px solid #2a2a2a" }}
                    >
                        {/* Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: 2 }}>STATISTICS</h2>
                            <button onClick={() => setShowStats(false)} style={{ background: "none", border: "none", color: "#9ca3af", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
                        </div>

                        {/* 4 stat boxes */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 24 }}>
                            {[
                                { label: "Played",  value: stats.played },
                                { label: "Win %",   value: stats.played ? Math.round(stats.wins / stats.played * 100) : 0 },
                                { label: "Streak",  value: stats.streak },
                                { label: "Best",    value: stats.maxStreak },
                            ].map(s => (
                                <div key={s.label} style={{ textAlign: "center", background: "#2a2a2a", borderRadius: 10, padding: "10px 4px" }}>
                                    <div style={{ fontSize: 24, fontWeight: 800, color: "#eab308" }}>{s.value}</div>
                                    <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Guess distribution */}
                        <div style={{ marginBottom: 24 }}>
                            <p style={{ fontSize: 12, letterSpacing: 2, color: "#9ca3af", marginBottom: 10 }}>GUESS DISTRIBUTION</p>
                            {stats.distribution.map((count, i) => {
                                const maxCount = Math.max(...stats.distribution, 1);
                                const isLast = phase !== "playing" && guesses.length === i + 1;
                                return (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                        <span style={{ fontSize: 12, color: "#9ca3af", width: 12, textAlign: "right" }}>{i + 1}</span>
                                        <div style={{ flex: 1, background: "#2a2a2a", borderRadius: 4, height: 22, overflow: "hidden" }}>
                                            <div style={{
                                                width: `${Math.max(7, (count / maxCount) * 100)}%`,
                                                height: "100%",
                                                background: isLast ? "#16a34a" : "#374151",
                                                borderRadius: 4,
                                                display: "flex", alignItems: "center", justifyContent: "flex-end",
                                                paddingRight: 6,
                                                transition: "width 0.5s ease",
                                            }}>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{count}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Result reveal */}
                        {phase !== "playing" && (
                            <div style={{ textAlign: "center", marginBottom: 20 }}>
                                {phase === "won"
                                    ? <p style={{ color: "#4ade80", fontWeight: 700, fontSize: 15 }}>🎉 {WIN_MESSAGES[Math.min(guesses.length - 1, 5)]}</p>
                                    : <p style={{ color: "#f87171", fontWeight: 700, fontSize: 15 }}>The word was <span style={{ color: "#fbbf24", letterSpacing: 2 }}>{target}</span></p>
                                }
                            </div>
                        )}

                        {/* Next word + share */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            <div style={{ background: "#2a2a2a", borderRadius: 10, padding: "12px 8px", textAlign: "center" }}>
                                <p style={{ fontSize: 10, color: "#9ca3af", letterSpacing: 1 }}>NEXT WORD</p>
                                <p style={{ fontSize: 22, fontWeight: 800, fontFamily: "monospace", color: "#fff", marginTop: 2 }}>{countdown}</p>
                            </div>
                            <button onClick={shareResult} style={{
                                background: copied ? "#16a34a" : "#eab308",
                                color: "#000", border: "none", borderRadius: 10,
                                fontWeight: 800, fontSize: 14, cursor: "pointer",
                                transition: "background 0.2s", letterSpacing: 1,
                            }}>
                                {copied ? "✓ COPIED!" : "SHARE 📋"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const WIN_MESSAGES = ["Genius!", "Magnificent!", "Impressive!", "Splendid!", "Great!", "Phew!"];