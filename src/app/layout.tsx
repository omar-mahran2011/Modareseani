import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/layout/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SITE_NAME } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://modareseani.vercel.app"),
  title: {
    default: `${SITE_NAME} | ابحث عن معلمك الخصوصي بسهولة`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Modareseani يساعدك على إيجاد أفضل المعلمين الخصوصيين في محافظتك ومدينتك، مع تقييمات حقيقية من الطلاب وأولياء الأمور.",
  openGraph: {
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ابحث عن معلمك الخصوصي بسهولة`,
    description:
      "Modareseani يساعدك على إيجاد أفضل المعلمين الخصوصيين في محافظتك ومدينتك، مع تقييمات حقيقية من الطلاب وأولياء الأمور.",
    locale: "ar_EG",
    type: "website",
  },
  verification: {
    // Set GOOGLE_SITE_VERIFICATION in your environment variables (the code
    // Google Search Console gives you when you choose the "HTML tag"
    // verification method) — no code changes or file uploads needed.
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf5ff" },
    { media: "(prefers-color-scheme: dark)", color: "#1e1030" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- root layout applies these globally */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-body antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
