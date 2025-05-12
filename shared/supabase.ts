import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase.types';

// As URLs e chaves são fornecidas através de variáveis de ambiente
// Valores padrão são fornecidos apenas para desenvolvimento
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 
                   process.env.SUPABASE_URL || 
                   'https://icjdxrhzuplphrtjlnaw.supabase.co';

const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 
                   process.env.SUPABASE_ANON_KEY || 
                   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljamR4cmh6dXBscGhydGpsbmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NzcyNTcsImV4cCI6MjA2MjU1MzI1N30.lv7KaIoFMZQUA334qvcu09BEEOPOb-vVz6O_mJ8i1PI';

// Criação do cliente Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Função para verificar conexão
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('system_info').select('*').limit(1);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' };
  }
} 