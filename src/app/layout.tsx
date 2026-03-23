import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';

// Disable new-cap rule for these constants
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
} as const);

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
} as const);

export const metadata: Metadata = {
  title: 'SessioFlow',
  description: 'Call-for-Papers platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className='min-h-full flex flex-col'>{children}</body>
    </html>
  );
}
