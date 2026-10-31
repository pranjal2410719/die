import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Award,
  Calendar,
  CheckCircle2,
  CheckCheck,
  MessageSquare,
  Unlock,
  X,
} from "lucide-react";
import BellButton from "@/components/kokonutui/bell-button";
import { notifications } from "../data";

interface Props {
  unread: number;
  setUnread: React.Dispatch<React.SetStateAction<number>>;
  toast: (text: string, icon?: any) => void;
}

function getNotifIcon(type: string) {
  switch (type) {
    case "completed":
      return (
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 size={17} />
        </div>
      );
    case "webinar":
      return (
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-700">
          <Calendar size={17} />
        </div>
      );
    case "comment":
      return (
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-purple-100 text-purple-700">
          <MessageSquare size={17} />
        </div>
      );
    case "unlock":
      return (
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700">
          <Unlock size={17} />
        </div>
      );
    case "badge":
    default:
      return (
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-700">
          <Award size={17} />
        </div>
      );
  }
}

export function NotificationsBottomRight({ unread, setUnread, toast }: Props) {
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const markAll = useCallback(() => {
    setRead(new Set(notifications.map((n) => n.id)));
    setUnread(0);
    toast("All notifications marked as read", CheckCheck);
  }, [setUnread, toast]);

  const readOne = useCallback(
    (id: string) => {
      if (read.has(id)) return;
      setRead((prev) => new Set(prev).add(id));
      setUnread((u) => Math.max(0, u - 1));
    },
    [read, setUnread]
  );

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-5 right-5 z-40 flex flex-col items-end pointer-events-auto"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="mb-3 w-[340px] max-w-[calc(100vw-36px)] rounded-[26px] bg-white p-3.5 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/5"
          >
            <div className="flex items-center justify-between px-2 pb-2 pt-1 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-semibold text-neutral-900">Notifications</p>
                {unread > 0 && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                    {unread} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button
                    onClick={markAll}
                    className="rounded-full px-2.5 py-1 text-[12px] font-medium text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="grid h-7 w-7 place-items-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            <div className="mt-2 flex max-h-[360px] flex-col gap-1 overflow-y-auto soft-scroll pr-0.5">
              {notifications.map((n) => {
                const isRead = read.has(n.id) || unread === 0;
                return (
                  <button
                    key={n.id}
                    onClick={() => readOne(n.id)}
                    className="flex w-full items-start gap-3 rounded-2xl p-2.5 text-left transition hover:bg-neutral-100/80 active:scale-[0.98]"
                  >
                    {getNotifIcon(n.type)}
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-[13px] leading-snug ${
                          isRead ? "text-neutral-500" : "font-medium text-neutral-900"
                        }`}
                      >
                        {n.title}
                      </span>
                      <span className="text-[11px] text-neutral-400">{n.time}</span>
                    </span>
                    {!isRead && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-sm" />
                    )}
                  </button>
                );
              })}
            </div>

            {unread > 0 && (
              <p className="px-2 pt-2 pb-0.5 text-center text-[11.5px] text-neutral-400">
                + {Math.max(0, unread - notifications.filter((n) => !read.has(n.id)).length)} older notifications
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kokonut UI Bell Button */}
      <BellButton
        variant="default"
        count={unread}
        label="Notifications"
        subscribedLabel="Notifications"
        subscribed={open}
        onSubscribedChange={(val) => setOpen(val)}
        className="shadow-[0_12px_28px_-6px_rgba(0,0,0,0.3)] hover:shadow-[0_16px_34px_-6px_rgba(0,0,0,0.35)] transition-all bg-white text-neutral-900 border-neutral-200"
      />
    </div>
  );
}
