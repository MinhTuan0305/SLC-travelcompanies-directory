"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getNewsById, updateNews } from "@/lib/services/newsService";
import { News, CreateNewsData, UpdateNewsData } from "@/types/news";
import NewsForm from "@/components/NewsForm";
import LoadingSpinner from "@/components/LoadingSpinner";

interface EditNewsPageProps {
  params: Promise<{ id: string }>;
}

export default function EditNewsPage({ params }: EditNewsPageProps) {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const resolvedParams = await params;
        const newsData = await getNewsById(resolvedParams.id);
        
        if (!newsData) {
          setError("News article not found");
          return;
        }
        
        setNews(newsData);
      } catch (err) {
        console.error("Error loading news:", err);
        setError("Failed to load news article");
      } finally {
        setLoading(false);
      }
    };

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
  }, [user, isAdmin, authLoading, router, params]);

  const handleSubmit = async (data: CreateNewsData | UpdateNewsData) => {
    try {
      if ('id' in data) {
        // UpdateNewsData
        await updateNews(data.id, data);
      } else {
        // This shouldn't happen in edit page, but handle it gracefully
        console.error("Unexpected CreateNewsData in edit page");
        return;
      }
      router.push("/admin/news");
    } catch (error) {
      console.error("Error updating news:", error);
      alert("Failed to update news article");
    }
  };

  const handleCancel = () => {
    router.push("/admin/news");
  };

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!user || !isAdmin) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/admin/news")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Back to News
          </button>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">News Not Found</h1>
          <p className="text-gray-600 mb-6">The requested news article could not be found.</p>
          <button
            onClick={() => router.push("/admin/news")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Back to News
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NewsForm
        news={news}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
