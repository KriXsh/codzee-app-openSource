export interface Link {
  code: string;
  targetUrl: string;
  createdAt: string;
  expiresAt: string | null;
  clicks: number;
}

export interface CreateLinkInput {
  url: string;
  alias?: string;
  expiresInDays?: number;
}
