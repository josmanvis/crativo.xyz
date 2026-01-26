'use client';

import { ReactNode } from 'react';
import PasswordGate from '@/components/PasswordGate';

interface ProtectedProjectContentProps {
  children: ReactNode;
  projectId: string;
  password: string;
  title: string;
}

export default function ProtectedProjectContent({
  children,
  projectId,
  password,
  title,
}: ProtectedProjectContentProps) {
  return (
    <PasswordGate
      contentId={`project-${projectId}`}
      password={password}
      title="Protected Project"
      description={`"${title}" is password protected. Enter the password to view details.`}
    >
      {children}
    </PasswordGate>
  );
}
