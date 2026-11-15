import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          background: "#18181b",
          borderRadius: 8,
          border: "1px solid #8b5cf655",
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#8b5cf6",
            fontSize: 18,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.04em",
          }}
        >
          N
        </div>
        <div
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            width: 5,
            height: 5,
            borderRadius: 999,
            background: "#ef4444",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
