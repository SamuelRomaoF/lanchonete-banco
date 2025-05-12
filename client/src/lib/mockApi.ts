/**
 * Mock API para ambientes sem backend
 */
import { IS_MOCK_MODE } from "@/config";

// Sobrescrever o fetch global para interceptar chamadas de API
const originalFetch = window.fetch;

window.fetch = async function(input, init) {
  // Se não estiver em modo mock ou a URL não tem 'mock-api', usa o fetch original
  if (!IS_MOCK_MODE || (typeof input === 'string' && !input.includes('/mock-api'))) {
    return originalFetch(input, init);
  }

  // Extrair a URL independentemente do tipo de input
  let url: string;
  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof Request) {
    url = input.url;
  } else {
    url = input.toString();
  }
  
  console.log('Interceptando chamada para:', url);

  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Exemplo de ordem
  const mockOrder = {
    id: 123,
    userId: 1,
    total: 45.9,
    address: "Rua de Exemplo, 123",
    status: "confirmado",
    createdAt: new Date(),
    updatedAt: new Date(),
    ticketNumber: "A123"
  };
  
  // Exemplo de produto
  const mockProduct = {
    id: 1,
    name: "X-Burger",
    price: 20.9,
    description: "Delicioso hambúrguer com queijo",
    imageUrl: "https://via.placeholder.com/200",
    categoryId: 1,
    featured: true
  };
  
  // Exemplo de item de pedido
  const mockOrderItem = {
    id: 1,
    orderId: 123,
    productId: 1,
    quantity: 2,
    price: 20.9,
    subtotal: 41.8,
    product: mockProduct
  };
  
  // Rotas mockadas
  if (url.includes('/api/orders') && !url.includes('/api/orders/')) {
    // Lista de pedidos
    return new Response(JSON.stringify([mockOrder]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (url.includes('/api/orders/') && url.includes('/status')) {
    // Atualizar status do pedido
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (url.includes('/api/orders/')) {
    // Detalhes do pedido
    return new Response(JSON.stringify({
      order: mockOrder,
      items: [mockOrderItem]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (url.includes('/api/payments')) {
    // Criar pagamento
    return new Response(JSON.stringify({
      payment: {
        id: 1,
        orderId: 123,
        method: "pix",
        status: "pendente",
        amount: 45.9
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (url.includes('/api/users/')) {
    // Lista de pedidos do usuário
    return new Response(JSON.stringify([mockOrder]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Rota desconhecida
  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}; 