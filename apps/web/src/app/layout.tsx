import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/lib/context/LanguageContext";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-headline",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OmniDoc | Clinical Operating System",
  description:
    "The sovereign operating system for clinical growth. AI-powered scheduling, smart triage, and HIPAA-compliant healthcare management.",
  keywords: [
    "medical software",
    "healthcare management",
    "appointment scheduling",
    "clinic management",
    "HIPAA compliant",
    "medical SaaS",
  ],
  authors: [{ name: "OmniDoc Clinical Systems" }],
  openGraph: {
    title: "OmniDoc | Clinical Operating System",
    description:
      "The sovereign operating system for clinical growth. AI-powered scheduling and smart healthcare management.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${inter.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
