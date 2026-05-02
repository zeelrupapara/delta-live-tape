import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delta Live Tape",
  description: "Live BTC/ETH market data via Delta Exchange.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
