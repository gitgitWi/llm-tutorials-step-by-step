import type { PropsWithChildren } from 'react';
import { cn } from '~/lib/utils';

type ResultTextProps = PropsWithChildren<{
  className?: string;
}>;

export function ResultTextChunk({ children, className = '' }: ResultTextProps) {
  return (
    <p className={cn('p-2 rounded-lg border border-neutral-300', className)}>
      {children}
    </p>
  );
}
