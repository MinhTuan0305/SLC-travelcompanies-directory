export interface News {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image_url?: string;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
  author_id?: string;
}

export interface CreateNewsData {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  image_url?: string;
  featured?: boolean;
  published?: boolean;
}

export interface UpdateNewsData extends Partial<CreateNewsData> {
  id: string;
}

export interface NewsListProps {
  news: News[];
  isAdmin?: boolean;
}

export interface NewsCardProps {
  news: News;
  isAdmin?: boolean;
}

export interface NewsFormProps {
  news?: News;
  onSubmit: (data: CreateNewsData | UpdateNewsData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}
