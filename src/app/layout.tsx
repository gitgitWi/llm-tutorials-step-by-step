import { GeistMono } from 'geist/font/mono';
import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

import { cn } from '~/lib/utils';
import './globals.css';

export const metadata: Metadata = {
  title: 'LLM Step-by-Step',
  description: 'Tutorial for building LLM apps',
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ko" className={cn(GeistMono.variable, 'antialiased')}>
      <body className="p-4 bg-neutral-100">
        <div className="flex flex-col max-w-2xl p-4 mx-auto bg-white border rounded-lg border-3 border-neutral-200">
          {children}
        </div>
      </body>
    </html>
  );
}
