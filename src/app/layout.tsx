import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";
import { GlobalLayout } from "@/components/layout/GlobalLayout";
import { TrackingProvider, MetaPixel } from "@/components/tracking";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const SITE_URL = "https://rv-armor.com";

export const metadata: Metadata = {
  title: {
    default: "RV Armor - The Last Roof Your RV Will Ever Need",
    template: "%s | RV Armor",
  },
  description:
    "RV Armor provides a permanent, seamless roofing membrane for all RV types. Lifetime warranty, nationwide mobile service. Starting at $175/linear foot.",
  keywords:
    "RV roof, RV roofing, RV roof coating, RV roof replacement, lifetime warranty, mobile RV service, RV Armor",
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "RV Armor",
    title: "RV Armor - The Last Roof Your RV Will Ever Need",
    description:
      "Permanent, seamless RV roofing membrane with a lifetime warranty. Nationwide mobile service for all RV types.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RV Armor - The Last Roof Your RV Will Ever Need",
    description:
      "Permanent, seamless RV roofing membrane with a lifetime warranty. Nationwide mobile service.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {process.env.NEXT_PUBLIC_GTM_ID && (
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
      )}
      <body className={`${inter.variable} font-sans antialiased`}>
        <MetaPixel />
        <TrackingProvider>
          <GlobalLayout>{children}</GlobalLayout>
        </TrackingProvider>
      </body>
    </html>
  );
}
