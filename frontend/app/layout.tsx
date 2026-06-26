import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'AI LeadOS — Intelligent Sales Automation',
  description:
    'AI-powered Lead Management, Sales Automation & CRM platform by ProyoTech.',
  keywords: ['CRM', 'AI', 'Lead Management', 'Sales Automation'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
