import { createClient } from '@/lib/supabase/client';
import { News, CreateNewsData, UpdateNewsData } from '@/types/news';

const supabase = createClient();

// Generate slug from title
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

// Get all published news (public)
export const getPublishedNews = async (): Promise<News[]> => {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching published news:', error);
    throw error;
  }

  return data || [];
};

// Get all news (admin only)
export const getAllNews = async (): Promise<News[]> => {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all news:', error);
    throw error;
  }

  return data || [];
};

// Get news by slug
export const getNewsBySlug = async (slug: string): Promise<News | null> => {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching news by slug:', error);
    throw error;
  }

  return data;
};

// Get news by ID (admin only)
export const getNewsById = async (id: string): Promise<News | null> => {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching news by ID:', error);
    throw error;
  }

  return data;
};

// Create new news article
export const createNews = async (newsData: CreateNewsData): Promise<News> => {
  const slug = generateSlug(newsData.title);
  
  // Check if slug already exists
  const existingNews = await supabase
    .from('news')
    .select('id')
    .eq('slug', slug)
    .single();

  if (existingNews.data) {
    // If slug exists, append timestamp
    const uniqueSlug = `${slug}-${Date.now()}`;
    newsData = { ...newsData, slug: uniqueSlug };
  } else {
    newsData = { ...newsData, slug };
  }

  const { data, error } = await supabase
    .from('news')
    .insert([newsData])
    .select()
    .single();

  if (error) {
    console.error('Error creating news:', error);
    throw error;
  }

  return data;
};

// Update news article
export const updateNews = async (id: string, newsData: Partial<CreateNewsData>): Promise<News> => {
  // If title is being updated, regenerate slug
  if (newsData.title) {
    const slug = generateSlug(newsData.title);
    
    // Check if new slug already exists (excluding current article)
    const existingNews = await supabase
      .from('news')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single();

    if (existingNews.data) {
      // If slug exists, append timestamp
      newsData = { ...newsData, slug: `${slug}-${Date.now()}` };
    } else {
      newsData = { ...newsData, slug };
    }
  }

  const { data, error } = await supabase
    .from('news')
    .update(newsData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating news:', error);
    throw error;
  }

  return data;
};

// Delete news article
export const deleteNews = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('news')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting news:', error);
    throw error;
  }
};

// Get featured news
export const getFeaturedNews = async (): Promise<News[]> => {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('published', true)
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error fetching featured news:', error);
    throw error;
  }

  return data || [];
};

// Search news
export const searchNews = async (query: string): Promise<News[]> => {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('published', true)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching news:', error);
    throw error;
  }

  return data || [];
};
