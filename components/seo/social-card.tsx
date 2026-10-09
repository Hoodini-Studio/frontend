import { ImageResponse } from "next/og";

export const socialCardSize = { width: 1200, height: 630 };
export const socialCardContentType = "image/png";
export const socialCardAlt = "Hoodini Studio";

const starPath =
  "M100 2 L104.21 89.837 L139.598 60.402 L110.163 95.79 L198 100 L110.163 104.21 L139.598 139.598 L104.21 110.163 L100 198 L95.79 110.163 L60.402 139.598 L89.837 104.21 L2 100 L89.837 95.79 L60.402 60.402 L95.79 89.837 Z";

/** Default share image. Uses the real star mark and site name only. */
export function socialCardImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0b",
          color: "#f4f1ea",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg width="72" height="72" viewBox="0 0 200 200">
            <path fill="#f4f1ea" d={starPath} />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: -1 }}>
            Hoodini Studio
          </div>
          <div style={{ marginTop: 16, fontSize: 32, color: "#b9b3a8" }}>
            Wear the night.
          </div>
        </div>
      </div>
    ),
    { ...socialCardSize },
  );
}
