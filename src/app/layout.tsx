import { GitHubLogoIcon } from '@radix-ui/react-icons';
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
      <body className="bg-neutral-100 pt-4 h-full">
        <div className="flex flex-col border-3 border-neutral-200 bg-white mx-auto p-4 border rounded-lg max-w-2xl">
          {children}
        </div>

        <footer className="flex justify-start items-center gap-1 border-neutral-100 bg-white mx-auto mt-2 px-2 pt-2 border rounded-b-none rounded-lg max-w-2xl">
          <a
            href="https://github.com/gitgitWi/llm-tutorials-step-by-step"
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-1 text-neutral-500 text-sm hover:underline"
          >
            <GitHubLogoIcon />
          </a>
        </footer>
      </body>
    </html>
  );
}
