// Configurações do aplicativo com valores padrão seguros
export const config = {
  // Configurações do servidor
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  
  // Configurações de sessão
  session: {
    secret: process.env.SESSION_SECRET || 'fale-comigo-dev-secret',
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  },
  
  // Configurações do Supabase
  supabase: {
    url: process.env.SUPABASE_URL || 'https://icjdxrhzuplphrtjlnaw.supabase.co',
    anonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljamR4cmh6dXBscGhydGpsbmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NzcyNTcsImV4cCI6MjA2MjU1MzI1N30.lv7KaIoFMZQUA334qvcu09BEEOPOb-vVz6O_mJ8i1PI',
    serviceKey: process.env.SUPABASE_SERVICE_KEY || ''
  },
  
  // Planos
  plans: {
    basic: 'basico',
    intermediate: 'intermediario',
    premium: 'premium'
  },
  
  // Configurações de armazenamento
  storage: {
    // Define qual tipo de armazenamento usar
    type: process.env.STORAGE_TYPE || 'supabase', // 'memory' ou 'supabase'
    
    // Configurações de persistência para armazenamento em memória
    persistFile: 'data/storage.json',
    autoSave: true,
    saveInterval: 5 * 60 * 1000 // 5 minutos
  },
  
  // Configurações gerais do estabelecimento (valores padrão)
  establishment: {
    name: 'Fast Lanche',
    openingTime: '10:00',
    closingTime: '22:00',
    workDays: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab']
  }
}; 