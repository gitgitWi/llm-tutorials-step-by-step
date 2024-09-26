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
    <html
      lang="ko"
      className={cn(GeistMono.variable, 'antialiased', 'h-screen')}
    >
      <body className="flex flex-col justify-between min-h-screen pt-4 bg-neutral-100">
        <div className="flex flex-col w-full max-w-2xl p-4 mx-auto bg-white border rounded-lg border-3 border-neutral-200 h-max">
          {children}
        </div>

        <footer className="flex items-end justify-start w-full max-w-2xl gap-1 px-2 pt-2 mx-auto mt-2 bg-white border rounded-lg rounded-b-none border-neutral-100">
          <a
            href="https://github.com/gitgitWi/llm-tutorials-step-by-step"
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-end gap-1 text-sm text-neutral-500 hover:underline"
          >
            <GitHubLogoIcon />
          </a>
        </footer>
      </body>
    </html>
  );
}
