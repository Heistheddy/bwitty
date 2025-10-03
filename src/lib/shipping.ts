import { supabase } from './supabase';

export interface ShippingAddress {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code?: string | null;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const shippingService = {
  async getUserAddresses(userId: string): Promise<ShippingAddress[]> {
    const { data, error } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getDefaultAddress(userId: string): Promise<ShippingAddress | null> {
    const { data, error } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async addAddress(address: Omit<ShippingAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ShippingAddress> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('shipping_addresses')
      .insert({
        ...address,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateAddress(addressId: string, address: Partial<Omit<ShippingAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const { error } = await supabase
      .from('shipping_addresses')
      .update(address)
      .eq('id', addressId);

    if (error) throw error;
  },

  async deleteAddress(addressId: string): Promise<void> {
    const { error } = await supabase
      .from('shipping_addresses')
      .delete()
      .eq('id', addressId);

    if (error) throw error;
  },

  async setDefaultAddress(addressId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('shipping_addresses')
      .update({ is_default: true })
      .eq('id', addressId);

    if (error) throw error;
  },
};
