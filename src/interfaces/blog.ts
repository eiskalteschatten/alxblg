export interface BlogConfig {
  title: string;
  description: string;
  author: string;
  baseUrl: string;
  postsPerPage: number;
}

export interface BlogPost {
  title: string;
  date: string;
  slug: string;
  content: string;
  excerpt?: string;
}