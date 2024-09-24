import type { PropsWithChildren } from 'react';
import { BreadcrumbHeader } from '~/features/breadcrumb-header';

export default function TutorialsLayout({ children }: PropsWithChildren) {
  return (
    <>
      <BreadcrumbHeader />

      {children}
    </>
  );
}
