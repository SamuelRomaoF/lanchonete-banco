import { Order, OrderItem, Product } from '@shared/schema';
import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

interface OrderWithItems {
  order: Order;
  items: (OrderItem & { product: Product })[];
}

// Interface do cliente socket
interface ClientToServerEvents {
  // Eventos enviados do cliente para o servidor
  'admin:subscribe': () => void;
  'admin:unsubscribe': () => void;
  'customer:subscribe': (userId: number) => void;
  'customer:unsubscribe': (userId: number) => void;
}

// Interface do servidor socket
interface ServerToClientEvents {
  // Eventos enviados do servidor para o cliente
  'order:new': (data: OrderWithItems) => void;
  'order:updated': (data: Order) => void;
  'order:ready': (data: Order) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  userId?: number;
  isAdmin?: boolean;
}

let io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null = null;

// Função para inicializar o servidor WebSocket
export function initWebsocket(httpServer: HttpServer): Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> {
  io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    // Inscrição do painel administrativo
    socket.on('admin:subscribe', () => {
      console.log('Admin inscrito:', socket.id);
      socket.data.isAdmin = true;
      socket.join('admin-room');
    });

    // Cancelar inscrição do painel administrativo
    socket.on('admin:unsubscribe', () => {
      console.log('Admin desconectado:', socket.id);
      socket.data.isAdmin = false;
      socket.leave('admin-room');
    });

    // Inscrição do cliente
    socket.on('customer:subscribe', (userId: number) => {
      console.log(`Cliente ${userId} inscrito:`, socket.id);
      socket.data.userId = userId;
      socket.join(`customer-${userId}`);
    });

    // Cancelar inscrição do cliente
    socket.on('customer:unsubscribe', (userId: number) => {
      console.log(`Cliente ${userId} desconectado:`, socket.id);
      socket.data.userId = undefined;
      socket.leave(`customer-${userId}`);
    });

    // Quando o cliente desconectar
    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });

  console.log('Servidor WebSocket inicializado');
  return io;
}

// Função para notificar novo pedido
export function notifyNewOrder(orderData: OrderWithItems): void {
  if (!io) return;
  
  // Enviar para o painel admin
  io.to('admin-room').emit('order:new', orderData);
  
  // Enviar para o cliente específico
  io.to(`customer-${orderData.order.userId}`).emit('order:new', orderData);
}

// Função para notificar atualização de status do pedido
export function notifyOrderStatusUpdated(order: Order): void {
  if (!io) return;
  
  // Enviar para o painel admin
  io.to('admin-room').emit('order:updated', order);
  
  // Enviar para o cliente específico
  io.to(`customer-${order.userId}`).emit('order:updated', order);
  
  // Se o pedido estiver pronto, enviar notificação específica
  if (order.status === 'pronto') {
    io.to('admin-room').emit('order:ready', order);
    io.to(`customer-${order.userId}`).emit('order:ready', order);
  }
}

// Função para verificar se o WebSocket está inicializado
export function getIO(): Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null {
  return io;
} 