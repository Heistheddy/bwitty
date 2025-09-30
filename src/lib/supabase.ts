import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we have valid Supabase credentials (not placeholder values)
const hasValidSupabaseConfig = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-ref.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here' &&
  !supabaseUrl.includes('your-project-ref');

if (!hasValidSupabaseConfig) {
  console.warn('Supabase not configured - using fallback mode');
}

export const supabase = hasValidSupabaseConfig ? 
  createClient(supabaseUrl, supabaseAnonKey) : 
  null;

export const isSupabaseConfigured = hasValidSupabaseConfig;

// Realtime subscription helper
export const subscribeToProducts = (callback: (payload: any) => void) => {
  if (!isSupabaseConfigured || !supabase) return null;
  
  return supabase
    .channel('products-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'products' }, 
      callback
    )
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'product_images' }, 
      callback
    )
    .subscribe();
};

// Helper function to check if a string is a valid UUID format
export const isSupabaseUuid = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Database types
export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface DatabaseOrder {
  id: string;
  order_no: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  items: any[];
  totals: any;
  shipping_address: any;
  shipping_method?: string;
  tracking: any;
  payment: any;
  status: 'pending_payment' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  audit_log: any[];
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  order_id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Product types
export interface DatabaseProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  created_at: string;
  updated_at: string;
}

// Product image types
export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  created_at: string;
}

// Product management functions
export const productService = {
  // Helper function to pick only defined values
  pickDefined(obj: any) {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
  },

  // Get all products
  async getAll(): Promise<(DatabaseProduct & { product_images: ProductImage[] })[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        stock,
        created_at,
        updated_at,
        product_images!fk_product_images_product (
          id,
          product_id,
          image_url,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get single product with images
  async getById(productId: string): Promise<(DatabaseProduct & { product_images: ProductImage[] }) | null> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        stock,
        created_at,
        updated_at,
        product_images!fk_product_images_product (
          id,
          product_id,
          image_url,
          created_at
        )
      `)
      .eq('id', productId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },
  // Get product with images
  async getWithImages(productId: string): Promise<DatabaseProduct & { images: ProductImage[] }> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase not configured');
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError) throw productError;

    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: true });

    if (imagesError) throw imagesError;

    return { ...product, images: images || [] };
  },

  // Get product images
  async getProductImages(productId: string): Promise<ProductImage[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Create product
  async create(product: Omit<DatabaseProduct, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseProduct> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update product
  async update(id: string, updates: Partial<Omit<DatabaseProduct, 'id' | 'created_at' | 'updated_at'>>): Promise<DatabaseProduct> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase not configured');
    }

    const updateData = this.pickDefined(updates);
    
    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields to update');
    }

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        name,
        description,
        price,
        stock,
        created_at,
        updated_at,
        product_images!fk_product_images_product (
          id,
          product_id,
          image_url,
          created_at
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Delete product
  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase not configured');
    }

    // Get all product images before deleting the product
    const productImages = await this.getProductImages(id);
    
    // Delete all images from storage
    for (const image of productImages) {
      await this.deleteImage(image.image_url);
    }

    // Delete product (this will cascade delete product_images due to FK constraint)
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Upload image
  async uploadImage(file: File, productId: string): Promise<string> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase not configured');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}-${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  // Add product image
  async addProductImage(productId: string, imageUrl: string): Promise<ProductImage> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('product_images')
      .insert([{ product_id: productId, image_url: imageUrl }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update product with images (for admin dashboard)
  async updateProductWithImages(
    id: string, 
    productUpdates: Partial<Omit<DatabaseProduct, 'id' | 'created_at' | 'updated_at' | 'product_images'>>,
    newImages?: File[]
  ): Promise<DatabaseProduct & { product_images: ProductImage[] }> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase not configured');
    }

    // Helper function to pick only defined values
    const pickDefined = (obj: any) => {
      const result: any = {};
      Object.keys(obj).forEach(key => {
        if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
          result[key] = obj[key];
        }
      });
      return result;
    };

    const cleanUpdates = pickDefined(productUpdates);
    
    // Update product if there are changes
    if (Object.keys(cleanUpdates).length > 0) {
      const { data, error } = await supabase
        .from('products')
        .update(cleanUpdates)
        .eq('id', id)
        .select(`
          id,
          name,
          description,
          price,
          stock,
          created_at,
          updated_at,
          product_images!fk_product_images_product (
            id,
            product_id,
            image_url,
            created_at
          )
        `)
        .single();

      if (error) throw error;
    }

    // Handle new images if provided
    if (newImages && newImages.length > 0) {
      for (const file of newImages) {
        try {
          const imageUrl = await this.uploadImage(file, id);
          await this.addProductImage(id, imageUrl);
        } catch (error) {
          console.error('Error uploading image:', error);
          // Continue with other images even if one fails
        }
      }
    }

    // Return final product with all images
    return await this.getById(id) as DatabaseProduct & { product_images: ProductImage[] };
  },
  // Delete product image
  async deleteProductImage(imageId: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase not configured');
    }

    // Get image details first
    const { data: image, error: fetchError } = await supabase
      .from('product_images')
      .select('image_url')
      .eq('id', imageId)
      .single();

    if (fetchError) throw fetchError;

    // Delete from storage
    await this.deleteImage(image.image_url);

    // Delete from database
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId);

    if (error) throw error;
  },

  // Delete image
  async deleteImage(imageUrl: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase || !imageUrl) return;

    try {
      // Extract file path from URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(-2).join('/'); // Get 'products/filename.ext'

      await supabase.storage
        .from('product-images')
        .remove([filePath]);
    } catch (error) {
      console.error('Error deleting image:', error);
      // Don't throw - image deletion shouldn't block product deletion
    }
  }
};