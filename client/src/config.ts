/**
 * Configurações da aplicação
 */

// URL base da API
export const API_URL = import.meta.env.VITE_API_URL || '';

// Função auxiliar para construir URLs da API
export const apiUrl = (path: string): string => {
  // Em desenvolvimento, faz chamadas relativas
  if (!API_URL && process.env.NODE_ENV === 'development') {
    return path;
  }
  
  // Em produção, usa a URL completa configurada
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
}; 