import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import {
  Bell,
  ChevronDown,
  Gauge,
  GraduationCap,
  Inbox,
  LogOut,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  User,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { TabKey } from "../types";
import { avatars } from "../data";
import { useOutside } from "./shared";

const tabs: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: "plan", label: "Learning Plan", icon: GraduationCap },
  { key: "team", label: "Team", icon: UsersRound },
  { key: "progress", label: "Progress", icon: Gauge },
  { key: "inbox", label: "Inbox", icon: Inbox },
  { key: "settings", label: "Settings", icon: SlidersHorizontal },
];

const BUMP_W = 132;

export function TopBar({
  tab,
  setTab,
  unreadInbox,
  toast,
}: {
  tab: TabKey;
  setTab: (t: TabKey) => void;
  unreadInbox: number;
  toast: (text: string, emoji?: string) => void;
}) {
  const navRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<TabKey, HTMLButtonElement | null>>>({});
  const target = useMotionValue(0);
  const spring = useSpring(target, { stiffness: 260, damping: 26, mass: 0.9 });
  const bumpX = useTransform(spring, (v) => v - BUMP_W / 2);
  const first = useRef(true);
  const rafRef = useRef(0);

  // Track the active tab centre while the label expands (CSS transition),
  // so the notch glides to exactly the right place.
  const track = useCallback(
    (duration = 520) => {
      cancelAnimationFrame(rafRef.current);
      const t0 = performance.now();
      const tick = () => {
        const el = tabRefs.current[tab];
        if (el) {
          const c = el.offsetLeft + el.offsetWidth / 2;
          if (first.current) {
            spring.jump(c);
            target.set(c);
            first.current = false;
          } else target.set(c);
        }
        if (performance.now() - t0 < duration) rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    },
    [tab, spring, target],
  );

  useLayoutEffect(() => {
    track();
    return () => cancelAnimationFrame(rafRef.current);
  }, [track]);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const ro = new ResizeObserver(() => track(120));
    ro.observe(nav);
    return () => ro.disconnect();
  }, [track]);

  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useOutside(menuRef, () => setMenu(false), menu);

  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      toast("Full screen mode activated", "⛶");
    } else {
      document.exitFullscreen().catch(() => {});
      toast("Exited browser full screen", "↙");
    }
  };

  return (
    <header className="relative z-30 grid h-[68px] shrink-0 grid-cols-[auto_1fr_auto] items-center px-4 text-white sm:h-[72px] sm:px-7 lg:grid-cols-[1fr_auto_1fr]">
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={() => setTab("plan")}
        className="justify-self-start text-[26px] font-bold tracking-tight"
        aria-label="Dei home"
      >
        Dei
      </motion.button>

      {/* ---------------- centre navigation ---------------- */}
      <nav
        ref={navRef}
        aria-label="Main"
        className="relative flex h-full items-center justify-center gap-0.5 justify-self-center sm:gap-1.5"
      >
        {tabs.map((t) => {
          const active = t.key === tab;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              ref={(el) => {
                tabRefs.current[t.key] = el;
              }}
              onClick={() => setTab(t.key)}
              title={t.label}
              aria-label={t.label}
              aria-current={active ? "page" : undefined}
              className={`group relative flex h-10 items-center rounded-full px-2.5 text-[13px] transition-colors duration-300 sm:px-3.5 ${
                active ? "text-white" : "text-white/55 hover:text-white"
              }`}
            >
              <span className="relative grid place-items-center transition-transform duration-300 group-hover:scale-110 group-active:scale-90">
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                {t.key === "inbox" && unreadInbox > 0 && (
                  <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#ff7a8a] ring-2 ring-ink" />
                )}
              </span>
              <span
                className={`hidden overflow-hidden transition-[grid-template-columns,opacity] duration-300 ease-out sm:grid ${
                  active ? "grid-cols-[1fr] opacity-100" : "grid-cols-[0fr] opacity-0"
                }`}
              >
                <span className="overflow-hidden">
                  <span className="block whitespace-nowrap pl-2 font-medium">{t.label}</span>
                </span>
              </span>
            </button>
          );
        })}

        {/* The notch that dips into the page under the active tab */}
        <motion.svg
          aria-hidden
          style={{ x: bumpX, width: BUMP_W }}
          className="pointer-events-none absolute left-0 top-[calc(100%-1px)] h-[17px] text-ink"
          viewBox="0 0 132 17"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,0 C26,0 34,1 44,8 C51,13 56,16.5 66,16.5 C76,16.5 81,13 88,8 C98,1 106,0 132,0 Z"
          />
        </motion.svg>
      </nav>

      {/* ---------------- user + fullscreen ---------------- */}
      <div className="flex items-center gap-1.5 sm:gap-2 justify-self-end">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit full screen (Esc)" : "Full screen (F11)"}
          aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
          className="grid h-9 w-9 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
        </motion.button>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenu((m) => !m)}
            aria-haspopup="menu"
            aria-expanded={menu}
            className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 transition hover:bg-white/10 active:scale-[0.97]"
          >
            <img
              src={avatars.user}
              alt="Ellington Thom"
              className="h-9 w-9 rounded-full bg-[#f6d9c9] object-cover ring-2 ring-white/20"
            />
            <span className="hidden text-left leading-tight md:block">
              <span className="block text-[13px] font-semibold">Ellington Thom</span>
              <span className="block text-[10.5px] text-white/50">annette@gmail.com</span>
            </span>
            <motion.span animate={{ rotate: menu ? 180 : 0 }} className="hidden sm:block">
              <ChevronDown size={16} />
            </motion.span>
          </button>

          <AnimatePresence>
            {menu && (
              <motion.div
                role="menu"
                initial={{ opacity: 0, y: -8, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                style={{ transformOrigin: "top right" }}
                className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 rounded-[24px] bg-white p-2 text-ink shadow-[0_30px_60px_-15px_rgba(0,0,0,0.45)]"
              >
                <div className="flex items-center gap-3 rounded-2xl bg-[#f3f3f3] p-3">
                  <img src={avatars.user} alt="" className="h-10 w-10 rounded-full object-cover" />
                  <div className="leading-tight">
                    <p className="text-[14px] font-semibold">Ellington Thom</p>
                    <p className="text-[11.5px] text-neutral-500">annette@gmail.com</p>
                  </div>
                </div>
                {[
                  { icon: User, label: "My profile", run: () => toast("Profile opened", "👤") },
                  { icon: isFullscreen ? Minimize2 : Maximize2, label: isFullscreen ? "Exit full screen" : "Full screen view", run: toggleFullscreen },
                  { icon: Bell, label: "Notifications", run: () => toast("You're all caught up", "🔔") },
                  { icon: SlidersHorizontal, label: "Account settings", run: () => setTab("settings") },
                  { icon: LogOut, label: "Sign out", run: () => toast("Signed out — just kidding, this is a demo", "👋") },
                ].map((it) => (
                  <button
                    key={it.label}
                    role="menuitem"
                    onClick={() => {
                      it.run();
                      setMenu(false);
                    }}
                    className="mt-0.5 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[13.5px] transition hover:bg-neutral-100 active:scale-[0.98]"
                  >
                    <it.icon size={16} className="text-neutral-500" />
                    {it.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
