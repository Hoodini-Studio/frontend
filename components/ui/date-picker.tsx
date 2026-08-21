"use client";

import { useEffect, useId, useRef, useState } from "react";

type DateTimePickerProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  clearLabel?: string;
  doneLabel?: string;
  timeLabel?: string;
  /** Used when a date is picked and no time is set yet. */
  defaultTime?: string;
};

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

type ParsedDateTime = {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
};

function parseDateTimeValue(value: string): ParsedDateTime | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hours = Number(match[4]);
  const minutes = Number(match[5]);
  const date = new Date(year, month - 1, day, hours, minutes);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hours ||
    date.getMinutes() !== minutes
  ) {
    return null;
  }

  return { year, month, day, hours, minutes };
}

function formatDatePart(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatTimePart(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function toDateTimeValue(
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
): string {
  return `${formatDatePart(year, month, day)}T${formatTimePart(hours, minutes)}`;
}

function parseDefaultTime(defaultTime: string): { hours: number; minutes: number } {
  const match = defaultTime.match(/^(\d{2}):(\d{2})$/);
  if (!match) {
    return { hours: 0, minutes: 0 };
  }
  return { hours: Number(match[1]), minutes: Number(match[2]) };
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function sameDay(
  a: { year: number; month: number; day: number },
  b: { year: number; month: number; day: number },
): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

function buildCalendarDays(month: Date): Array<Date | null> {
  const first = startOfMonth(month);
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const startOffset = (first.getDay() + 6) % 7;
  const cells: Array<Date | null> = [];

  for (let i = 0; i < startOffset; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(first.getFullYear(), first.getMonth(), day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export function DateTimePicker({
  id,
  value,
  onChange,
  placeholder = "Select date & time",
  clearLabel = "Clear",
  doneLabel = "Done",
  timeLabel = "Time",
  defaultTime = "00:00",
}: DateTimePickerProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selected = parseDateTimeValue(value);
  const fallbackTime = parseDefaultTime(defaultTime);
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(
      selected
        ? new Date(selected.year, selected.month - 1, selected.day)
        : new Date(),
    ),
  );
  const [draftDate, setDraftDate] = useState<{
    year: number;
    month: number;
    day: number;
  } | null>(
    selected
      ? { year: selected.year, month: selected.month, day: selected.day }
      : null,
  );
  const [draftTime, setDraftTime] = useState(
    selected
      ? formatTimePart(selected.hours, selected.minutes)
      : defaultTime,
  );

  const syncDraftFromValue = () => {
    const current = parseDateTimeValue(value);
    if (current) {
      setVisibleMonth(
        startOfMonth(new Date(current.year, current.month - 1, current.day)),
      );
      setDraftDate({
        year: current.year,
        month: current.month,
        day: current.day,
      });
      setDraftTime(formatTimePart(current.hours, current.minutes));
      return;
    }

    setDraftDate(null);
    setDraftTime(defaultTime);
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const today = new Date();
  const todayParts = {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
  };
  const cells = buildCalendarDays(visibleMonth);
  const monthLabel = visibleMonth.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  const display = selected
    ? new Date(
        selected.year,
        selected.month - 1,
        selected.day,
        selected.hours,
        selected.minutes,
      ).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : placeholder;

  const commit = (nextDate: { year: number; month: number; day: number }, time: string) => {
    const parsedTime = parseDefaultTime(time);
    onChange(
      toDateTimeValue(
        nextDate.year,
        nextDate.month,
        nextDate.day,
        parsedTime.hours,
        parsedTime.minutes,
      ),
    );
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        id={fieldId}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (!open) {
            syncDraftFromValue();
          }
          setOpen((current) => !current);
        }}
        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-left text-sm outline-none transition hover:border-white/20 focus:border-white/30"
      >
        <span className={selected ? "text-foreground" : "text-muted"}>{display}</span>
        <span aria-hidden className="text-muted">
          ▾
        </span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={monthLabel}
          className="absolute z-30 mt-2 w-full min-w-70 rounded-2xl border border-white/10 bg-[#121212] p-3 shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
              className="rounded-lg px-2 py-1 text-sm text-muted transition hover:bg-white/5 hover:text-foreground"
            >
              ‹
            </button>
            <p className="text-sm font-medium text-foreground">{monthLabel}</p>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
              className="rounded-lg px-2 py-1 text-sm text-muted transition hover:bg-white/5 hover:text-foreground"
            >
              ›
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((day) => (
              <span
                key={day}
                className="py-1 text-center text-[11px] uppercase tracking-wide text-muted"
              >
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, index) => {
              if (!day) {
                return <span key={`empty-${index}`} className="h-9" />;
              }

              const parts = {
                year: day.getFullYear(),
                month: day.getMonth() + 1,
                day: day.getDate(),
              };
              const isSelected = draftDate ? sameDay(parts, draftDate) : false;
              const isToday = sameDay(parts, todayParts);

              return (
                <button
                  key={formatDatePart(parts.year, parts.month, parts.day)}
                  type="button"
                  onClick={() => {
                    setDraftDate(parts);
                    const time = draftTime || formatTimePart(fallbackTime.hours, fallbackTime.minutes);
                    setDraftTime(time);
                    commit(parts, time);
                  }}
                  className={`h-9 rounded-lg text-sm transition ${
                    isSelected
                      ? "bg-foreground text-background"
                      : isToday
                        ? "border border-white/25 text-foreground hover:bg-white/10"
                        : "text-foreground hover:bg-white/10"
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 border-t border-white/10 pt-3">
            <label className="mb-2 block text-xs text-muted" htmlFor={`${fieldId}-time`}>
              {timeLabel}
            </label>
            <input
              id={`${fieldId}-time`}
              type="time"
              value={draftTime}
              onChange={(event) => {
                const nextTime = event.target.value || defaultTime;
                setDraftTime(nextTime);
                if (draftDate) {
                  commit(draftDate, nextTime);
                }
              }}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-foreground outline-none focus:border-white/30"
            />
          </div>

          <div className="mt-3 flex gap-2">
            {value ? (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setDraftDate(null);
                  setDraftTime(defaultTime);
                  setOpen(false);
                }}
                className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-sm text-muted transition hover:border-white/20 hover:text-foreground"
              >
                {clearLabel}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground transition hover:bg-white/10"
            >
              {doneLabel}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
