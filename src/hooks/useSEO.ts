import { useEffect } from "react";

const SITE_URL = "https://www.yassinejdair.dev";

function setMeta(attr: "name" | "property", key: string, content: string) {
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute("content", content);
}

export function useSEO(title: string, description: string, path: string) {
    useEffect(() => {
        document.title = title;
        setMeta("name", "description", description);
        setMeta("property", "og:title", title);
        setMeta("property", "og:description", description);
        setMeta("name", "twitter:title", title);
        setMeta("name", "twitter:description", description);

        const url = `${SITE_URL}${path}`;
        setMeta("property", "og:url", url);

        let canonical = document.head.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement("link");
            canonical.setAttribute("rel", "canonical");
            document.head.appendChild(canonical);
        }
        canonical.setAttribute("href", url);
    }, [title, description, path]);
}
