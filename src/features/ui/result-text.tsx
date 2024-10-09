import type { PropsWithChildren } from 'react';
import { cn } from '~/lib/utils';

type ResultTextProps = PropsWithChildren<{
  className?: string;
}>;

export function ResultText({ children, className = '' }: ResultTextProps) {
  return (
    <article
      className={cn(
        'border-neutral-300 bg-neutral-100 p-4 border rounded-lg min-h-32 max-h-[600px] text-xs whitespace-pre-wrap overflow-auto',
        className
      )}
    >
      {children}
    </article>
  );
}
