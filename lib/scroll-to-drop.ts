const DROP_ID = "the-drop";

/** Sticky header offset (~4.5rem) — treat as settled when close to that band. */
function isDropNearView(el: HTMLElement): boolean {
  const top = el.getBoundingClientRect().top;
  return top >= -24 && top <= 140;
}

/**
 * Smooth-scroll to #the-drop, then run `then` once motion settles.
 * When already near the section (discovery rail), `then` runs immediately
 * so filters can update without waiting on a no-op scroll.
 */
export function scrollToTheDrop(then?: () => void): void {
  const el = document.getElementById(DROP_ID);
  if (!el) {
    then?.();
    return;
  }

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (isDropNearView(el) || prefersReduced) {
    if (!isDropNearView(el)) {
      el.scrollIntoView({ behavior: "auto", block: "start" });
    }
    then?.();
    return;
  }

  let settled = false;
  const finish = () => {
    if (settled) {
      return;
    }
    settled = true;
    window.removeEventListener("scrollend", finish);
    window.clearTimeout(fallbackTimer);
    then?.();
  };

  window.addEventListener("scrollend", finish, { once: true });
  const fallbackTimer = window.setTimeout(finish, 850);

  el.scrollIntoView({ behavior: "smooth", block: "start" });
}
