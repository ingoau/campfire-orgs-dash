import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campfire Canberra Participants Dashboard",
  description: "Authenticated dashboard for Cockpit participants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
