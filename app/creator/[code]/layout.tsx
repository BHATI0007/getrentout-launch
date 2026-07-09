import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creator Dashboard — RentOut",
  description: "Track your RentOut referrals, sign-ups, and commission in one place.",
  robots: { index: false, follow: false }, // personal dashboards shouldn't be indexed
};

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
