"use client";

import { Npc } from "@/shared/types/npc";
import { cn } from "@/shared/lib/utils";
import { UserRound } from "lucide-react";
import { useRef, useState } from "react";

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  sujeitos: Npc[];
  onMention?: (s: Npc) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

// Texto antes do cursor terminando em "@palavra" (sem espaço) → query ativa.
const TRIGGER = /@([\p{L}\d]*)$/u;

export function MentionTextarea({
  value, onChange, sujeitos, onMention, placeholder, rows = 3, className,
}: MentionTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [caret, setCaret] = useState(0);
  const [active, setActive] = useState(0);

  const matches = query !== null
    ? sujeitos.filter((s) => s.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];
  const open = query !== null && matches.length > 0;

  function sync(el: HTMLTextAreaElement) {
    const pos = el.selectionStart ?? el.value.length;
    const before = el.value.slice(0, pos);
    const m = before.match(TRIGGER);
    setCaret(pos);
    setQuery(m ? m[1] : null);
    setActive(0);
  }

  function pick(s: Npc) {
    const el = ref.current;
    if (!el) return;
    const before = value.slice(0, caret);
    const m = before.match(TRIGGER);
    const start = m ? before.length - m[0].length : caret;
    const next = `${value.slice(0, start)}@${s.name} ${value.slice(caret)}`;
    onChange(next);
    onMention?.(s);
    setQuery(null);
    const newCaret = start + s.name.length + 2;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newCaret, newCaret);
    });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % matches.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a - 1 + matches.length) % matches.length); }
    else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); pick(matches[active]); }
    else if (e.key === "Escape") { setQuery(null); }
  }

  return (
    <div className="relative">
      <textarea
        ref={ref}
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => { onChange(e.target.value); sync(e.target); }}
        onKeyUp={(e) => sync(e.currentTarget)}
        onClick={(e) => sync(e.currentTarget)}
        onKeyDown={onKeyDown}
        onBlur={() => setTimeout(() => setQuery(null), 120)}
        className={cn(
          "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm resize-y outline-none focus-visible:ring-1 focus-visible:ring-ring",
          className,
        )}
      />
      {open && (
        <div className="absolute left-2 top-full z-20 mt-1 w-64 rounded-md border border-border bg-popover shadow-md overflow-hidden">
          <p className="px-2.5 pt-2 pb-1 text-[10px] uppercase tracking-widest text-muted-foreground">Mencionar sujeito</p>
          {matches.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); pick(s); }}
              onMouseEnter={() => setActive(i)}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-1.5 text-left transition-colors",
                i === active ? "bg-muted" : "hover:bg-muted/60",
              )}
            >
              <div className="h-7 w-7 shrink-0 rounded-full border border-border overflow-hidden bg-muted flex items-center justify-center">
                {s.image_url
                  ? <img src={s.image_url} alt="" className="h-full w-full object-cover" />
                  : <UserRound className="h-3.5 w-3.5 text-muted-foreground/50" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{s.name}</p>
                <p className="text-[10px] text-muted-foreground capitalize">
                  {[s.tipo, s.vd != null ? `VD ${s.vd}` : null].filter(Boolean).join(" · ")}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
