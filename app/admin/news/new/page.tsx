"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { createNews } from "@/lib/services/newsService";
import { CreateNewsData, UpdateNewsData } from "@/types/news";
import NewsForm from "@/components/NewsForm";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function CreateNewsPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

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
  }, [user, isAdmin, authLoading, router]);

  const handleSubmit = async (data: CreateNewsData | UpdateNewsData) => {
    try {
      if ('id' in data) {
        // UpdateNewsData - shouldn't happen in create page
        console.error("Unexpected UpdateNewsData in create page");
        return;
      } else {
        // CreateNewsData
        await createNews(data);
      }
      router.push("/admin/news");
    } catch (error) {
      console.error("Error creating news:", error);
      alert("Failed to create news article");
    }
  };

  const handleCancel = () => {
    router.push("/admin/news");
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NewsForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
