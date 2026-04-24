import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthContextProvider } from "@/context/AuthContext";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "ShopSetu - Your Shop's Digital Presence",
  description:
    "Create a digital shop page and connect with customers via WhatsApp.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full`}>
      <body className="font-sans antialiased min-h-screen bg-cream text-navy">
        <AuthContextProvider>{children}</AuthContextProvider>
      </body>
    </html>
  );
}
