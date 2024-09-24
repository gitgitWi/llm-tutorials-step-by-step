import { Noto_Sans_KR, Noto_Serif_KR } from 'next/font/google';
import type { PropsWithChildren } from 'react';
import { cn } from '~/lib/utils';

type HeadingProps = PropsWithChildren<{
  className?: string;
}>;

const notoSansKr = Noto_Sans_KR({
  weight: 'variable',
  subsets: ['latin'],
});

const notoSerifKr = Noto_Serif_KR({
  weight: ['600', '700', '900'],
  subsets: ['latin'],
});

export function Heading1({ children, className }: HeadingProps) {
  return (
    <h1
      className={cn(
        'mt-1',
        'mb-4',
        'text-3xl',
        'font-black',
        'text-neutral-800',
        notoSansKr.className,
        className
      )}
    >
      {children}
    </h1>
  );
}

export function Heading2({ children, className }: HeadingProps) {
  return (
    <h2
      className={cn(
        'mt-1',
        'mb-3',
        'text-2xl',
        'font-bold',
        'text-neutral-800',
        className
      )}
    >
      {children}
    </h2>
  );
}

export function Heading3({ children, className }: HeadingProps) {
  return (
    <h3
      className={cn(
        'my-1',
        'text-xl',
        'font-semibold',
        'text-neutral-600',
        notoSerifKr.className,
        className
      )}
    >
      {children}
    </h3>
  );
}
