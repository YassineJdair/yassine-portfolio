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
        subtitle: "Headless E-Commerce Storefront",
        description: "Headless Shopify storefront for a perfume brand with full catalog, cart, and customer accounts.",
        stack: ["React 19", "React Router 7", "Tailwind", "shadcn/ui", "Shopify Storefront GraphQL", "Netlify Functions", "Klaviyo", "Judge.me", "GA4", "ipapi.co"],
        scale: "~9,400 LOC · 18 components · 16 routed pages · multi-currency",
        highlight: "Built entirely independently — integrated Shopify checkout/payments, email marketing, reviews, and analytics into a custom headless frontend with multi-currency support and customer account auth.",
        liveUrl: "https://maisondoud.com",
        image: null,
    },
    {
        title: "Hydrosolutions Biller",
        subtitle: "Business Management SaaS",
        description: "Internal tool for a car-detailing business — invoicing/quoting, CRM, expense tracking, fleet maintenance log, job scheduling, and a social media video generator.",
        stack: ["React 18", "TypeScript", "Vite", "Supabase", "Postgres RLS", "@react-pdf/renderer", "FFmpeg WASM"],
        scale: "~6,000 LOC · 7-table normalized schema with Row-Level Security · 6 custom data hooks",
        highlight: "Independently designed the database schema and RLS security model; implemented in-browser video editing using FFmpeg WASM and automated PDF invoice generation.",
        liveUrl: null,
        private: true,
        image: null,
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
        image: null,
    },
    {
        title: "Developer Portfolio & App Suite",
        subtitle: "This Site",
        description: "Personal portfolio bundling 8 browser games, financial calculators, and dev utility tools.",
        stack: ["React 18", "TypeScript", "Vite", "Tailwind", "shadcn/ui", "React Router", "TanStack Query", "Vitest", "GitHub Actions"],
        scale: "~12,100 LOC · 100 files · 26 routes · 49 UI primitives · unit-tested calculator logic",
        highlight: "Full CI/CD pipeline (lint, typecheck, test, build) via GitHub Actions; demonstrates range across games, tools, and calculators.",
        liveUrl: "https://yassine-mac.netlify.app",
        image: null,
    },
    {
        title: "Hydrosolutions",
        subtitle: "Booking / Marketing Site",
        description: "Marketing and live-booking site for a window-cleaning/car-detailing business.",
        stack: ["HTML", "CSS", "Vanilla JS", "Netlify Functions", "Cal.com v2 API"],
        scale: "~1,500 LOC · custom slot-picker UI built from scratch",
        highlight: "Lightweight serverless integration with secure API-key handling, no framework overhead.",
        liveUrl: "https://www.hydrosolutions.ie",
        image: null,
    },
    {
        title: "Atelier Bloom",
        subtitle: "Marketing Website",
        description: "Static brochure site for an event styling/decor company with culturally-specific occasion pages (Nikkah/Walima, weddings, etc.)",
        stack: ["HTML5", "CSS3", "Vanilla JS"],
        scale: "~3,000 LOC across 16 pages · strong SEO (JSON-LD, sitemap, OG tags)",
        highlight: "Clean, dependency-free, SEO-optimized static site delivery.",
        liveUrl: "https://atelierbloomevents.com/",
        image: null,
    },
];
