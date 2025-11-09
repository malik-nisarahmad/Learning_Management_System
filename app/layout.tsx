import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Reddit - Student App',
  description: 'A student community app',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
        {children}
      </body>
    </html>
  );
}
