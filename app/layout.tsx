import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Playfair_Display } from "next/font/google";
import "./globals.css";
import { KhoiTaoSupabase } from "@/components/KhoiTaoSupabase";
import { DuLieuProvider } from "@/lib/du-lieu-context";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["vietnamese", "latin"],
  weight: ["500"],
  style: ["italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VIVE Quẹt · K-Beauty Experience",
  description:
    "Quẹt phải món hợp da, khám phá mỹ phẩm nội địa Hàn và nhận deal tại VIVE.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${playfairDisplay.variable}`}>
      <body className="font-sans antialiased bg-trang text-den">
        <KhoiTaoSupabase />
        <DuLieuProvider>{children}</DuLieuProvider>
      </body>
    </html>
  );
}
