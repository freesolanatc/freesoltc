export interface ArticleFaqItem {
  question: string;
  answer: string;
}

export interface ArticleFrontmatter {
  title: string;
  slug: string;
  metaDescription: string;
  date: string;
  updatedDate?: string;
  tags: string[];
  coverImage?: string;
  author?: string;
  faq?: ArticleFaqItem[];
}

export interface ArticleSummary extends ArticleFrontmatter {
  readingTimeMinutes: number;
}

export interface Article extends ArticleSummary {
  content: string;
}
