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
			<body>{children}</body>
		</html>
	);
}
