import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat, Urbanist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/navbar";

// Font for headings
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

// Font for body/paragraphs
const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    template: "JobNest | %s",
    default: "JobNest | Find Your Dream Job",
  },
  description: "JobNest is a modern platform connecting talented professionals with top companies. Explore jobs, build your career, and find the perfect match.",
  keywords: ["jobs", "hiring", "careers", "tech jobs", "remote work", "JobNest"],
  authors: [{ name: "JobNest Team" }],
  openGraph: {
    title: "JobNest | Find Your Dream Job",
    description: "JobNest is a modern platform connecting talented professionals with top companies.",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://jobnest.vercel.app",
    siteName: "JobNest",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JobNest | Find Your Dream Job",
    description: "JobNest is a modern platform connecting talented professionals with top companies.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${urbanist.variable} font-sans antialiased`}
      >
        <Navbar />
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}