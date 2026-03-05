import "./globals.css";
import { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";

export const metadata = {
  title: "JanRakshak Ai",
  description:
    "AI-powered civic misinformation protection for citizens and governments."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen gradient-bg">
        <div className="relative min-h-screen">
          <div className="pointer-events-none absolute inset-0">
            <div className="glow-ring absolute -top-32 -left-24 h-80 w-80 rounded-full opacity-60" />
            <div className="glow-ring absolute -bottom-24 -right-24 h-96 w-96 rounded-full opacity-40" />
          </div>
          <div className="relative z-10 flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 px-6 pb-16 pt-8 md:px-12 lg:px-24">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}

