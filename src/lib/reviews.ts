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
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name
        )
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((review: any) => ({
      ...review,
      user_name: review.profiles
        ? `${review.profiles.first_name || ''} ${review.profiles.last_name || ''}`.trim() || 'Anonymous'
        : 'Anonymous',
    }));
  },

  async addReview(productId: string, rating: number, comment: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: productId,
        user_id: user.id,
        rating,
        comment,
      });

    if (error) throw error;
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
