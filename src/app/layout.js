import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/redux/ReduxProvider";
import AuthInit from "@/components/AuthInit";
import LocationInit from "@/components/LocationInit";
import ModalContainer from "@/components/ModalContainer";
import PWARegistration from "@/components/PWARegistration";
import Toast from "@/components/UI/Toast";

import { BRAND, DOMAIN } from "@/lib/config";
import AppWrapper from "@/components/AppWrapper";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: {
    default: `${BRAND} – Discover Local Shops`,
    template: `%s | ${BRAND}`,
  },
  description: "Find shops, services, and businesses near you",
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full`}>
      <body className="font-sans antialiased min-h-screen bg-cream text-navy">
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
