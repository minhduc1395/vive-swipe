import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Playfair_Display } from "next/font/google";
import "./globals.css";
import { KhoiTaoSupabase } from "@/components/KhoiTaoSupabase";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
  preload: false,
});

const playfairDisplay = Playfair_Display({
  subsets: ["vietnamese", "latin"],
  weight: ["500"],
  style: ["italic"],
  variable: "--font-playfair",
  display: "swap",
  preload: false,
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ngonNgu = await getLocale();
  return (
    <html lang={ngonNgu}>
      <body className="font-sans antialiased bg-trang text-den">
        <KhoiTaoSupabase
          fontClasses={[beVietnamPro.variable, playfairDisplay.variable]}
        />
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
