import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Airline Executive",
  description: "Build, operate and lead a world-class airline.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
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
