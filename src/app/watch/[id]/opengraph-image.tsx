import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const alt = `Convite para assistir no ${SITE_NAME}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function WatchOpenGraphImage() {
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
            "linear-gradient(150deg, #09090b 0%, #121214 45%, #2e1065 100%)",
          color: "#fafafa",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 85% 20%, rgba(139,92,246,0.35), transparent 42%)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
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
                  fontSize: 34,
                  fontWeight: 700,
                }}
              >
                F
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
            <div style={{ display: "flex", fontSize: 28, fontWeight: 650 }}>
              {SITE_NAME}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderRadius: 999,
              border: "1px solid rgba(239, 68, 68, 0.45)",
              background: "rgba(239, 68, 68, 0.15)",
              padding: "10px 18px",
              fontSize: 20,
              fontWeight: 650,
              color: "#fecaca",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: "#ef4444",
              }}
            />
            AO VIVO
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              maxWidth: 900,
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            Seu amigo compartilhou a tela com você
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: 720,
              fontSize: 26,
              color: "#a1a1aa",
              lineHeight: 1.35,
            }}
          >
            Abra o link para assistir a transmissão em tempo real.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
