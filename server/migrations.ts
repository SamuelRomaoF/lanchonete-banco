import { supabase } from '../shared/supabase';

interface MigrationResult {
  success: boolean;
  error?: string | Error;
}

// Função para executar as migrações iniciais do banco de dados
export async function runMigrations(): Promise<MigrationResult> {
  try {
    console.log('Iniciando migrações do banco de dados...');

    // 1. Criar tabela de system_info se não existir
    const { error: systemTableError } = await supabase.rpc('create_system_info_if_not_exists');
    
    if (systemTableError) {
      // Se a função RPC não existir, criar diretamente por SQL
      const { error } = await supabase.from('system_info').select('*').limit(1);
      
      if (error && error.code === '42P01') { // Tabela não existe
        const { error: createError } = await supabase.query(`
          CREATE TABLE public.system_info (
            id SERIAL PRIMARY KEY,
            key TEXT NOT NULL UNIQUE,
            value JSONB NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);
        
        if (createError) throw new Error(`Erro ao criar tabela system_info: ${createError.message}`);
      }
    }

    // 2. Criar tabelas básicas conforme tipos definidos em supabase.types.ts
    
    // Usuários
    const { error: usersError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        address TEXT,
        phone TEXT,
        type TEXT NOT NULL CHECK (type IN ('cliente', 'admin')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    if (usersError) throw new Error(`Erro ao criar tabela users: ${usersError.message}`);

    // Categorias
    const { error: categoriesError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS public.categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    if (categoriesError) throw new Error(`Erro ao criar tabela categories: ${categoriesError.message}`);

    // Produtos
    const { error: productsError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS public.products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price NUMERIC(10,2) NOT NULL,
        image_url TEXT,
        is_featured BOOLEAN DEFAULT FALSE,
        is_promotion BOOLEAN DEFAULT FALSE,
        old_price NUMERIC(10,2),
        category_id INTEGER NOT NULL REFERENCES public.categories(id),
        available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    if (productsError) throw new Error(`Erro ao criar tabela products: ${productsError.message}`);

    // Pedidos
    const { error: ordersError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS public.orders (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES public.users(id),
        status TEXT NOT NULL CHECK (status IN ('pendente', 'confirmado', 'preparo', 'pronto', 'entrega', 'concluido', 'cancelado')) DEFAULT 'pendente',
        total NUMERIC(10,2) NOT NULL,
        address TEXT NOT NULL,
        ticket_number TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    if (ordersError) throw new Error(`Erro ao criar tabela orders: ${ordersError.message}`);

    // Itens de Pedido
    const { error: orderItemsError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS public.order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES public.orders(id),
        product_id INTEGER NOT NULL REFERENCES public.products(id),
        quantity INTEGER NOT NULL,
        price NUMERIC(10,2) NOT NULL,
        subtotal NUMERIC(10,2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    if (orderItemsError) throw new Error(`Erro ao criar tabela order_items: ${orderItemsError.message}`);

    // Pagamentos
    const { error: paymentsError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS public.payments (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES public.orders(id),
        method TEXT NOT NULL CHECK (method IN ('pix', 'cartao')),
        status TEXT NOT NULL DEFAULT 'pendente',
        external_id TEXT,
        amount NUMERIC(10,2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    if (paymentsError) throw new Error(`Erro ao criar tabela payments: ${paymentsError.message}`);

    // 3. Criar tabelas do plano intermediário (estoque e fornecedores)
    const { error: suppliersError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS public.suppliers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    if (suppliersError) throw new Error(`Erro ao criar tabela suppliers: ${suppliersError.message}`);

    const { error: inventoryError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS public.inventory_items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        quantity NUMERIC(10,2) NOT NULL,
        unit TEXT NOT NULL,
        min_quantity NUMERIC(10,2) DEFAULT 0,
        supplier_id INTEGER REFERENCES public.suppliers(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    if (inventoryError) throw new Error(`Erro ao criar tabela inventory_items: ${inventoryError.message}`);

    // 4. Criar tabelas do plano premium (clientes)
    const { error: customersError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS public.customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES public.users(id),
        points INTEGER DEFAULT 0,
        birth_date DATE,
        preferences JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    if (customersError) throw new Error(`Erro ao criar tabela customers: ${customersError.message}`);

    // 5. Criar um valor inicial para o contador de senhas
    const today = new Date();
    const { error: ticketCounterError } = await supabase
      .from('system_info')
      .upsert({
        key: 'ticket_counter',
        value: {
          date: today.toISOString().split('T')[0],
          letter: 'A',
          number: 0
        }
      });
    
    if (ticketCounterError) throw new Error(`Erro ao criar contador de senhas: ${ticketCounterError.message}`);

    // 6. Criar usuário admin padrão se não existir
    const { data: adminCheck } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'admin@fastlanche.com.br')
      .limit(1);
      
    if (!adminCheck || adminCheck.length === 0) {
      const { error: adminError } = await supabase
        .from('users')
        .insert({
          name: 'Administrador',
          email: 'admin@fastlanche.com.br',
          password: '$2b$10$17oZbz2OB4KqF3Hd5pKV8.ME54Jmxks9EvCTB2Lh0bgKN7m.ccHRe', // admin123
          type: 'admin'
        });
        
      if (adminError) throw new Error(`Erro ao criar usuário admin: ${adminError.message}`);
    }

    console.log('Migrações concluídas com sucesso!');
    return { success: true };
  } catch (error) {
    console.error('Erro nas migrações:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: String(error) };
  }
} 