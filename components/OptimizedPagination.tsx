"use client";

import { memo } from 'react';

interface OptimizedPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const OptimizedPagination = memo(function OptimizedPagination({
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  className = ''
}: OptimizedPaginationProps) {
  // Tạo array số trang để hiển thị
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Điều chỉnh startPage nếu endPage đã ở cuối
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex flex-col items-center gap-4 mt-12 ${className}`}>
      {/* Pagination Info */}
      <div className="text-sm text-luxury-navy/70">
        Page {currentPage} of {totalPages} • {totalCount} stores
      </div>
      
      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        {currentPage > 2 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-2 text-sm font-medium text-luxury-navy bg-white border border-gray-200 hover:bg-luxury-gold/5 hover:border-luxury-gold transition-all duration-200 rounded-l-lg"
            >
              1
            </button>
            {currentPage > 3 && (
              <span className="px-2 text-luxury-navy/50">...</span>
            )}
          </>
        )}
        
        {/* Previous Page */}
        {currentPage > 1 ? (
          <button
            onClick={() => onPageChange(currentPage - 1)}
            className="px-3 py-2 text-sm font-medium text-luxury-navy bg-white border border-gray-200 hover:bg-luxury-gold/5 hover:border-luxury-gold transition-all duration-200 flex items-center gap-1"
          >
            <span>←</span>
            <span className="hidden sm:inline">Previous</span>
          </button>
        ) : (
          <span className="px-3 py-2 text-sm font-medium text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed flex items-center gap-1">
            <span>←</span>
            <span className="hidden sm:inline">Previous</span>
          </span>
        )}
        
        {/* Current Page and Adjacent Pages */}
        {getPageNumbers().map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
              pageNum === currentPage
                ? "text-white bg-luxury-gold border border-luxury-gold shadow-luxury"
                : "text-luxury-navy bg-white border border-gray-200 hover:bg-luxury-gold/5 hover:border-luxury-gold hover:shadow-sm"
            }`}
          >
            {pageNum}
          </button>
        ))}
        
        {/* Next Page */}
        {currentPage < totalPages ? (
          <button
            onClick={() => onPageChange(currentPage + 1)}
            className="px-3 py-2 text-sm font-medium text-luxury-navy bg-white border border-gray-200 hover:bg-luxury-gold/5 hover:border-luxury-gold transition-all duration-200 flex items-center gap-1"
          >
            <span className="hidden sm:inline">Next</span>
            <span>→</span>
          </button>
        ) : (
          <span className="px-3 py-2 text-sm font-medium text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed flex items-center gap-1">
            <span className="hidden sm:inline">Next</span>
            <span>→</span>
          </span>
        )}
        
        {/* Last Page */}
        {currentPage < totalPages - 1 && (
          <>
            {currentPage < totalPages - 2 && (
              <span className="px-2 text-luxury-navy/50">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-2 text-sm font-medium text-luxury-navy bg-white border border-gray-200 hover:bg-luxury-gold/5 hover:border-luxury-gold transition-all duration-200 rounded-r-lg"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>
    </div>
  );
});

export default OptimizedPagination;
