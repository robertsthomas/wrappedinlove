import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wrapped in Love Co. | Gift Wrapping Service",
  description: "Let us wrap your gifts with love! Gift wrapping service at $35 per 13-gallon bag. Pickup and delivery available. Book your wrapping day today!",
  keywords: ["gift wrapping", "holiday wrapping", "christmas wrapping", "gift wrapping service", "local gift wrapping"],
  authors: [{ name: "Wrapped in Love Co." }],
  openGraph: {
    title: "Wrapped in Love Co. | Gift Wrapping Service",
    description: "Let us wrap your gifts with love! Gift wrapping service at $35 per 13-gallon bag.",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: "Wrapped in Love Co.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Wrapped in Love Co. - Gift Wrapping",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wrapped in Love Co. | Gift Wrapping Service",
    description: "Let us wrap your gifts with love! Gift wrapping service at $35 per 13-gallon bag.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-pattern">
        <Providers>
          {children}
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
