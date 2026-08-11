import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/constants";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #3B1774 0%, #6D28D9 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(236,190,91,0.35) 0%, rgba(236,190,91,0) 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 24,
            background: "#ECBE5B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3L2 8l10 5 8-4.2V16h1.5V8L12 3z" fill="#3B1774" />
            <path d="M6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5l-6 3.15-6-3.15z" fill="#3B1774" />
          </svg>
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, color: "#fff", display: "flex" }}>
          {SITE_NAME}
        </div>
        <div style={{ fontSize: 28, color: "#dbe2ec", marginTop: 16, display: "flex" }}>
          ابحث عن معلمك الخصوصي في محافظتك ومدينتك
        </div>
      </div>
    ),
    { ...size }
  );
}
