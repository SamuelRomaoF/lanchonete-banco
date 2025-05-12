import { Category, Product } from "@shared/schema";
import { supabase } from "@shared/supabase";

// Funções para mapear dados do Supabase para o formato da aplicação
const mapCategoryFromSupabase = (data: any): Category => {
  return {
    id: data.id,
    name: data.name,
    description: data.description || null,
    imageUrl: data.image_url || null
  };
};

const mapProductFromSupabase = (data: any): Product => {
  return {
    id: data.id,
    name: data.name,
    description: data.description || null,
    price: data.price,
    imageUrl: data.image_url || null,
    isFeatured: data.is_featured || false,
    isPromotion: data.is_promotion || false,
    oldPrice: data.old_price || null,
    categoryId: data.category_id,
    available: data.available || true,
    createdAt: new Date(data.created_at)
  };
};

// Serviços para buscar dados do Supabase
export const supabaseService = {
  // Categorias
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Erro ao buscar categorias:', error);
      throw new Error(error.message);
    }
    
    return (data || []).map(mapCategoryFromSupabase);
  },
  
  // Produtos
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('available', true)
      .order('name');
    
    if (error) {
      console.error('Erro ao buscar produtos:', error);
      throw new Error(error.message);
    }
    
    return (data || []).map(mapProductFromSupabase);
  },
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .eq('available', true)
      .order('name');
    
    if (error) {
      console.error('Erro ao buscar produtos por categoria:', error);
      throw new Error(error.message);
    }
    
    return (data || []).map(mapProductFromSupabase);
  },
  
  async getFeaturedProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .eq('available', true)
      .order('name');
    
    if (error) {
      console.error('Erro ao buscar produtos em destaque:', error);
      throw new Error(error.message);
    }
    
    return (data || []).map(mapProductFromSupabase);
  },
  
  async getPromotionProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_promotion', true)
      .eq('available', true)
      .order('name');
    
    if (error) {
      console.error('Erro ao buscar produtos em promoção:', error);
      throw new Error(error.message);
    }
    
    return (data || []).map(mapProductFromSupabase);
  }
}; 