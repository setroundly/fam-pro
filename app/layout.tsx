import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, RocknRoll_One, Slackside_One } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/branding";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rockDisplay = RocknRoll_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-rock",
  display: "swap",
});

const jaggedDisplay = Slackside_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-jagged",
  display: "swap",
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${rockDisplay.variable} ${jaggedDisplay.variable} font-sans`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
