import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'fy_fire — FIRE Calculator UK',
  description:
    'Calculate your Financial Independence, Retire Early (FIRE) number. A free UK-focused FIRE planning tool.',
  keywords: ['FIRE', 'financial independence', 'retire early', 'UK', 'ISA', 'pension', 'calculator'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'fy_fire',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'fy_fire — FIRE Calculator UK',
    description: 'Calculate your UK FIRE number and projected retirement date.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* PWA / iOS meta tags */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        {/* ── Main Content ── */}
        <main className="mx-auto max-w-2xl">{children}</main>

        {/* Service Worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
