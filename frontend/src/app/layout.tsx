import type { Metadata } from 'next';
import './globals.css';
import MobileBottomNav from '@/components/MobileBottomNav';

export const metadata: Metadata = {
  title: 'VedaAI Assessment Creator',
  description: 'AI-Powered structured question paper creator and answersheets generator.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <MobileBottomNav />
      </body>
    </html>
  );
}
