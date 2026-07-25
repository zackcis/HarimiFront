import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import { CartProvider } from '@/lib/cart';
import { QuickLookProvider } from '@/components/QuickLook';
import { SITE_NAME, siteDescription, siteUrl } from '@/lib/seo';
import './globals.css';

const serif = Cormorant_Garamond({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const sans = Manrope({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: siteDescription('it'),
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'it_IT',
    title: SITE_NAME,
    description: siteDescription('it'),
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: siteDescription('it'),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="it"
      data-scroll-behavior="smooth"
      className={`${serif.variable} ${sans.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <CartProvider>
          <QuickLookProvider>{children}</QuickLookProvider>
        </CartProvider>
      </body>
    </html>
  );
}
