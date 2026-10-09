"use client";

import { useRef, type CSSProperties, type RefObject } from "react";

export type HomeLayerPin = "always" | "never";

type UseHomeLayerOptions = {
  /** Stacking order — later homepage layers must be higher. */
  z: number;
  /**
   * `always` — sticky pin (hero only). Later flow sections slide over it.
   * `never` — normal document flow (packs / drop / collections). Avoids
   * reload glitches from measuring async content for sticky vs flow.
   */
  pin?: HomeLayerPin;
};

type HomeLayerAttrs = {
  className: string;
  style: CSSProperties;
  "data-stack": "pin" | "flow";
};

/**
 * Homepage stack helpers. Only the hero pins; content sections stay in flow
 * so async pack/product loads cannot flip sticky state mid-scroll.
 *
 * Ref is returned separately so attrs can be spread during render without
 * tripping react-hooks/refs (object-containing-ref access).
 */
export function useHomeLayer({
  z,
  pin = "never",
}: UseHomeLayerOptions): [RefObject<HTMLElement | null>, HomeLayerAttrs] {
  const ref = useRef<HTMLElement | null>(null);
  const stack = pin === "always" ? "pin" : "flow";

  return [
    ref,
    {
      className: "home-layer",
      style: { zIndex: z },
      "data-stack": stack,
    },
  ];
}
