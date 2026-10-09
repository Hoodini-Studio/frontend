"use client";

import { useEffect } from "react";

/** Marks the document after React has hydrated so end-to-end tests can wait before clicking. */
export function HydrationMarker() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
  }, []);

  return null;
}
