'use client';
import React from 'react';
import NextLink from 'next/link';
import { useRouter, usePathname, useParams as useNextParams, useSearchParams as useNextSearchParams } from 'next/navigation';

export const Link = React.forwardRef<HTMLAnchorElement, any>(({ to, href, children, ...props }, ref) => {
  const target = to || href || '#';
  return (
    <NextLink ref={ref} href={target} {...props}>
      {children}
    </NextLink>
  );
});

Link.displayName = 'Link';

export function useNavigate() {
  const router = useRouter();
  return (to: any, options?: any) => {
    if (typeof to === 'number') {
      if (to === -1) router.back();
      return;
    }
    let target = to;
    if (typeof to === 'object' && to !== null) {
      target = (to.pathname || '') + (to.search || '') + (to.hash || '');
    }
    if (typeof target !== 'string') {
      target = String(target || '/');
    }
    if (options?.replace) {
      router.replace(target);
    } else {
      router.push(target);
    }
  };
}

export function useLocation() {
  const pathname = usePathname() || '/';
  const searchParams = useNextSearchParams();
  const search = searchParams?.toString() ? `?${searchParams.toString()}` : '';
  return { pathname, search, hash: '', state: null, key: 'default' };
}

export function useParams<T extends Record<string, any>>(): T {
  const params = useNextParams();
  return (params || {}) as T;
}

export function useSearchParams() {
  const searchParams = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const setSearchParams = (newParams: any) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    if (typeof newParams === 'function') {
      newParams(params);
    } else if (newParams) {
      Object.entries(newParams).forEach(([k, v]) => {
        if (v === null || v === undefined) params.delete(k);
        else params.set(k, String(v));
      });
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return [searchParams, setSearchParams] as const;
}

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const router = useRouter();
  React.useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [to, replace, router]);
  return null;
}

export function Outlet({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
