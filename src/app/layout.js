import { Inter } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/redux/ReduxProvider";
import AuthInit from "@/components/AuthInit";
import LocationInit from "@/components/LocationInit";
import ModalContainer from "@/components/ModalContainer";
import PWARegistration from "@/components/PWARegistration";
import Toast from "@/components/UI/Toast";

import { BRAND, DOMAIN } from "@/lib/config";
import AppWrapper from "@/components/AppWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: {
    default: `${BRAND} – Take Your Local Business Online`,
    template: `%s | ${BRAND}`,
  },
  description: "ShopBajar is a modern digital platform empowering local shops, retailers, and wholesalers to build their online store, manage catalogs, and grow their business with direct WhatsApp integration.",
  metadataBase: new URL(DOMAIN),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: DOMAIN,
    siteName: BRAND,
    locale: "en_IN",
    type: "website",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: BRAND,
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=3", sizes: "any" },
      { url: "/favicon-16x16.png?v=3", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png?v=3", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png?v=3", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png?v=3", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico?v=3" }],
    apple: [{ url: "/apple-touch-icon.png?v=3", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport = {
  themeColor: "#0A0A0F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="font-sans antialiased min-h-screen bg-[#F7F7F5] text-[#0A0A0F]">
        <ReduxProvider>
          <AuthInit />
          <LocationInit />
          <ModalContainer />
          <PWARegistration />
          <AppWrapper>{children}</AppWrapper>
          <Toast />
        </ReduxProvider>
      </body>
    </html>
  );
}
