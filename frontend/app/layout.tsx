import type { Metadata } from 'next';
import { Inter, Outfit, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });

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
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          themes={['dark', 'light']}
        >
          {children}
          <Toaster 
            position="bottom-right"
            toastOptions={{
              className: 'dark:bg-slate-900 dark:text-white dark:border dark:border-slate-800',
              style: {
                background: '#ffffff',
                color: '#1e293b',
              }
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
