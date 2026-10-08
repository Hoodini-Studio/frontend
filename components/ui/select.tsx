"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Compact trigger for dense layouts (e.g. table cells). */
  size?: "md" | "sm";
  /** Transparent trigger for inline toolbars. */
  variant?: "field" | "ghost";
  invalid?: boolean;
  "aria-invalid"?: boolean;
  "aria-label"?: string;
};

type MenuPosition = {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  maxHeight: number;
};

const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23a3a3a3' d='M2.5 4.5L6 8l3.5-3.5'/%3E%3C/svg%3E\")";

function joinClass(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function initialHighlight(options: SelectOption[], value: string): number {
  const selectedIndex = options.findIndex((option) => option.value === value);
  if (selectedIndex >= 0) {
    return selectedIndex;
  }
  return options.findIndex((option) => !option.disabled);
}

export function Select({
  id,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  className,
  size = "md",
  variant = "field",
  invalid = false,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
}: SelectProps) {
  const autoId = useId();
  const listboxId = `${autoId}-listbox`;
  const fieldId = id ?? autoId;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [menu, setMenu] = useState<MenuPosition | null>(null);

  const selected = options.find((option) => option.value === value);
  const display = selected?.label ?? placeholder ?? "";
  const isPlaceholder = !selected;
  const showInvalid = invalid || ariaInvalid === true;

  const enabledIndexes = options
    .map((option, index) => (option.disabled ? -1 : index))
    .filter((index) => index >= 0);

  const close = () => {
    setOpen(false);
    setMenu(null);
  };

  const openMenu = () => {
    setHighlight(initialHighlight(options, value));
    setOpen(true);
  };

  const updateMenuPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const gap = 8;
    const minWidth = variant === "ghost" ? 160 : rect.width;
    const width = Math.max(rect.width, minWidth);
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const spaceAbove = rect.top - gap;
    const preferredMax = 280;
    const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;
    const maxHeight = Math.min(preferredMax, openUp ? spaceAbove : spaceBelow);
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);

    setMenu(
      openUp
        ? {
            bottom: window.innerHeight - rect.top + gap,
            left,
            width,
            maxHeight: Math.max(120, maxHeight),
          }
        : {
            top: rect.bottom + gap,
            left,
            width,
            maxHeight: Math.max(120, maxHeight),
          },
    );
  };

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    updateMenuPosition();

    const onScrollOrResize = () => updateMenuPosition();
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);

    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
    // Position listeners only while open; options/value used via openMenu highlight.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- remeasure when opened
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) {
        return;
      }
      if (document.getElementById(listboxId)?.contains(target)) {
        return;
      }
      close();
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, listboxId]);

  useEffect(() => {
    if (!open || highlight < 0) {
      return;
    }
    optionRefs.current[highlight]?.scrollIntoView({ block: "nearest" });
  }, [open, highlight]);

  const choose = (next: string) => {
    onChange(next);
    close();
    triggerRef.current?.focus();
  };

  const moveHighlight = (delta: number) => {
    if (enabledIndexes.length === 0) {
      return;
    }
    const currentPos = enabledIndexes.indexOf(highlight);
    const nextPos =
      currentPos < 0
        ? delta > 0
          ? 0
          : enabledIndexes.length - 1
        : (currentPos + delta + enabledIndexes.length) % enabledIndexes.length;
    setHighlight(enabledIndexes[nextPos]!);
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      moveHighlight(event.key === "ArrowDown" ? 1 : -1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      const option = options[highlight];
      if (option && !option.disabled) {
        choose(option.value);
      }
      return;
    }

    if (event.key === "Home" && open) {
      event.preventDefault();
      setHighlight(enabledIndexes[0] ?? -1);
      return;
    }

    if (event.key === "End" && open) {
      event.preventDefault();
      setHighlight(enabledIndexes[enabledIndexes.length - 1] ?? -1);
    }
  };

  const triggerClass = joinClass(
    "flex w-full items-center justify-between text-left outline-none transition disabled:cursor-not-allowed disabled:opacity-60",
    variant === "ghost"
      ? "border-0 bg-transparent py-1 pr-5 text-sm text-foreground"
      : size === "sm"
        ? "rounded-lg border bg-black/40 px-2 py-1.5 text-sm"
        : "rounded-xl border bg-black/40 px-4 py-3 text-sm",
    variant === "field" &&
      (showInvalid
        ? "border-red-300/50 focus:border-red-300/70"
        : "border-white/10 hover:border-white/20 focus:border-white/30"),
  );

  const menuStyle: CSSProperties | undefined = menu
    ? {
        position: "fixed",
        top: menu.top,
        bottom: menu.bottom,
        left: menu.left,
        width: menu.width,
        maxHeight: menu.maxHeight,
        zIndex: 60,
      }
    : undefined;

  return (
    <div
      ref={rootRef}
      className={joinClass(
        variant === "ghost" ? "relative inline-flex min-w-0" : "relative w-full",
        className,
      )}
    >
      <button
        ref={triggerRef}
        id={fieldId}
        type="button"
        role="combobox"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-invalid={showInvalid || undefined}
        aria-label={ariaLabel}
        onClick={() => {
          if (disabled) {
            return;
          }
          if (open) {
            close();
          } else {
            openMenu();
          }
        }}
        onKeyDown={onTriggerKeyDown}
        className={triggerClass}
        style={
          variant === "ghost"
            ? {
                backgroundImage: CHEVRON,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right center",
              }
            : undefined
        }
      >
        <span
          className={joinClass(
            "truncate",
            isPlaceholder ? "text-muted" : "text-foreground",
          )}
        >
          {display}
        </span>
        {variant === "field" ? (
          <span aria-hidden className="ml-2 shrink-0 text-muted">
            ▾
          </span>
        ) : null}
      </button>

      {open && menu ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={fieldId}
          style={menuStyle}
          className="overflow-auto rounded-2xl border border-white/10 bg-[#121212] py-1.5 shadow-xl"
        >
          {options.map((option, index) => {
            const isActive = option.value === value;
            const isHighlighted = index === highlight;

            return (
              <li key={`${option.value}-${index}`} role="presentation">
                <button
                  ref={(node) => {
                    optionRefs.current[index] = node;
                  }}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  disabled={option.disabled}
                  onMouseEnter={() => {
                    if (!option.disabled) {
                      setHighlight(index);
                    }
                  }}
                  onClick={() => {
                    if (!option.disabled) {
                      choose(option.value);
                    }
                  }}
                  className={joinClass(
                    "flex w-full items-center px-3 py-2 text-left text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-40",
                    isHighlighted ? "bg-white/10 text-foreground" : "text-foreground/90",
                    isActive && "font-medium",
                  )}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
