"use client";

import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface ProtectedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export default function ProtectedButton({ 
  children, 
  onClick, 
  className = '', 
  type = 'button',
  disabled = false 
}: ProtectedButtonProps) {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  const handleClick = () => {
    if (!user) {
      // Not logged in, redirect to login
      router.push('/auth/login');
      return;
    }

    if (!isAdmin) {
      // Logged in but not admin, show message or redirect
      alert('You do not have permission to perform this action.');
      return;
    }

    // User is admin, execute the action
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      className={className}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
