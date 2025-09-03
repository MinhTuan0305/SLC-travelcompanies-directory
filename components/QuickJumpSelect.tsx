"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface QuickJumpSelectProps {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string>;
}

export default function QuickJumpSelect({ 
  currentPage, 
  totalPages, 
  searchParams 
}: QuickJumpSelectProps) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();

  const handlePageChange = (newPage: string) => {
    const params = new URLSearchParams(urlSearchParams.toString());
    params.set("page", newPage);
    router.push(`/agencies?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-luxury-navy/70">Go to:</span>
      <select
        value={currentPage}
        onChange={(e) => handlePageChange(e.target.value)}
        className="px-2 py-1 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold transition-colors"
      >
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <option key={pageNum} value={pageNum}>
            Page {pageNum}
          </option>
        ))}
      </select>
    </div>
  );
}
