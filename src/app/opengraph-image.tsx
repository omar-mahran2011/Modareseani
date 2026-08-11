import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Deliberately no Arabic (or any) text here: Satori (the renderer behind
// next/og) has incomplete support for certain Arabic contextual-shaping
// OpenType features, which can crash the build on some hosts even when it
// works locally. The image stays purely graphical; the actual site name and
// description still appear in link previews via the separate og:title /
// og:description meta tags generated from layout.tsx's `metadata` export.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #3B1774 0%, #6D28D9 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -140,
            right: -140,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(236,190,91,0.35) 0%, rgba(236,190,91,0) 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: -160,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(34,197,94,0.25) 0%, rgba(34,197,94,0) 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: 48,
            background: "#ECBE5B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          }}
        >
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3L2 8l10 5 8-4.2V16h1.5V8L12 3z" fill="#3B1774" />
            <path d="M6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5l-6 3.15-6-3.15z" fill="#3B1774" />
          </svg>
        </div>
      </div>
    ),
    { ...size }
  );
}
