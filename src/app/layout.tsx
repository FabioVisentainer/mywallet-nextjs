import type { Metadata } from "next";
import { Manrope, Azeret_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/AppProviders";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const azeretMono = Azeret_Mono({
  variable: "--font-azeret-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "MyWallet",
  description: "Every asset you own, in one balance sheet.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} ${azeretMono.variable} h-full antialiased`}>
      <body className="min-h-full font-sans text-[var(--color-text)] bg-[var(--color-surface)]">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
