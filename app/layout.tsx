import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RentOut — Hire anyone. For anything.",
  description: "The first marketplace where anyone can offer any service — on their own terms, at their own price. Founding providers keep 100% forever.",
  openGraph: {
    title: "RentOut — Hire anyone. For anything.",
    description: "The first marketplace where anyone can offer any service — on their own terms, at their own price.",
    type: "website",
    url: "https://getrentout.me",
  },
  twitter: {
    card: "summary_large_image",
    title: "RentOut — Hire anyone. For anything.",
    description: "The first marketplace where anyone can offer any service — on their own terms.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
