"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
      <ScrollToTopButton />
      <Toaster
        position="top-center"
        dir="rtl"
        richColors
        toastOptions={{
          style: { fontFamily: "var(--font-body)" },
        }}
      />
    </ThemeProvider>
  );
}
