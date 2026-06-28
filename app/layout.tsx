import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RentOut — Coming Soon",
  description: "Something big is happening. Not everyone gets in first.",
  openGraph: {
    title: "RentOut — Coming Soon",
    description: "Something big is happening. Not everyone gets in first.",
    type: "website",
    url: "https://getrentout.me",
  },
  twitter: {
    card: "summary_large_image",
    title: "RentOut — Coming Soon",
    description: "Something big is happening. Not everyone gets in first.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
