import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: "#09090b",
          borderRadius: 40,
          border: "3px solid #8b5cf666",
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#8b5cf6",
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.06em",
          }}
        >
          F
        </div>
        <div
          style={{
            position: "absolute",
            top: 28,
            right: 28,
            width: 22,
            height: 22,
            borderRadius: 999,
            background: "#ef4444",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
