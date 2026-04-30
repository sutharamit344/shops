import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/redux/ReduxProvider";
import AuthInit from "@/components/AuthInit";
import LocationInit from "@/components/LocationInit";
import ModalContainer from "@/components/ModalContainer";
import PWARegistration from "@/components/PWARegistration";

import { BRAND, DOMAIN } from "@/lib/config";

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
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
