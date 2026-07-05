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

const SITE_URL = "https://crazyseal.com";

export const metadata: Metadata = {
  title: {
    default: "Crazy Seal | DIY Roofing Done Right",
    template: "%s | Crazy Seal",
  },
  description:
    "The Crazy Seal Roofing System is a patented, fluid-applied, seamless roofing system for RVs, commercial and residential flat roofs, and transportation vehicles. Backed by a 50 year warranty and shipped straight to your door.",
  keywords:
    "Crazy Seal, DIY roofing, seamless roofing system, silicone roof coating, RV roof, flat roof repair, fluid applied roofing, 50 year warranty",
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Crazy Seal",
    title: "Crazy Seal | DIY Roofing Done Right",
    description:
      "Patented, fluid-applied, seamless roofing system backed by a 50 year warranty. Manufactured in the USA and shipped straight to your door.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crazy Seal | DIY Roofing Done Right",
    description:
      "Patented, fluid-applied, seamless roofing system backed by a 50 year warranty. Manufactured in the USA and shipped straight to your door.",
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
