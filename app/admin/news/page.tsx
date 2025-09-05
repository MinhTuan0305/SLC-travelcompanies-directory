"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { News } from "@/types/news";
import { getAllNews, deleteNews } from "@/lib/services/newsService";
import LoadingSpinner from "@/components/LoadingSpinner";
import dynamic from "next/dynamic";

// Lazy load NewsCard component
const NewsCard = dynamic(() => import("@/components/NewsCard"), {
  loading: () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 animate-pulse">
      <div className="h-48 bg-gray-200 rounded-t-xl"></div>
      <div className="p-6">
        <div className="h-4 bg-gray-200 rounded mb-3"></div>
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  )
});

export default function AdminNewsPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (!isAdmin) {
      router.push("/agencies");
      return;
    }

    loadNews();
  }, [user, isAdmin, authLoading, router]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const newsData = await getAllNews();
      setNews(newsData);
    } catch (err) {
      console.error("Error loading news:", err);
      setError("Failed to load news articles");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/news/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNews(id);
      setNews(prev => prev.filter(article => article.id !== id));
    } catch (err) {
      console.error("Error deleting news:", err);
      alert("Failed to delete news article");
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">News Management</h1>
            <p className="text-gray-600 mt-2">Manage news articles and content</p>
          </div>
          <Link
            href="/admin/news/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Create New Article
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{news.length}</div>
            <div className="text-sm text-gray-600">Total Articles</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {news.filter(article => article.published).length}
            </div>
            <div className="text-sm text-gray-600">Published</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-amber-600">
              {news.filter(article => article.featured).length}
            </div>
            <div className="text-sm text-gray-600">Featured</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-600">
              {news.filter(article => !article.published).length}
            </div>
            <div className="text-sm text-gray-600">Drafts</div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* News List */}
        {news.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No news articles</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new article.</p>
            <div className="mt-6">
              <Link
                href="/admin/news/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create New Article
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((article) => (
              <NewsCard
                key={article.id}
                news={article}
                isAdmin={true}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
