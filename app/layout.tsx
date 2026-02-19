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
        {/* ── Sticky Header ── */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex h-14 max-w-2xl items-center px-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight">fy_fire</span>
              <span className="hidden text-sm text-muted-foreground sm:block">
                FIRE Calculator UK
              </span>
            </div>
          </div>
        </header>

        {/* ── Main Content ── */}
        <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>

        {/* ── Footer Disclaimer ── */}
        <footer className="mt-auto border-t">
          <div className="mx-auto max-w-2xl px-4 py-6">
            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              <strong>Not financial advice.</strong> fy_fire is an educational tool to help you
              explore FIRE concepts. All calculations use simplified assumptions and past returns do
              not guarantee future results. Please consult a qualified financial adviser before
              making investment decisions.
            </p>
          </div>
        </footer>

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
