import type { Metadata } from "next";
import { Inter, Space_Grotesk, Anek_Telugu } from "next/font/google";
import "./globals.css";
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const anekTelugu = Anek_Telugu({
  variable: "--font-anek-telugu",
  subsets: ["telugu", "latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://punadi.com"),
  title: "Punadi — Every Rupee. Every Brick.",
  description:
    "Track your house construction expenses, materials, and progress. Built for Indian homeowners. పునాది — the foundation your home deserves.",
  keywords: [
    "construction tracker",
    "house building app",
    "construction expense tracker India",
    "home construction",
    "building materials tracker",
    "Punadi",
    "పునాది",
  ],
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Punadi — Every Rupee. Every Brick.",
    description:
      "Track your house construction expenses, materials, and progress. Built for Indian homeowners.",
    url: "https://punadi.com",
    siteName: "Punadi",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Punadi — Every Rupee. Every Brick.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Punadi — Every Rupee. Every Brick.",
    description:
      "Track your house construction expenses, materials, and progress. Built for Indian homeowners.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${anekTelugu.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
