import { HomeIcon } from '@radix-ui/react-icons';
import { usePathname } from 'next/navigation';
import { Fragment, useMemo } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '~/features/ui/breadcrumb';
import { cn } from '~/lib/utils';

type BreadcrumbHeaderProps = {
  headerClassName?: string;
};

export function BreadcrumbHeader({ headerClassName }: BreadcrumbHeaderProps) {
  const pathname = usePathname();

  const [_home, ...pathsInfo] = useMemo(
    () =>
      pathname.split('/').map((name, idx, pathnames) => {
        return {
          // TODO: path → name mapping
          name,
          href: `${pathnames.slice(0, idx + 1).join('/')}`,
        };
      }),
    [pathname]
  );

  return (
    <header
      className={cn(
        'flex flex-row gap-2 w-full mb-4 pb-2 border-b border-neutral-500',
        headerClassName
      )}
    >
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem key={'breadcrumb-item-home'}>
            <BreadcrumbLink href="/">
              <HomeIcon />
            </BreadcrumbLink>
          </BreadcrumbItem>

          {pathsInfo.slice(0, -1).map(({ name, href }) => (
            <Fragment key={`breadcrumb-item-${name}`}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={href}>{name}</BreadcrumbLink>
              </BreadcrumbItem>
            </Fragment>
          ))}

          <BreadcrumbSeparator />
          <BreadcrumbItem className="cursor-default">
            {pathsInfo.at(-1)?.name}
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
