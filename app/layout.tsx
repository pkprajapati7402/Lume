import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'sonner';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Lume - Global Payroll at the Speed of Light",
    template: "%s | Lume"
  },
  description: "Pay your international team in seconds with 90% lower fees using Stellar blockchain. Instant FX conversion, bulk payments, and direct off-ramps for global payroll.",
  keywords: [
    "global payroll",
    "international payments",
    "stellar blockchain",
    "cryptocurrency payments",
    "cross-border payments",
    "remittance",
    "bulk payments",
    "instant settlement",
    "low fee transfers",
    "stellar lumens",
    "XLM",
    "USDC payments"
  ],
  authors: [{ name: "Lume" }],
  creator: "Lume",
  publisher: "Lume",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://lume.pay'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Lume - Global Payroll at the Speed of Light",
    description: "Pay your international team in seconds with 90% lower fees using Stellar blockchain. Instant settlements and transparent pricing.",
    url: 'https://lume.pay',
    siteName: 'Lume',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lume - Global Payroll Platform',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lume - Global Payroll at the Speed of Light',
    description: 'Pay your international team in seconds with 90% lower fees using Stellar blockchain.',
    images: ['/og-image.png'],
    creator: '@lumepay',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#a855f7' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Lume',
    applicationCategory: 'FinanceApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    operatingSystem: 'Web',
    description: 'Global payroll platform built on Stellar blockchain. Pay your international team in seconds with 90% lower fees.',
    url: 'https://lume.pay',
    featureList: [
      'Individual Payouts',
      'Bulk Payments',
      'Real-time FX Rates',
      'Instant Settlements',
      '1% Transaction Fee'
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster 
          position="top-right" 
          richColors 
          closeButton
          toastOptions={{
            style: {
              background: 'rgb(30 41 59)',
              border: '1px solid rgb(71 85 105)',
              color: 'rgb(226 232 240)',
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
