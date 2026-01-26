'use client';

import { ReactNode } from 'react';
import PasswordGate from '@/components/PasswordGate';

interface ProtectedBlogContentProps {
  children: ReactNode;
  slug: string;
  password: string;
  title: string;
}

export default function ProtectedBlogContent({
  children,
  slug,
  password,
  title,
}: ProtectedBlogContentProps) {
  return (
    <PasswordGate
      contentId={`blog-${slug}`}
      password={password}
      title="Protected Article"
      description={`"${title}" is password protected. Enter the password to read.`}
    >
      {children}
    </PasswordGate>
  );
}
