// Legacy product interface - kept for compatibility
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: 'hair-products' | 'clothing' | 'gadgets' | 'household';
  subcategory: string;
  inStock: boolean;
  weight: number; // in kg for shipping calculation
  featured: boolean;
  rating: number;
  reviews: number;
  tags: string[];
}

// Legacy products data - kept for reference but products now come from Supabase
export const products: Product[] = [
  // Products are now managed through Supabase
  // This array is kept for backward compatibility but should not be used
];

export const categories = [
  {
    id: 'hair-products',
    name: 'Hair Products',
    description: 'Premium wigs, extensions, closures, and frontals',
    image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg',
    subcategories: ['Wigs', 'Extensions', 'Closures', 'Frontals']
  },
  {
    id: 'clothing',
    name: 'Clothing',
    description: 'African prints, modern fashion, and traditional wear',
    image: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg',
    subcategories: ['Dresses', 'Tops', 'Bottoms', 'Traditional']
  },
  {
    id: 'gadgets',
    name: 'Gadgets & Electronics',
    description: 'Latest tech gadgets and electronic accessories',
    image: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg',
    subcategories: ['Audio', 'Power Banks', 'Accessories', 'Phones']
  },
  {
    id: 'household',
    name: 'Household Items',
    description: 'Essential items for your home and kitchen',
    image: 'https://images.pexels.com/photos/1631677/pexels-photo-1631677.jpeg',
    subcategories: ['Kitchen', 'Bedroom', 'Lighting', 'Decor']
  }
];