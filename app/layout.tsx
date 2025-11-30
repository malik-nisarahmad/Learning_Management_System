import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'FAST Connect',
  description: 'A modern student community platform',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-[#030712] text-white antialiased selection:bg-indigo-500/30 selection:text-indigo-200" suppressHydrationWarning>
        {/* Background Effects */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-20" />
          
          {/* Animated Orbs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
          <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
