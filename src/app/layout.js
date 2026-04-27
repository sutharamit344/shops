import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/redux/ReduxProvider";
import AuthInit from "@/components/AuthInit";
import ModalContainer from "@/components/ModalContainer";
import PWARegistration from "@/components/PWARegistration";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "ShopSetu - Your Shop's Digital Presence",
  description:
    "Create a digital shop page and connect with customers via WhatsApp.",
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
          <ModalContainer />
          <PWARegistration />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
