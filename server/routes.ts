import { insertCategorySchema, insertOrderItemSchema, insertOrderSchema, insertPaymentSchema, insertProductSchema, insertUserSchema } from "@shared/schema";
import * as bcrypt from 'bcrypt';
import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { config } from './config';
import { IStorage, MemStorage } from "./storage";
import { SupabaseStorage } from './supabase-storage';

// Inicializar o armazenamento correto de acordo com a configuração
let storageInstance: IStorage;

if (config.storage.type === 'supabase') {
  storageInstance = new SupabaseStorage();
  console.log('Usando armazenamento Supabase');
} else {
  storageInstance = new MemStorage();
  console.log('Usando armazenamento em memória');
}

// Função para lidar com erros do Zod
function handleZodError(error: z.ZodError) {
  return { 
    message: "Erro de validação", 
    errors: error.errors.map(e => ({
      path: e.path.join('.'),
      message: e.message
    }))
  };
}

// Middleware para verificar autenticação
const authMiddleware = (req: Request, res: Response, next: Function) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Usuário não autenticado" });
  }
  
  next();
};

// Middleware para verificar se é admin
const adminMiddleware = (req: Request, res: Response, next: Function) => {
  if (!req.session.user || req.session.user.type !== 'admin') {
    return res.status(403).json({ message: "Acesso restrito a administradores" });
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // ==== Rotas de autenticação ====
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email e senha são obrigatórios" });
      }
      
      const user = await storageInstance.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
      
      // Salvar usuário na sessão
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type
      };
      
      // Não retornar a senha
      const { password: _, ...userWithoutPassword } = user;
      
      return res.status(200).json({ 
        message: "Login realizado com sucesso",
        user: userWithoutPassword
      });
      
    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(500).json({ message: "Erro ao realizar login" });
    }
  });
  
  app.post('/api/auth/register', async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json(handleZodError(result.error));
      }
      
      const { email, password, ...userData } = result.data;
      
      // Verificar se email já existe
      const existingUser = await storageInstance.getUserByEmail(email);
      
      if (existingUser) {
        return res.status(400).json({ message: "Email já cadastrado" });
      }
      
      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Criar novo usuário
      const newUser = await storageInstance.createUser({
        ...userData,
        email,
        password: hashedPassword,
        type: 'cliente' // Sempre registrar como cliente
      });
      
      // Não retornar a senha
      const { password: _, ...userWithoutPassword } = newUser;
      
      return res.status(201).json({
        message: "Usuário cadastrado com sucesso",
        user: userWithoutPassword
      });
      
    } catch (error) {
      console.error('Erro no registro:', error);
      return res.status(500).json({ message: "Erro ao cadastrar usuário" });
    }
  });
  
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      
      res.clearCookie('connect.sid');
      return res.status(200).json({ message: "Logout realizado com sucesso" });
    });
  });
  
  app.get('/api/auth/me', (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }
    
    return res.status(200).json({ user: req.session.user });
  });
  
  // ==== Rotas de categorias ====
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storageInstance.getCategories();
      return res.status(200).json(categories);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return res.status(500).json({ message: "Erro ao buscar categorias" });
    }
  });
  
  app.get('/api/categories/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const category = await storageInstance.getCategory(id);
      
      if (!category) {
        return res.status(404).json({ message: "Categoria não encontrada" });
      }
      
      return res.status(200).json(category);
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      return res.status(500).json({ message: "Erro ao buscar categoria" });
    }
  });
  
  app.post('/api/categories', adminMiddleware, async (req, res) => {
    try {
      const result = insertCategorySchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json(handleZodError(result.error));
      }
      
      const newCategory = await storageInstance.createCategory(result.data);
      
      return res.status(201).json({
        message: "Categoria criada com sucesso",
        category: newCategory
      });
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      return res.status(500).json({ message: "Erro ao criar categoria" });
    }
  });
  
  app.put('/api/categories/:id', adminMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const result = insertCategorySchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json(handleZodError(result.error));
      }
      
      const updatedCategory = await storageInstance.updateCategory(id, result.data);
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Categoria não encontrada" });
      }
      
      return res.status(200).json({
        message: "Categoria atualizada com sucesso",
        category: updatedCategory
      });
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      return res.status(500).json({ message: "Erro ao atualizar categoria" });
    }
  });
  
  app.delete('/api/categories/:id', adminMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const success = await storageInstance.deleteCategory(id);
      
      if (!success) {
        return res.status(404).json({ message: "Categoria não encontrada" });
      }
      
      return res.status(200).json({
        message: "Categoria excluída com sucesso"
      });
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      return res.status(500).json({ message: "Erro ao excluir categoria" });
    }
  });
  
  // ==== Rotas de produtos ====
  app.get('/api/products', async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      
      let products;
      
      if (categoryId && !isNaN(categoryId)) {
        products = await storageInstance.getProductsByCategory(categoryId);
      } else {
        products = await storageInstance.getProducts();
      }
      
      return res.status(200).json(products);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return res.status(500).json({ message: "Erro ao buscar produtos" });
    }
  });
  
  app.get('/api/products/featured', async (req, res) => {
    try {
      const products = await storageInstance.getFeaturedProducts();
      return res.status(200).json(products);
    } catch (error) {
      console.error('Erro ao buscar produtos em destaque:', error);
      return res.status(500).json({ message: "Erro ao buscar produtos em destaque" });
    }
  });
  
  app.get('/api/products/promotions', async (req, res) => {
    try {
      const products = await storageInstance.getPromotionProducts();
      return res.status(200).json(products);
    } catch (error) {
      console.error('Erro ao buscar produtos em promoção:', error);
      return res.status(500).json({ message: "Erro ao buscar produtos em promoção" });
    }
  });
  
  app.get('/api/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const product = await storageInstance.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      
      return res.status(200).json(product);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      return res.status(500).json({ message: "Erro ao buscar produto" });
    }
  });
  
  app.post('/api/products', adminMiddleware, async (req, res) => {
    try {
      const result = insertProductSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json(handleZodError(result.error));
      }
      
      const newProduct = await storageInstance.createProduct(result.data);
      
      return res.status(201).json({
        message: "Produto criado com sucesso",
        product: newProduct
      });
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      return res.status(500).json({ message: "Erro ao criar produto" });
    }
  });
  
  app.put('/api/products/:id', adminMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const result = insertProductSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json(handleZodError(result.error));
      }
      
      const updatedProduct = await storageInstance.updateProduct(id, result.data);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      
      return res.status(200).json({
        message: "Produto atualizado com sucesso",
        product: updatedProduct
      });
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      return res.status(500).json({ message: "Erro ao atualizar produto" });
    }
  });
  
  app.delete('/api/products/:id', adminMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const success = await storageInstance.deleteProduct(id);
      
      if (!success) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      
      return res.status(200).json({
        message: "Produto excluído com sucesso"
      });
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      return res.status(500).json({ message: "Erro ao excluir produto" });
    }
  });
  
  // ==== Rotas de pedidos ====
  app.get('/api/orders', adminMiddleware, async (req, res) => {
    try {
      const orders = await storageInstance.getOrders();
      return res.status(200).json(orders);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      return res.status(500).json({ message: "Erro ao buscar pedidos" });
    }
  });
  
  app.get('/api/users/:userId/orders', authMiddleware, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const sessionUser = (req as any).session.user;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "ID de usuário inválido" });
      }
      
      // Verificar se o usuário está buscando seus próprios pedidos ou é um admin
      if (sessionUser.id !== userId && sessionUser.type !== 'admin') {
        return res.status(403).json({ message: "Não autorizado a ver pedidos de outro usuário" });
      }
      
      const orders = await storageInstance.getOrdersByUser(userId);
      return res.status(200).json(orders);
    } catch (error) {
      console.error('Erro ao buscar pedidos do usuário:', error);
      return res.status(500).json({ message: "Erro ao buscar pedidos do usuário" });
    }
  });
  
  app.get('/api/orders/:id', authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sessionUser = (req as any).session.user;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const orderDetails = await storageInstance.getOrderWithItems(id);
      
      if (!orderDetails) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }
      
      // Verificar se o usuário está buscando seu próprio pedido ou é um admin
      if (sessionUser.id !== orderDetails.order.userId && sessionUser.type !== 'admin') {
        return res.status(403).json({ message: "Não autorizado a ver este pedido" });
      }
      
      return res.status(200).json(orderDetails);
    } catch (error) {
      console.error('Erro ao buscar detalhes do pedido:', error);
      return res.status(500).json({ message: "Erro ao buscar detalhes do pedido" });
    }
  });
  
  app.post('/api/orders', authMiddleware, async (req, res) => {
    try {
      const { order, items } = req.body;
      
      if (!order || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Dados do pedido inválidos" });
      }
      
      const orderResult = insertOrderSchema.safeParse(order);
      
      if (!orderResult.success) {
        return res.status(400).json(handleZodError(orderResult.error));
      }
      
      // Validar cada item do pedido
      const validItems = [];
      let hasError = false;
      let errorMessage = "";
      
      for (const item of items) {
        const itemResult = insertOrderItemSchema.safeParse(item);
        
        if (!itemResult.success) {
          hasError = true;
          errorMessage = "Item de pedido inválido";
          break;
        }
        
        const product = await storageInstance.getProduct(item.productId);
        
        if (!product) {
          hasError = true;
          errorMessage = `Produto ${item.productId} não encontrado`;
          break;
        }
        
        if (!product.available) {
          hasError = true;
          errorMessage = `Produto ${product.name} não está disponível`;
          break;
        }
        
        validItems.push(itemResult.data);
      }
      
      if (hasError) {
        return res.status(400).json({ message: errorMessage });
      }
      
      // Criar pedido
      const newOrder = await storageInstance.createOrder(orderResult.data, validItems);
      
      // Obter detalhes completos do pedido com os produtos
      const orderDetails = await storageInstance.getOrderWithItems(newOrder.id);
      
      // Notificar via websocket
      if (orderDetails) {
        notifyNewOrder(orderDetails);
      }
      
      return res.status(201).json({
        message: "Pedido criado com sucesso",
        order: newOrder
      });
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      return res.status(500).json({ message: "Erro ao criar pedido" });
    }
  });
  
  app.patch('/api/orders/:id/status', adminMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      if (!status || !['pendente', 'confirmado', 'preparo', 'entrega', 'concluido', 'cancelado'].includes(status)) {
        return res.status(400).json({ message: "Status inválido" });
      }
      
      const updatedOrder = await storageInstance.updateOrderStatus(id, status);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }
      
      // Notificar via websocket
      notifyOrderStatusUpdated(updatedOrder);
      
      return res.status(200).json({
        message: "Status do pedido atualizado com sucesso",
        order: updatedOrder
      });
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      return res.status(500).json({ message: "Erro ao atualizar status do pedido" });
    }
  });
  
  // ==== Rotas de pagamentos ====
  app.post('/api/payments', authMiddleware, async (req, res) => {
    try {
      const result = insertPaymentSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json(handleZodError(result.error));
      }
      
      const { orderId } = result.data;
      
      // Verificar se o pedido existe
      const order = await storageInstance.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }
      
      // Verificar se já existe pagamento para este pedido
      const existingPayment = await storageInstance.getPaymentByOrder(orderId);
      
      if (existingPayment) {
        return res.status(400).json({ message: "Já existe um pagamento para este pedido" });
      }
      
      // Criar pagamento
      const newPayment = await storageInstance.createPayment(result.data);
      
      // Atualizar status do pedido para confirmado
      await storageInstance.updateOrderStatus(orderId, 'confirmado');
      
      return res.status(201).json({
        message: "Pagamento registrado com sucesso",
        payment: newPayment
      });
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      return res.status(500).json({ message: "Erro ao registrar pagamento" });
    }
  });
  
  app.get('/api/payments/:id', authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const payment = await storageInstance.getPayment(id);
      
      if (!payment) {
        return res.status(404).json({ message: "Pagamento não encontrado" });
      }
      
      return res.status(200).json(payment);
    } catch (error) {
      console.error('Erro ao buscar pagamento:', error);
      return res.status(500).json({ message: "Erro ao buscar pagamento" });
    }
  });
  
  app.get('/api/orders/:orderId/payment', authMiddleware, async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "ID de pedido inválido" });
      }
      
      const payment = await storageInstance.getPaymentByOrder(orderId);
      
      if (!payment) {
        return res.status(404).json({ message: "Pagamento não encontrado para este pedido" });
      }
      
      return res.status(200).json(payment);
    } catch (error) {
      console.error('Erro ao buscar pagamento do pedido:', error);
      return res.status(500).json({ message: "Erro ao buscar pagamento do pedido" });
    }
  });
  
  app.patch('/api/payments/:id/status', adminMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      if (!status || !['pendente', 'aprovado', 'recusado'].includes(status)) {
        return res.status(400).json({ message: "Status inválido" });
      }
      
      const updatedPayment = await storageInstance.updatePaymentStatus(id, status);
      
      if (!updatedPayment) {
        return res.status(404).json({ message: "Pagamento não encontrado" });
      }
      
      // Se o pagamento for aprovado, atualizar status do pedido para em preparo
      if (status === 'aprovado') {
        await storageInstance.updateOrderStatus(updatedPayment.orderId, 'preparo');
      }
      
      // Se o pagamento for recusado, atualizar status do pedido para cancelado
      if (status === 'recusado') {
        await storageInstance.updateOrderStatus(updatedPayment.orderId, 'cancelado');
      }
      
      return res.status(200).json({
        message: "Status do pagamento atualizado com sucesso",
        payment: updatedPayment
      });
    } catch (error) {
      console.error('Erro ao atualizar status do pagamento:', error);
      return res.status(500).json({ message: "Erro ao atualizar status do pagamento" });
    }
  });
  
  // ==== Rota de dashboard para admin ====
  app.get('/api/admin/dashboard', adminMiddleware, async (req, res) => {
    try {
      const stats = await storageInstance.getDashboardStats();
      return res.status(200).json(stats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      return res.status(500).json({ message: "Erro ao buscar estatísticas do dashboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
