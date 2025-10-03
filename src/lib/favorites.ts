import { supabase } from './supabase';

export interface UserFavorite {
  id: string;
  product_id: string;
  user_id: string;
  created_at: string;
}

export const favoriteService = {
  async getUserFavorites(userId: string): Promise<UserFavorite[]> {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async isFavorite(productId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  async addFavorite(productId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_favorites')
      .insert({
        product_id: productId,
        user_id: user.id,
      });

    if (error) throw error;
  },

  async removeFavorite(productId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('product_id', productId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  async toggleFavorite(productId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const isFav = await this.isFavorite(productId, user.id);

    if (isFav) {
      await this.removeFavorite(productId);
      return false;
    } else {
      await this.addFavorite(productId);
      return true;
    }
  },
};
