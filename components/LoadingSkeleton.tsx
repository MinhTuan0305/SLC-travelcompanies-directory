interface LoadingSkeletonProps {
  type?: 'card' | 'chart' | 'text' | 'button' | 'list';
  className?: string;
}

export default function LoadingSkeleton({ type = 'card', className = '' }: LoadingSkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200 rounded";
  
  switch (type) {
    case 'card':
      return (
        <div className={`${baseClasses} ${className}`}>
          <div className="h-48 bg-gray-200 rounded-t-xl"></div>
          <div className="p-6">
            <div className="h-4 bg-gray-200 rounded mb-3"></div>
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      );
    
    case 'chart':
      return (
        <div className={`${baseClasses} h-64 ${className}`}></div>
      );
    
    case 'text':
      return (
        <div className={`${baseClasses} h-4 ${className}`}></div>
      );
    
    case 'button':
      return (
        <div className={`${baseClasses} h-8 w-20 ${className}`}></div>
      );
    
    case 'list':
      return (
        <div className={`${baseClasses} h-32 ${className}`}></div>
      );
    
    default:
      return <div className={`${baseClasses} h-32 ${className}`}></div>;
  }
}
