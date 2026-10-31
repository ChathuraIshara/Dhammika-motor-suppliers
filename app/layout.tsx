import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { InventoryProvider } from "@/context/InventoryContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#4361EE",
};

export const metadata: Metadata = {
  title: "Dhammika Motor Suppliers | Auto Parts Catalog",
  description:
    "Mobile-first digital spare parts catalog for vehicle repair shops and motor mechanics in Sri Lanka.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F4F6FA] text-gray-900 font-sans selection:bg-[#4361EE] selection:text-white">
        <InventoryProvider>{children}</InventoryProvider>
      </body>
    </html>
  );
}
