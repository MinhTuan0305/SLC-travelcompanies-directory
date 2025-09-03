"use client";

import { Suspense, lazy, ComponentType } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LazyPageProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
}

export default function LazyPage({ 
  component, 
  fallback = <LoadingSpinner text="Loading page..." size="lg" className="min-h-screen" />
}: LazyPageProps) {
  const LazyComponent = lazy(component);

  return (
    <Suspense fallback={fallback}>
      <LazyComponent />
    </Suspense>
  );
}
