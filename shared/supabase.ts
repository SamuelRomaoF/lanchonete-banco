import { IS_MOCK_MODE } from '../client/src/config';

// Importações condicionais baseadas no ambiente
let supabaseClient;

// Em produção, usamos o mock, em desenvolvimento usamos o Supabase real
if (IS_MOCK_MODE) {
  // Em produção, usamos o mock que criamos
  console.log('Usando cliente Supabase mockado');
  
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
    from: (table) => ({
      select: () => ({
        eq: () => ({
          data: [],
          error: null
        }),
        data: [],
        error: null
      }),
      insert: (data) => ({
        data,
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