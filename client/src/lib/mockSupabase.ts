/**
 * Mock da biblioteca Supabase para ambientes sem backend
 */
import { IS_MOCK_MODE } from '@/config';

// Mock do objeto supabase
export const mockSupabase = {
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
    signInWithPassword: async ({ email, password }) => {
      if (email === "admin@exemplo.com" && password === "admin123") {
        return {
          data: {
            user: {
              id: "mock-admin-456",
              email: "admin@exemplo.com",
              user_metadata: {
                name: "Admin Teste",
                type: "admin"
              }
            },
            session: {
              access_token: "mock-token-admin"
            }
          },
          error: null
        };
      } else if (email === "usuario@exemplo.com" && password === "user123") {
        return {
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
              access_token: "mock-token-user"
            }
          },
          error: null
        };
      }
      
      return {
        data: { user: null, session: null },
        error: {
          message: "Email ou senha inválidos"
        }
      };
    },
    signUp: async ({ email, password, options }) => {
      return {
        data: {
          user: {
            id: "mock-new-user-789",
            email,
            user_metadata: {
              name: options?.data?.name || "Novo Usuário",
              type: "customer"
            }
          },
          session: {
            access_token: "mock-token-new-user"
          }
        },
        error: null
      };
    },
    signOut: async () => ({ error: null }),
    onAuthStateChange: (callback) => {
      // Simular um evento de login após um segundo
      setTimeout(() => {
        callback('SIGNED_IN', {
          user: {
            id: "mock-user-123",
            email: "usuario@exemplo.com",
            user_metadata: {
              name: "Usuário Teste",
              type: "customer"
            }
          }
        });
      }, 1000);
      
      // Retorna uma função para remover o listener
      return {
        data: { subscription: { unsubscribe: () => {} } }
      };
    }
  },
  from: (table) => ({
    select: () => {
      const mockData = getMockDataForTable(table);
      return {
        eq: () => ({
          data: mockData,
          error: null
        }),
        data: mockData,
        error: null
      };
    },
    insert: (data) => ({
      data: Array.isArray(data) 
        ? data.map((item, index) => ({ ...item, id: `mock-${index + 1}` }))
        : { ...data, id: 'mock-1' },
      error: null
    }),
    update: (data) => ({
      data,
      error: null
    }),
    delete: () => ({
      data: null,
      error: null
    })
  })
};

// Função para retornar dados de exemplo com base na tabela
function getMockDataForTable(table: string) {
  switch (table) {
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
          featured: true 
        },
        { 
          id: 2, 
          name: 'Coca-Cola', 
          price: 6.5, 
          description: 'Refrigerante 350ml', 
          imageUrl: 'https://via.placeholder.com/200',
          categoryId: 2,
          featured: false 
        },
        { 
          id: 3, 
          name: 'Sundae', 
          price: 8.9, 
          description: 'Sorvete com calda de chocolate', 
          imageUrl: 'https://via.placeholder.com/200',
          categoryId: 3,
          featured: true 
        }
      ];
    default:
      return [];
  }
}

// Exportar o cliente Supabase mockado ou o original com base no ambiente
let supabaseExport: any;

// Implementação de importação condicional para o ESM
if (IS_MOCK_MODE) {
  supabaseExport = mockSupabase;
  console.log('Usando Supabase mockado');
} else {
  // No ambiente de desenvolvimento, importamos normalmente
  // Isso será substituído pelo Vite no build
  supabaseExport = { supabase: null };
}

export default supabaseExport; 