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
  title: "RentOut — Rent out your time. Get paid for it.",
  description: "RentOut is a marketplace where people book your skills by the hour — tutoring, design, coaching, photography and more. Free to join. First 100,000 earners get early access.",
  openGraph: {
    title: "RentOut — Rent out your time. Get paid for it.",
    description: "Sign up now and be among the first to earn. First 100,000 earners get early access.",
    type: "website",
    url: "https://getrentout.me",
    siteName: "RentOut",
  },
  twitter: {
    card: "summary_large_image",
    title: "RentOut — Rent out your time. Get paid for it.",
    description: "Sign up now and be among the first to earn. First 100,000 earners get early access.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
