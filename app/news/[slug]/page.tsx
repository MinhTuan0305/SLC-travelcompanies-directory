import { getNewsBySlug, getPublishedNews } from "@/lib/services/newsService";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import dynamic from "next/dynamic";

// Lazy load NewsCard for related articles
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

interface NewsDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: NewsDetailPageProps) {
  const resolvedParams = await params;
  const news = await getNewsBySlug(resolvedParams.slug);

  if (!news) {
    return {
      title: "News Article Not Found",
    };
  }

  return {
    title: `${news.title} | UK Agency News`,
    description: news.excerpt || news.content.substring(0, 160),
    openGraph: {
      title: news.title,
      description: news.excerpt || news.content.substring(0, 160),
      images: news.image_url ? [news.image_url] : [],
    },
  };
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const resolvedParams = await params;
  const news = await getNewsBySlug(resolvedParams.slug);

  if (!news) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Get related news (excluding current article)
  const allNews = await getPublishedNews();
  const relatedNews = allNews
    .filter(article => article.id !== news.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/news"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to News
          </Link>
        </div>

        {/* Article Header */}
        <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Featured Image */}
          {news.image_url && (
            <div className="relative h-64 md:h-96 w-full">
              <Image
                src={news.image_url}
                alt={news.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                priority
              />
              {news.featured && (
                <div className="absolute top-4 left-4">
                  <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Featured
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Article Content */}
          <div className="p-8">
            {/* Meta Information */}
            <div className="flex items-center justify-between mb-6">
              <time className="text-sm text-gray-500">
                {formatDate(news.created_at)}
              </time>
              <div className="flex items-center gap-2">
                {news.featured && (
                  <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                    Featured
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {news.title}
            </h1>

            {/* Excerpt */}
            {news.excerpt && (
              <div className="text-xl text-gray-600 mb-8 leading-relaxed">
                {news.excerpt}
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {news.content}
              </div>
            </div>
          </div>
        </article>

        {/* Related News */}
        {relatedNews.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedNews.map((article) => (
                <div key={article.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  {article.image_url && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={article.image_url}
                        alt={article.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      <Link 
                        href={`/news/${article.slug}`}
                        className="hover:text-blue-600 transition-colors duration-200"
                      >
                        {article.title}
                      </Link>
                    </h3>
                    {article.excerpt && (
                      <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                        {article.excerpt}
                      </p>
                    )}
                    <time className="text-xs text-gray-500">
                      {formatDate(article.created_at)}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
