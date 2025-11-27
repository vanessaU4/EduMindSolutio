import apiClient from '@/services/apiClient';

export interface Review {
  id: string;
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  rating: number;
  date: string;
  userName: string;
  productId?: string;
  productName?: string;
}

export interface PaginatedReviews {
  reviews: Review[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReviews: number;
  };
}

export interface SentimentOverview {
  totalReviews: number;
  averageSentiment: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export const fetchSentimentOverview = async (): Promise<SentimentOverview> => {
  try {
    const response = await apiClient.get<SentimentOverview>('/community/sentiment/overview/');
    return response;
  } catch (error) {
    console.error('Failed to fetch sentiment overview:', error);
    // Return empty data structure if API fails
    return {
      totalReviews: 0,
      averageSentiment: 0,
      sentimentDistribution: {
        positive: 0,
        neutral: 0,
        negative: 0,
      },
    };
  }
};

export const fetchReviews = async (
  page = 1,
  limit = 10,
  filters: { sentiment: string; search: string }
): Promise<PaginatedReviews> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.sentiment && filters.sentiment !== 'all' && { sentiment: filters.sentiment }),
      ...(filters.search && { search: filters.search }),
    });

    const response = await apiClient.get<PaginatedReviews>(`/community/reviews/?${params}`);
    return response;
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    // Return empty data structure if API fails
    return {
      reviews: [],
      pagination: {
        currentPage: page,
        totalPages: 0,
        totalReviews: 0,
      },
    };
  }
};

class SentimentService {
  async getSentimentOverview(): Promise<SentimentOverview> {
    return fetchSentimentOverview();
  }

  async getReviews(
    page = 1,
    limit = 10,
    filters: { sentiment: string; search: string } = { sentiment: 'all', search: '' }
  ): Promise<PaginatedReviews> {
    return fetchReviews(page, limit, filters);
  }
}

export const sentimentService = new SentimentService();
export default sentimentService;
