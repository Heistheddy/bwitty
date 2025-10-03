import { supabase } from './supabase';

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  user_name?: string;
}

export const reviewService = {
  async getProductReviews(productId: string): Promise<ProductReview[]> {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    const reviewsWithNames = await Promise.all(
      data.map(async (review: any) => {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', review.user_id)
            .single();

          const user_name = profile
            ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous'
            : 'Anonymous';

          return {
            ...review,
            user_name,
          };
        } catch (err) {
          console.error('Error fetching profile for review:', err);
          return {
            ...review,
            user_name: 'Anonymous',
          };
        }
      })
    );

    return reviewsWithNames;
  },

  async addReview(productId: string, rating: number, comment: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    console.log('Submitting review:', { productId, userId: user.id, rating, comment });

    const { data, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: productId,
        user_id: user.id,
        rating,
        comment,
      })
      .select();

    if (error) {
      console.error('Review submission error:', error);
      throw error;
    }

    console.log('Review submitted successfully:', data);
  },

  async updateReview(reviewId: string, rating: number, comment: string): Promise<void> {
    const { error } = await supabase
      .from('product_reviews')
      .update({ rating, comment, updated_at: new Date().toISOString() })
      .eq('id', reviewId);

    if (error) throw error;
  },

  async deleteReview(reviewId: string): Promise<void> {
    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
  },

  async getUserReview(productId: string, userId: string): Promise<ProductReview | null> {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getAverageRating(productId: string): Promise<{ average: number; count: number }> {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('rating')
      .eq('product_id', productId);

    if (error) throw error;

    if (!data || data.length === 0) {
      return { average: 0, count: 0 };
    }

    const sum = data.reduce((acc, review) => acc + review.rating, 0);
    return {
      average: sum / data.length,
      count: data.length,
    };
  },
};
