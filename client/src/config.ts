/**
 * Configurações da aplicação
 */

// URL base da API
export const API_URL = import.meta.env.VITE_API_URL || '';

// Controle de ambiente mock (sem back-end)
export const IS_MOCK_MODE = process.env.NODE_ENV === 'production';

// Função auxiliar para construir URLs da API
export const apiUrl = (path: string): string => {
  // Modo de mock ativado (produção sem backend)
  if (IS_MOCK_MODE) {
    return '/mock-api' + path;
  }
  
  // Em desenvolvimento, faz chamadas relativas
  if (!API_URL && process.env.NODE_ENV === 'development') {
    return path;
  }
  
  // Em produção, usa a URL completa configurada
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
}; 