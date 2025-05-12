import { IS_MOCK_MODE } from '../client/src/config';

// Importações condicionais baseadas no ambiente
let supabaseClient;

// Em produção, usamos o mock, em desenvolvimento usamos o Supabase real
if (IS_MOCK_MODE) {
  // Em produção, usamos o mock que criamos
  console.log('Usando cliente Supabase mockado');
  
  // Função para criar um objeto de resposta padrão
  const mockResponse = <T>(data: T) => ({
    data,
    error: null
  });
  
  // Implementação mock simples para evitar erros
  supabaseClient = {
    auth: {
      getSession: async () => ({
        data: {
          session: {
            user: {
              id: "mock-user-123",
              email: "usuario@exemplo.com",
              user_metadata: {
                name: "Usuário Teste",
                type: "customer"
              }
            }
          }
        },
        error: null
      }),
      getUser: async () => ({
        data: {
          user: {
            id: "mock-user-123",
            email: "usuario@exemplo.com",
            user_metadata: {
              name: "Usuário Teste",
              type: "customer"
            }
          }
        },
        error: null
      }),
      signInWithPassword: async () => ({
        data: {
          user: {
            id: "mock-user-123",
            email: "usuario@exemplo.com",
            user_metadata: {
              name: "Usuário Teste",
              type: "customer"
            }
          },
          session: {
            access_token: "mock-token"
          }
        },
        error: null
      }),
      signUp: async () => ({
        data: {
          user: {
            id: "mock-new-user-789",
            email: "novo@exemplo.com",
            user_metadata: {
              name: "Novo Usuário",
              type: "customer"
            }
          },
          session: {
            access_token: "mock-token-new"
          }
        },
        error: null
      }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } }
      })
    },
    from: (table) => {
      // Mock de perfil de usuário padrão para qualquer tabela
      const mockProfile = {
        id: "mock-user-123",
        user_id: "mock-user-123",
        name: "Usuário Teste",
        email: "usuario@exemplo.com",
        type: "customer",
        created_at: new Date().toISOString()
      };

      // Lista de produtos em destaque
      const featuredProducts = [
        { 
          id: 1, 
          name: 'X-Burger', 
          price: 20.9, 
          description: 'Delicioso hambúrguer com queijo', 
          imageUrl: 'https://via.placeholder.com/200',
          categoryId: 1,
          is_featured: true,
          is_promotion: false
        },
        { 
          id: 3, 
          name: 'Sundae', 
          price: 8.9, 
          description: 'Sorvete com calda de chocolate', 
          imageUrl: 'https://via.placeholder.com/200',
          categoryId: 3,
          is_featured: true,
          is_promotion: false 
        }
      ];

      // Lista de produtos em promoção
      const promotionProducts = [
        { 
          id: 2, 
          name: 'Coca-Cola', 
          price: 6.5, 
          description: 'Refrigerante 350ml', 
          imageUrl: 'https://via.placeholder.com/200',
          categoryId: 2,
          is_featured: false,
          is_promotion: true
        }
      ];

      // Ofertas ativas
      const activeOffers = [
        {
          id: 1,
          title: 'Combo Econômico',
          description: 'Hambúrguer + Batata + Refrigerante',
          price: 25.9,
          original_price: 32.5,
          imageUrl: 'https://via.placeholder.com/200',
          active: true,
          created_at: new Date().toISOString()
        }
      ];
      
      // Cria um objeto de consulta (query builder)
      return {
        select: () => {
          const queryBuilder = {
            data: getMockData(table),
            
            // Método eq para filtro
            eq: (column, value) => {
              console.log(`[Mock Supabase] Filtro: ${table}.${column} = ${value}`);
              
              // Filtros específicos conhecidos
              if (table === 'profiles' && column === 'user_id') {
                return {
                  single: () => mockResponse(mockProfile),
                  data: [mockProfile],
                  error: null
                };
              }
              
              if (table === 'products' && column === 'is_featured' && value === true) {
                return {
                  data: featuredProducts,
                  error: null
                };
              }
              
              if (table === 'products' && column === 'is_promotion' && value === true) {
                return {
                  data: promotionProducts,
                  error: null
                };
              }
              
              if (table === 'offers' && column === 'active' && value === true) {
                return {
                  data: activeOffers,
                  error: null
                };
              }

              if (column === 'id' && value === 'mock-user-123') {
                return {
                  single: () => mockResponse(mockProfile),
                  data: [mockProfile],
                  error: null
                };
              }
              
              // Para outras tabelas, tenta filtrar
              try {
                const filteredData = Array.isArray(queryBuilder.data) ? 
                  queryBuilder.data.filter(item => 
                    item && typeof item === 'object' && column in item && item[column] === value
                  ) : [];
                
                return {
                  single: () => mockResponse(filteredData.length > 0 ? filteredData[0] : null),
                  data: filteredData,
                  error: null
                };
              } catch (error) {
                console.error(`[Mock Supabase] Erro ao filtrar: ${error}`);
                return {
                  single: () => mockResponse(null),
                  data: [],
                  error: null
                };
              }
            },
            
            // Método single para retornar um único item
            single: () => mockResponse(Array.isArray(queryBuilder.data) && queryBuilder.data.length > 0 ? queryBuilder.data[0] : null)
          };
          
          return queryBuilder;
        },
        insert: (data) => mockResponse(data),
        update: (data) => mockResponse(data),
        delete: () => mockResponse(null)
      };
    }
  };
} else {
  // Em desenvolvimento, usamos o cliente real do Supabase
  const { createClient } = require('@supabase/supabase-js');

  // As URLs e chaves são fornecidas através de variáveis de ambiente
  // Valores padrão são fornecidos apenas para desenvolvimento
  const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 
                    process.env.SUPABASE_URL || 
                    'https://icjdxrhzuplphrtjlnaw.supabase.co';

  const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 
                    process.env.SUPABASE_ANON_KEY || 
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljamR4cmh6dXBscGhydGpsbmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NzcyNTcsImV4cCI6MjA2MjU1MzI1N30.lv7KaIoFMZQUA334qvcu09BEEOPOb-vVz6O_mJ8i1PI';

  // Criação do cliente Supabase
  supabaseClient = createClient(supabaseUrl, supabaseKey);
}

// Função para obter dados de exemplo baseados na tabela
function getMockData(table) {
  switch (table) {
    case 'profiles':
      return [
        {
          id: 'mock-user-123',
          user_id: 'mock-user-123',
          name: 'Usuário Teste',
          email: 'usuario@exemplo.com',
          type: 'customer',
          created_at: new Date().toISOString()
        },
        {
          id: 'mock-admin-456',
          user_id: 'mock-admin-456',
          name: 'Admin Teste',
          email: 'admin@exemplo.com',
          type: 'admin',
          created_at: new Date().toISOString()
        }
      ];
    case 'categories':
      return [
        { id: 1, name: 'Hambúrgueres', imageUrl: 'https://via.placeholder.com/200' },
        { id: 2, name: 'Bebidas', imageUrl: 'https://via.placeholder.com/200' },
        { id: 3, name: 'Sobremesas', imageUrl: 'https://via.placeholder.com/200' }
      ];
    case 'products':
      return [
        { 
          id: 1, 
          name: 'X-Burger', 
          price: 20.9, 
          description: 'Delicioso hambúrguer com queijo', 
          imageUrl: 'https://via.placeholder.com/200',
          categoryId: 1,
          is_featured: true,
          is_promotion: false
        },
        { 
          id: 2, 
          name: 'Coca-Cola', 
          price: 6.5, 
          description: 'Refrigerante 350ml', 
          imageUrl: 'https://via.placeholder.com/200',
          categoryId: 2,
          is_featured: false,
          is_promotion: true
        },
        { 
          id: 3, 
          name: 'Sundae', 
          price: 8.9, 
          description: 'Sorvete com calda de chocolate', 
          imageUrl: 'https://via.placeholder.com/200',
          categoryId: 3,
          is_featured: true,
          is_promotion: false
        }
      ];
    case 'offers':
      return [
        {
          id: 1,
          title: 'Combo Econômico',
          description: 'Hambúrguer + Batata + Refrigerante',
          price: 25.9,
          original_price: 32.5,
          imageUrl: 'https://via.placeholder.com/200',
          active: true,
          created_at: new Date().toISOString()
        }
      ];
    default:
      return [];
  }
}

// Exportação do cliente
export const supabase = supabaseClient;

// Função para verificar conexão
export async function testConnection() {
  try {
    if (IS_MOCK_MODE) {
      return { success: true, data: [{ version: 'MOCK' }] };
    }
    
    const { data, error } = await supabase.from('system_info').select('*').limit(1);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' };
  }
} 