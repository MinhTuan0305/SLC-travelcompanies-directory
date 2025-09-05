"use client";

import Link from "next/link";
import Image from "next/image";
import { News } from "@/types/news";
import { formatDistanceToNow } from "date-fns";

interface NewsCardProps {
  news: News;
  isAdmin?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function NewsCard({ news, isAdmin = false, onEdit, onDelete }: NewsCardProps) {
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    onEdit?.(news.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm(`Are you sure you want to delete "${news.title}"?`)) {
      onDelete?.(news.id);
    }
  };

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Image */}
      {news.image_url && (
        <div className="relative h-48 w-full">
          <Image
            src={news.image_url}
            alt={news.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {news.featured && (
            <div className="absolute top-3 left-3">
              <span className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Featured
              </span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <time className="text-sm text-gray-500">
            {formatDate(news.created_at)}
          </time>
          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
          <Link 
            href={isAdmin ? `/admin/news/${news.id}/edit` : `/news/${news.slug}`}
            className="hover:text-blue-600 transition-colors duration-200"
          >
            {news.title}
          </Link>
        </h2>

        {news.excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3">
            {news.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between">
          <Link
            href={isAdmin ? `/admin/news/${news.id}/edit` : `/news/${news.slug}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Read more
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                news.published 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {news.published ? 'Published' : 'Draft'}
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
