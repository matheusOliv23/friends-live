import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(145deg, #09090b 0%, #18181b 55%, #1f1235 100%)",
          color: "#fafafa",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#8b5cf622",
              border: "1px solid #8b5cf666",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                color: "#8b5cf6",
                fontSize: 34,
                fontWeight: 700,
                letterSpacing: "-0.06em",
              }}
            >
              N
            </div>
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                width: 10,
                height: 10,
                borderRadius: 999,
                background: "#ef4444",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            Friends Stream
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              maxWidth: 900,
              fontSize: 56,
              fontWeight: 650,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            {SITE_TAGLINE}
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: 760,
              fontSize: 26,
              color: "#a1a1aa",
              lineHeight: 1.35,
            }}
          >
            {SITE_DESCRIPTION}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
