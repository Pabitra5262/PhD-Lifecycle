import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePersistentState } from "@/shared/hooks/usePersistentState";
import { flattenMenu } from "../Sidebar/menuItems";
import { routes } from "@/app/routes/routeConfig";

const isCurrentPage = (path: string) => Object.values(routes).some((route) => route.protected && route.path === path);

/* Ported from hims-ui-new app/NavMemory.tsx */

export interface Visit {
    to: string;
    label: string;
}

const titleCase = (s: string) => s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** Menu label for a path (case-insensitive match on the sidebar menu), else a readable form of the last segment. */
const labelForPath = (pathname: string): string => {
    const hit = flattenMenu().find((p) => p.path.toLowerCase() === pathname.toLowerCase());
    if (hit) return hit.label;
    return titleCase(pathname.split("/").filter(Boolean).pop() ?? "Dashboard");
};

interface NavMemoryValue {
    /** Paths of the starred menu pages (saved on this device). */
    favourites: string[];
    toggleFavourite: (path: string) => void;
    /** Recently visited pages, newest first. */
    recents: Visit[];
    /** Open page tabs, in the order they were opened. */
    tabs: Visit[];
    closeTab: (to: string) => void;
    /** Empties the recent list and closes every tab except the current page. */
    clearHistory: () => void;
}

const NavMemoryContext = createContext<NavMemoryValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useNavMemory = (): NavMemoryValue => {
    const ctx = useContext(NavMemoryContext);
    if (!ctx) throw new Error("useNavMemory must be used inside <NavMemoryProvider>");
    return ctx;
};

const MAX_RECENTS = 6;
const MAX_TABS = 6;

/** Remembers favourites, the open page tabs and recently visited pages on this device. */
export const NavMemoryProvider = ({ children }: { children: ReactNode }) => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [recents, setRecents] = usePersistentState<Visit[]>("arf.recents", []);
    const [tabs, setTabs] = usePersistentState<Visit[]>("arf.tabs", []);
    const [favourites, setFavourites] = usePersistentState<string[]>("arf.favourites", []);

    const toggleFavourite = useCallback(
        (path: string) => setFavourites((f) => (f.includes(path) ? f.filter((x) => x !== path) : [...f, path])),
        [setFavourites],
    );

    // Every route change opens (or re-uses) a tab and moves the page to the top of the recent list.
    useEffect(() => {
        if (!isCurrentPage(pathname)) return;
        const visit = { to: pathname, label: labelForPath(pathname) };
        const raf = requestAnimationFrame(() => {
            setTabs((t) => (t.some((x) => x.to === visit.to) ? t : [...t, visit].slice(-MAX_TABS)));
            setRecents((r) => [visit, ...r.filter((x) => x.to !== visit.to)].slice(0, MAX_RECENTS));
        });
        return () => cancelAnimationFrame(raf);
    }, [pathname, setTabs, setRecents]);

    const closeTab = useCallback(
        (to: string) => {
            const i = tabs.findIndex((t) => t.to === to);
            const next = tabs.filter((t) => t.to !== to);
            setTabs(next);
            // Closing the page you are on moves to its neighbour.
            if (to === pathname) navigate((next[Math.min(i, next.length - 1)] ?? { to: "/dashboard" }).to);
        },
        [tabs, pathname, navigate, setTabs],
    );

    const clearHistory = useCallback(() => {
        setRecents([]);
        setTabs([{ to: pathname, label: labelForPath(pathname) }]);
    }, [pathname, setRecents, setTabs]);

    const value = useMemo(
        () => ({ favourites: favourites.filter(isCurrentPage), toggleFavourite, recents: recents.filter((visit) => isCurrentPage(visit.to)), tabs: tabs.filter((visit) => isCurrentPage(visit.to)), closeTab, clearHistory }),
        [favourites, toggleFavourite, recents, tabs, closeTab, clearHistory],
    );
    return <NavMemoryContext.Provider value={value}>{children}</NavMemoryContext.Provider>;
};
