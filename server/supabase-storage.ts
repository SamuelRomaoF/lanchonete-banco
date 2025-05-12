import {
    type Category, type InsertCategory,
    type InsertOrder,
    type InsertOrderItem,
    type InsertPayment,
    type InsertProduct,
    type InsertUser,
    type Order,
    type OrderItem,
    type Payment,
    type Product,
    type User
} from "@shared/schema";
import { supabase } from "../shared/supabase";
import { IStorage } from "./storage";

// Implementação usando Supabase
export class SupabaseStorage implements IStorage {
  constructor() {
    // Inicialização, se necessário
  }

  // ===== Usuários =====
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error || !data) return undefined;
    
    return this.mapUserFromSupabase(data);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
      
    if (error || !data) return undefined;
    
    return this.mapUserFromSupabase(data);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: user.name,
        email: user.email,
        password: user.password,
        address: user.address || null,
        phone: user.phone || null,
        type: user.type
      })
      .select()
      .single();
      
    if (error) throw new Error(`Erro ao criar usuário: ${error.message}`);
    
    return this.mapUserFromSupabase(data);
  }
  
  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .update({
        name: user.name,
        email: user.email,
        password: user.password,
        address: user.address,
        phone: user.phone,
        type: user.type
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error || !data) return undefined;
    
    return this.mapUserFromSupabase(data);
  }
  
  // ===== Categorias =====
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
      
    if (error) throw new Error(`Erro ao buscar categorias: ${error.message}`);
    
    return (data || []).map(this.mapCategoryFromSupabase);
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error || !data) return undefined;
    
    return this.mapCategoryFromSupabase(data);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        description: category.description || null,
        image_url: category.imageUrl || null
      })
      .select()
      .single();
      
    if (error) throw new Error(`Erro ao criar categoria: ${error.message}`);
    
    return this.mapCategoryFromSupabase(data);
  }
  
  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const { data, error } = await supabase
      .from('categories')
      .update({
        name: category.name,
        description: category.description,
        image_url: category.imageUrl
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error || !data) return undefined;
    
    return this.mapCategoryFromSupabase(data);
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
      
    return !error;
  }
  
  // ===== Produtos =====
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
      
    if (error) throw new Error(`Erro ao buscar produtos: ${error.message}`);
    
    return (data || []).map(this.mapProductFromSupabase);
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .order('name');
      
    if (error) throw new Error(`Erro ao buscar produtos por categoria: ${error.message}`);
    
    return (data || []).map(this.mapProductFromSupabase);
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .eq('available', true)
      .order('name');
      
    if (error) throw new Error(`Erro ao buscar produtos em destaque: ${error.message}`);
    
    return (data || []).map(this.mapProductFromSupabase);
  }
  
  async getPromotionProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_promotion', true)
      .eq('available', true)
      .order('name');
      
    if (error) throw new Error(`Erro ao buscar produtos em promoção: ${error.message}`);
    
    return (data || []).map(this.mapProductFromSupabase);
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error || !data) return undefined;
    
    return this.mapProductFromSupabase(data);
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        description: product.description || null,
        price: product.price,
        image_url: product.imageUrl || null,
        is_featured: product.isFeatured,
        is_promotion: product.isPromotion,
        old_price: product.oldPrice || null,
        category_id: product.categoryId,
        available: product.available
      })
      .select()
      .single();
      
    if (error) throw new Error(`Erro ao criar produto: ${error.message}`);
    
    return this.mapProductFromSupabase(data);
  }
  
  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const updateData: any = {};
    
    if (product.name !== undefined) updateData.name = product.name;
    if (product.description !== undefined) updateData.description = product.description;
    if (product.price !== undefined) updateData.price = product.price;
    if (product.imageUrl !== undefined) updateData.image_url = product.imageUrl;
    if (product.isFeatured !== undefined) updateData.is_featured = product.isFeatured;
    if (product.isPromotion !== undefined) updateData.is_promotion = product.isPromotion;
    if (product.oldPrice !== undefined) updateData.old_price = product.oldPrice;
    if (product.categoryId !== undefined) updateData.category_id = product.categoryId;
    if (product.available !== undefined) updateData.available = product.available;
    
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error || !data) return undefined;
    
    return this.mapProductFromSupabase(data);
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
      
    return !error;
  }
  
  // ===== Pedidos =====
  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw new Error(`Erro ao buscar pedidos: ${error.message}`);
    
    return (data || []).map(this.mapOrderFromSupabase);
  }
  
  async getOrdersByUser(userId: number): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw new Error(`Erro ao buscar pedidos do usuário: ${error.message}`);
    
    return (data || []).map(this.mapOrderFromSupabase);
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error || !data) return undefined;
    
    return this.mapOrderFromSupabase(data);
  }
  
  async getOrderWithItems(id: number): Promise<{order: Order, items: (OrderItem & {product: Product})[]} | undefined> {
    const order = await this.getOrder(id);
    
    if (!order) return undefined;
    
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        products:product_id (*)
      `)
      .eq('order_id', id);
      
    if (itemsError) throw new Error(`Erro ao buscar itens do pedido: ${itemsError.message}`);
    
    const items = (itemsData || []).map((item: any) => {
      return {
        ...this.mapOrderItemFromSupabase(item),
        product: this.mapProductFromSupabase(item.products)
      };
    });
    
    return { order, items };
  }
  
  async createOrder(orderData: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    // Gerar número da senha do pedido
    const ticketNumber = await this.generateTicketNumber();
    
    // Iniciar transação
    const { data: orderResult, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: String(orderData.userId), // Convertendo para string (UUID)
        status: orderData.status,
        total: orderData.total,
        address: orderData.address,
        ticket_number: ticketNumber
      })
      .select()
      .single();
      
    if (orderError) throw new Error(`Erro ao criar pedido: ${orderError.message}`);
    
    // Inserir itens do pedido
    const orderItems = items.map(item => ({
      order_id: orderResult.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
      
    if (itemsError) throw new Error(`Erro ao inserir itens do pedido: ${itemsError.message}`);
    
    return this.mapOrderFromSupabase(orderResult);
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error || !data) return undefined;
    
    return this.mapOrderFromSupabase(data);
  }
  
  // ===== Pagamentos =====
  async getPayment(id: number): Promise<Payment | undefined> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error || !data) return undefined;
    
    return this.mapPaymentFromSupabase(data);
  }
  
  async getPaymentByOrder(orderId: number): Promise<Payment | undefined> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single();
      
    if (error || !data) return undefined;
    
    return this.mapPaymentFromSupabase(data);
  }
  
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        order_id: payment.orderId,
        method: payment.method,
        status: payment.status,
        external_id: payment.externalId || null,
        amount: payment.amount
      })
      .select()
      .single();
      
    if (error) throw new Error(`Erro ao criar pagamento: ${error.message}`);
    
    return this.mapPaymentFromSupabase(data);
  }
  
  async updatePaymentStatus(id: number, status: string): Promise<Payment | undefined> {
    const { data, error } = await supabase
      .from('payments')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error || !data) return undefined;
    
    return this.mapPaymentFromSupabase(data);
  }
  
  // ===== Dashboard =====
  async getDashboardStats(): Promise<{
    totalOrders: number;
    totalSales: number;
    pendingOrders: number;
    productCount: number;
  }> {
    // Total de pedidos
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });
    
    // Total de vendas (soma dos totais dos pedidos)
    const { data: salesData } = await supabase
      .from('orders')
      .select('total')
      .eq('status', 'concluido');
    
    const totalSales = salesData?.reduce((sum: number, order: { total: number }) => sum + order.total, 0) || 0;
    
    // Pedidos pendentes
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pendente', 'confirmado', 'preparo', 'pronto']);
    
    // Total de produtos
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    return {
      totalOrders: totalOrders || 0,
      totalSales,
      pendingOrders: pendingOrders || 0,
      productCount: productCount || 0
    };
  }
  
  // ===== Métodos auxiliares para mapear dados do Supabase =====
  private mapUserFromSupabase(data: any): User {
    return {
      id: Number(data.id), // Convertendo UUID para número
      name: data.name,
      email: data.email,
      password: data.password,
      address: data.address || undefined,
      phone: data.phone || undefined,
      type: data.type,
      createdAt: new Date(data.created_at)
    };
  }
  
  private mapCategoryFromSupabase(data: any): Category {
    return {
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      imageUrl: data.image_url || undefined
    };
  }
  
  private mapProductFromSupabase(data: any): Product {
    return {
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      price: data.price,
      imageUrl: data.image_url || undefined,
      isFeatured: data.is_featured,
      isPromotion: data.is_promotion,
      oldPrice: data.old_price || undefined,
      categoryId: data.category_id,
      available: data.available,
      createdAt: new Date(data.created_at)
    };
  }
  
  private mapOrderFromSupabase(data: any): Order {
    return {
      id: data.id,
      userId: Number(data.user_id), // Convertendo UUID para número
      status: data.status,
      total: data.total,
      address: data.address,
      ticketNumber: data.ticket_number,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
  
  private mapOrderItemFromSupabase(data: any): OrderItem {
    return {
      id: data.id,
      orderId: data.order_id,
      productId: data.product_id,
      quantity: data.quantity,
      price: data.price,
      subtotal: data.subtotal
    };
  }
  
  private mapPaymentFromSupabase(data: any): Payment {
    return {
      id: data.id,
      orderId: data.order_id,
      method: data.method,
      status: data.status,
      externalId: data.external_id || undefined,
      amount: data.amount,
      createdAt: new Date(data.created_at)
    };
  }
  
  // ===== Geração de senhas =====
  private async generateTicketNumber(): Promise<string> {
    // Buscar senhas geradas hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: configData } = await supabase
      .from('system_info')
      .select('value')
      .eq('key', 'ticket_counter')
      .single();
      
    let currentLetter = 'A';
    let currentNumber = 1;
    
    if (configData && configData.value) {
      const storedData = configData.value as any;
      
      // Verificar se a data armazenada é de hoje
      if (storedData.date === today.toISOString().split('T')[0]) {
        currentLetter = storedData.letter;
        currentNumber = storedData.number + 1;
        
        // Se o número passar de 99, avançar para a próxima letra
        if (currentNumber > 99) {
          currentLetter = String.fromCharCode(currentLetter.charCodeAt(0) + 1);
          currentNumber = 1;
        }
      }
    }
    
    // Atualizar contador no banco
    await supabase
      .from('system_info')
      .upsert({
        key: 'ticket_counter',
        value: {
          date: today.toISOString().split('T')[0],
          letter: currentLetter,
          number: currentNumber
        }
      });
    
    // Formatação: A01, A02, ..., B01, ...
    return `${currentLetter}${currentNumber.toString().padStart(2, '0')}`;
  }
} 