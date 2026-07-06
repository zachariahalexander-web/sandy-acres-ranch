import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { getCurrentProfile } from "@/lib/dal";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const lato = Lato({
  variable: "--font-lato",
  weight: ["400", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sandy Acres Ranch | Punta Gorda, Florida",
  description:
    "Sandy Acres Ranch is a private guest ranch in Punta Gorda, Florida, est. 1989. Two guest houses, pickleball courts, a gym and yoga studio, and wide-open Florida scenery.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCurrentProfile();

  return (
    <html lang="en" className={`${playfair.variable} ${lato.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <SiteHeader profile={profile} />
        <main className="flex-1">{children}</main>
        <SiteFooter profile={profile} />
      </body>
    </html>
  );
}
