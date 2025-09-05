import { getPublishedNews, getFeaturedNews } from "@/lib/services/newsService";
import Link from "next/link";
import dynamic from "next/dynamic";
import LoadingSkeleton from "@/components/LoadingSkeleton";

// Lazy load NewsCard component
const NewsCard = dynamic(() => import("@/components/NewsCard"), {
  loading: () => <LoadingSkeleton type="card" className="bg-white shadow-sm border border-gray-200" />
});

export default async function NewsPage() {
  const [news, featuredNews] = await Promise.all([
    getPublishedNews(),
    getFeaturedNews()
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Latest News</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest developments in the UK travel industry, 
            regulatory changes, and industry insights.
          </p>
        </div>

        {/* Featured News */}
        {featuredNews.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Articles</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {featuredNews.map((article) => (
                <NewsCard
                  key={article.id}
                  news={article}
                  isAdmin={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* All News */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">All Articles</h2>
            <div className="text-sm text-gray-600">
              {news.length} article{news.length !== 1 ? 's' : ''}
            </div>
          </div>

          {news.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No news articles</h3>
              <p className="mt-1 text-sm text-gray-500">Check back later for updates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((article) => (
                <NewsCard
                  key={article.id}
                  news={article}
                  isAdmin={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* Back to Agencies */}
        <div className="mt-12 text-center">
          <Link
            href="/agencies"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Agencies
          </Link>
        </div>
      </div>
    </div>
  );
}
