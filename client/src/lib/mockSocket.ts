/**
 * Mock da biblioteca socket.io-client para ambientes sem backend
 */
import { IS_MOCK_MODE } from '@/config';

// Mock do objeto de socket
export const createMockSocket = () => {
  // Objeto que simula um socket
  const mockSocket = {
    id: 'mock-socket-123',
    connected: true,
    disconnected: false,
    
    // Armazenar callbacks de eventos para simular o comportamento
    eventHandlers: {} as Record<string, Function[]>,
    
    // Registra um handler para um evento
    on(event: string, callback: Function) {
      if (!this.eventHandlers[event]) {
        this.eventHandlers[event] = [];
      }
      this.eventHandlers[event].push(callback);
      return this;
    },
    
    // Remove um handler de um evento
    off(event: string, callback?: Function) {
      if (callback && this.eventHandlers[event]) {
        this.eventHandlers[event] = this.eventHandlers[event].filter(
          handler => handler !== callback
        );
      } else {
        this.eventHandlers[event] = [];
      }
      return this;
    },
    
    // Emite um evento para o "servidor"
    emit(event: string, ...args: any[]) {
      console.log(`[Mock Socket] Emitido evento '${event}' com args:`, ...args);
      
      // Simular respostas específicas para certos eventos
      if (event === 'customer:subscribe') {
        setTimeout(() => {
          this.triggerEvent('order:updated', {
            id: 123,
            status: 'preparo',
            ticketNumber: 'A123'
          });
        }, 3000);
      }
      
      return this;
    },
    
    // Método para desconectar o socket
    disconnect() {
      this.connected = false;
      this.disconnected = true;
      console.log('[Mock Socket] Desconectado');
      
      if (this.eventHandlers['disconnect']) {
        this.eventHandlers['disconnect'].forEach(callback => {
          callback();
        });
      }
      
      return this;
    },
    
    // Método interno para simular eventos recebidos
    triggerEvent(event: string, ...args: any[]) {
      if (this.eventHandlers[event]) {
        this.eventHandlers[event].forEach(callback => {
          callback(...args);
        });
      }
      return this;
    }
  };
  
  // Simular conexão após um pequeno delay
  setTimeout(() => {
    if (mockSocket.eventHandlers['connect']) {
      mockSocket.eventHandlers['connect'].forEach(callback => {
        callback();
      });
    }
  }, 500);
  
  return mockSocket;
};

// Função que simula a função io do socket.io-client
export function mockIO(url?: string, options?: any) {
  console.log(`[Mock Socket] Conectando a ${url || 'servidor padrão'}`);
  return createMockSocket();
}

// Verificar se devemos exportar o mock ou a biblioteca real
if (IS_MOCK_MODE) {
  // Exportar nossa implementação de mock
  console.log('Usando Socket.IO mockado');
}

// Exportar o mock para uso direto
export default mockIO; 