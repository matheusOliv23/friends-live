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
          background:
            "linear-gradient(145deg, #09090b 0%, #18181b 50%, #2e1065 100%)",
          color: "#fafafa",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -40,
            width: 420,
            height: 420,
            borderRadius: 999,
            background: "rgba(139, 92, 246, 0.22)",
            filter: "blur(8px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -120,
            left: 80,
            width: 360,
            height: 360,
            borderRadius: 999,
            background: "rgba(239, 68, 68, 0.12)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "rgba(139, 92, 246, 0.18)",
              border: "1px solid rgba(139, 92, 246, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                color: "#a78bfa",
                fontSize: 38,
                fontWeight: 700,
                letterSpacing: "-0.06em",
              }}
            >
              F
            </div>
            <div
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                width: 12,
                height: 12,
                borderRadius: 999,
                background: "#ef4444",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              fontWeight: 650,
              letterSpacing: "-0.02em",
            }}
          >
            {SITE_NAME}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              maxWidth: 920,
              fontSize: 58,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
            }}
          >
            {SITE_TAGLINE}
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: 780,
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
