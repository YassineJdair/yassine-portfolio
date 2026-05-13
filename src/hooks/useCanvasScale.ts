import { useEffect, useRef, useState } from "react";

/**
 * Measures a flex container and returns the largest uniform scale factor
 * that fits a canvas of (canvasW × canvasH) inside it.
 * Never scales above 1 (original size).
 */
export function useCanvasScale(canvasW: number, canvasH: number) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const update = () => {
            const el = wrapRef.current;
            if (!el) return;
            const { clientWidth, clientHeight } = el;
            if (!clientWidth || !clientHeight) return;
            setScale(Math.min(clientWidth / canvasW, clientHeight / canvasH, 1));
        };

        // Run once, then watch for resizes
        update();
        const ro = new ResizeObserver(update);
        if (wrapRef.current) ro.observe(wrapRef.current);
        return () => ro.disconnect();
    }, [canvasW, canvasH]);

    return { wrapRef, scale };
}