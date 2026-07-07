import Link from 'next/link';
import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50',
  ghost: 'text-gray-700 hover:bg-gray-100',
};

const BASE =
  'inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed';

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button className={`${BASE} ${VARIANTS[variant]} ${className}`} {...props} />
  );
}

export function LinkButton({
  href,
  variant = 'primary',
  className = '',
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`${BASE} ${VARIANTS[variant]} ${className}`}>
      {children}
    </Link>
  );
}
