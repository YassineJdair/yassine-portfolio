export interface FeaturedProject {
    title: string;
    subtitle: string;
    description: string;
    stack: string[];
    scale: string;
    highlight: string;
    liveUrl: string | null; // fill in with the live URL when available
    private?: boolean; // true when there is no public URL by design (login-gated / internal tool)
    image: string | null; // path to a screenshot/GIF in /public when available
}

export const featuredProjects: FeaturedProject[] = [
    {
        title: "Maison D'Oud",
        subtitle: "Live E-Commerce Site & Analytics",
        description: "Headless Shopify storefront for my perfume brand with catalog, cart, customer accounts, EUR/GBP pricing, and a private live analytics dashboard.",
        stack: ["React 19", "React Router 7", "Tailwind", "shadcn/ui", "Shopify Storefront GraphQL", "Netlify Functions", "Edge Functions", "Supabase", "Klaviyo", "Judge.me", "GA4", "Recharts", "Leaflet"],
        scale: "~12,400 LOC · 21 components · 20 pages · HMAC-verified Shopify webhook",
        highlight: "Built first-party analytics: serverless endpoints log events to Supabase and a verified Shopify order webhook links website and POS sales back to the visit. Edge functions add per-page SEO and structured data, and a server-side proxy keeps the private reviews token out of the browser.",
        liveUrl: "https://maisondoud.com",
        image: "/screenshots/maison-doud.jpg",
    },
    {
        title: "Hydrosolutions Biller",
        subtitle: "Business Management App",
        description: "Internal app for my service business: quotes and invoices, customers, expenses with private receipt storage, fleet maintenance, jobs, and PDF, Excel and ZIP exports.",
        stack: ["React 18", "TypeScript", "Vite", "Supabase", "Postgres RLS", "@react-pdf/renderer", "ExcelJS", "PGlite", "GitHub Actions"],
        scale: "~6,100 LOC · 9-table schema with Row-Level Security · numbered migrations · audit log",
        highlight: "Designed the database and access model: staff allow-list, totals re-checked in Postgres, customer and document saved in one transaction, and CI that lints, tests and builds on every push, with database tests running against an isolated PGlite instance.",
        liveUrl: null,
        private: true,
        image: "/screenshots/hydrosolutions-biller.jpg",
    },
    {
        title: "FID (Family Insight of Deen)",
        subtitle: "Full-Stack Web App",
        description: "Private, login-gated family study ledger for logging study sessions with attachments and role-based access.",
        stack: ["Next.js 16", "React 19", "TypeScript", "Supabase", "Postgres RLS", "Vitest"],
        scale: "~3,200 LOC · 45 files · RBAC at middleware and database layers · direct-to-storage uploads",
        highlight: "Architected defense-in-depth security — access control enforced independently at both the middleware layer and the database (RLS) layer.",
        liveUrl: null,
        private: true,
        image: "/screenshots/fid.jpg",
    },
    {
        title: "Developer Portfolio & App Suite",
        subtitle: "This Site",
        description: "Personal portfolio bundling 8 browser games, financial calculators, and dev utility tools.",
        stack: ["React 18", "TypeScript", "Vite", "Tailwind", "shadcn/ui", "React Router", "TanStack Query", "Vitest", "GitHub Actions"],
        scale: "~12,100 LOC · 100 files · 26 routes · 49 UI primitives · unit-tested calculator logic",
        highlight: "Full CI/CD pipeline (lint, typecheck, test, build) via GitHub Actions; demonstrates range across games, tools, and calculators.",
        liveUrl: "https://www.yassinejdair.dev",
        image: "/screenshots/portfolio.jpg",
    },
    {
        title: "Hydrosolutions",
        subtitle: "Live Booking Site",
        description: "Multi-page site with live online booking for my car-valeting and window-cleaning business.",
        stack: ["HTML", "CSS", "Vanilla JS", "Netlify Functions", "Cal.com v2 API", "Supabase", "GA4"],
        scale: "~2,500 LOC · 12 pages · custom slot picker and package builder",
        highlight: "Serverless functions fetch availability and create bookings with the API key kept server-side and only allow-listed services accepted, plus moderated reviews, county landing pages and consent-based lead tracking.",
        liveUrl: "https://www.hydrosolutions.ie",
        image: "/screenshots/hydrosolutions.jpg",
    },
    {
        title: "Atelier Bloom",
        subtitle: "Marketing Website",
        description: "Static brochure site for an event styling/decor company with culturally-specific occasion pages (Nikkah/Walima, weddings, etc.)",
        stack: ["HTML5", "CSS3", "Vanilla JS"],
        scale: "~3,000 LOC across 16 pages · strong SEO (JSON-LD, sitemap, OG tags)",
        highlight: "Clean, dependency-free, SEO-optimized static site delivery.",
        liveUrl: "https://atelierbloomevents.com/",
        image: "/screenshots/atelier-bloom.jpg",
    },
];
