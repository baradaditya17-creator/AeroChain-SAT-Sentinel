import React from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Saturn Aerospace & Cyber Defense Station",
  description: "An interactive mission control dashboard monitoring on-chain data links, satellite orbital defenses, and aerospace cybersecurity vectors across the Saturn system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-[#02040a] min-h-screen">
        {children}
      </body>
    </html>
  );
}
