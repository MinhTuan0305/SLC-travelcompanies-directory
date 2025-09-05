"use client";

import Link from "next/link";
import { useAuth } from "@/lib/contexts/AuthContext";

interface AgenciesHeaderProps {
  page: number;
  pageSize: number;
  totalCount: number;
}

export default function AgenciesHeader({ page, pageSize, totalCount }: AgenciesHeaderProps) {
  const { isAdmin } = useAuth();

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-luxury-navy">UK Travel Agencies</h1>
        <p className="text-luxury-navy/70 mt-1">
          Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, totalCount)} of {totalCount} agencies
        </p>
      </div>
      {isAdmin && (
        <Link
          href="/agencies/new"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 font-medium transition-colors duration-200 shadow-luxury hover:shadow-luxury-hover transform hover:-translate-y-1"
        >
          + Add New Agency
        </Link>
      )}
    </div>
  );
}
