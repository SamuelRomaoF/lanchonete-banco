import QRCode from '@/components/QRCode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import { AlertTriangle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { useEffect, useState } from 'react';
import { io } from "socket.io-client";
import { useLocation, useNavigate } from 'wouter';

const PAYMENT_STATUS = {
  PENDING: 'pendente',
  APPROVED: 'aprovado',
  REJECTED: 'recusado'
};

const ORDER_STATUS = {
  PENDING: 'pendente',
  CONFIRMED: 'confirmado',
  PREPARING: 'preparo',
  READY: 'pronto',
  DELIVERY: 'entrega',
  COMPLETED: 'concluido',
  CANCELED: 'cancelado'
};

interface CheckoutStep {
  title: string;
  component: React.ReactNode;
}

export default function Checkout() {
  const { cart, clearCart, totalAmount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [, setLocation] = useLocation();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dados do formulário
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao'>('pix');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  // Dados do pedido
  const [orderId, setOrderId] = useState<number | null>(null);
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [paymentStatus, setPaymentStatus] = useState(PAYMENT_STATUS.PENDING);
  const [orderStatus, setOrderStatus] = useState(ORDER_STATUS.PENDING);
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);

  // Socket para atualização em tempo real
  useEffect(() => {
    if (orderStatus === ORDER_STATUS.CONFIRMED || !orderId || !user) return;
    
    const socket = io(window.location.origin);

    socket.on('connect', () => {
      socket.emit('customer:subscribe', user.id);
    });

    socket.on('order:updated', (updatedOrder) => {
      if (updatedOrder.id === orderId) {
        setOrderStatus(updatedOrder.status);
        if (updatedOrder.ticketNumber) {
          setTicketNumber(updatedOrder.ticketNumber);
        }
      }
    });

    return () => {
      socket.emit('customer:unsubscribe', user.id);
      socket.disconnect();
    };
  }, [orderId, orderStatus, user]);

  // Verificar se o carrinho está vazio
  useEffect(() => {
    if (cart.length === 0 && !orderId) {
      navigate('/');
    }
  }, [cart, navigate, orderId]);

  // Salvar pedido no localStorage quando confirmado
  useEffect(() => {
    if (orderStatus === ORDER_STATUS.CONFIRMED && orderId && ticketNumber) {
      saveOrderToLocalStorage();
    }
  }, [orderStatus, orderId, ticketNumber]);

  // Função para simular processamento do pagamento
  const processPayment = async () => {
    if (!orderId) return;

    try {
      const response = await fetch(`/api/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          orderId,
          method: paymentMethod,
          status: 'pendente',
          amount: totalAmount
        })
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Erro ao processar pagamento');
      
      setPaymentId(data.payment.id);
      
      // Simular processamento do pagamento
      setTimeout(() => {
        setPaymentStatus(PAYMENT_STATUS.APPROVED);
        setOrderStatus(ORDER_STATUS.CONFIRMED);
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento');
      setPaymentStatus(PAYMENT_STATUS.REJECTED);
    }
  };
  
  // Criar pedido
  const createOrder = async () => {
    if (!user) {
      setError('Você precisa estar logado para finalizar o pedido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderItems = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
      }));

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          order: {
            userId: user.id,
            total: totalAmount,
            address: address,
            status: ORDER_STATUS.PENDING
          },
          items: orderItems
        })
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Erro ao criar pedido');
      
      setOrderId(data.order.id);
      if (data.order.ticketNumber) {
        setTicketNumber(data.order.ticketNumber);
      }
      setActiveStep(1); // Avançar para o pagamento
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar pedido');
    } finally {
      setLoading(false);
    }
  };

  // Salvar histórico de pedidos no localStorage
  const saveOrderToLocalStorage = () => {
    if (!orderId || !ticketNumber) return;
    
    const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    
    const newOrder = {
      id: orderId,
      date: new Date().toISOString(),
      total: totalAmount,
      ticketNumber,
      status: orderStatus,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    };
    
    orderHistory.push(newOrder);
    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
    
    // Limpar carrinho após pedido confirmado
    clearCart();
  };

  // Componentes para cada etapa
  const AddressStep = (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Informações de entrega</h2>
      
      <div className="space-y-2">
        <Label htmlFor="address">Endereço completo</Label>
        <Input
          id="address"
          placeholder="Rua, número, bairro, cidade"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => navigate('/')}>
          Voltar
        </Button>
        <Button 
          onClick={createOrder} 
          disabled={!address || loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Processando
            </>
          ) : (
            'Continuar'
          )}
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-50 p-3 rounded-md text-red-500 mt-4">
          {error}
        </div>
      )}
    </div>
  );
  
  const PaymentStep = (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Método de Pagamento</h2>
      
      <Tabs defaultValue="pix" onValueChange={(value) => setPaymentMethod(value as 'pix' | 'cartao')}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="pix" className="w-1/2">PIX</TabsTrigger>
          <TabsTrigger value="cartao" className="w-1/2">Cartão</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pix">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg w-full max-w-xs">
              <QRCode value={`pix:${orderId}`} size={200} />
            </div>
            <p className="text-sm text-gray-500 text-center">
              Escaneie o QR code acima para pagar com PIX
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="cartao">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Número do Cartão</Label>
              <Input
                id="cardNumber"
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardName">Nome no Cartão</Label>
              <Input
                id="cardName"
                placeholder="Nome impresso no cartão"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardExpiry">Validade</Label>
                <Input
                  id="cardExpiry"
                  placeholder="MM/AA"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardCvv">CVV</Label>
                <Input
                  id="cardCvv"
                  placeholder="123"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setActiveStep(0)}>
          Voltar
        </Button>
        <Button 
          onClick={processPayment}
          disabled={loading || paymentStatus !== PAYMENT_STATUS.PENDING}
        >
          {paymentStatus === PAYMENT_STATUS.PENDING ? (
            loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Processando
              </>
            ) : (
              'Finalizar Pagamento'
            )
          ) : paymentStatus === PAYMENT_STATUS.APPROVED ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" /> 
              Pagamento Aprovado
            </>
          ) : (
            <>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Pagamento Recusado
            </>
          )}
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-50 p-3 rounded-md text-red-500 mt-4">
          {error}
        </div>
      )}
    </div>
  );
  
  const ConfirmationStep = (
    <div className="space-y-6 text-center">
      <div>
        <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
        <h2 className="text-2xl font-bold mt-4">Pedido Confirmado!</h2>
        <p className="text-gray-500">Seu pedido foi recebido e está em preparação.</p>
      </div>
      
      {ticketNumber && (
        <div className="py-4">
          <p className="text-sm text-gray-500 mb-2">Sua senha é</p>
          <div className="text-3xl font-bold bg-primary text-white py-3 px-6 rounded-md inline-block">
            {ticketNumber}
          </div>
          <p className="text-sm text-gray-500 mt-2">Apresente esta senha ao retirar seu pedido</p>
        </div>
      )}
      
      <div className="bg-gray-50 p-4 rounded-md">
        <p className="font-medium">Status do Pedido</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Clock className="h-4 w-4" />
          <span className="capitalize">{orderStatus.replace(/^\w/, c => c.toUpperCase())}</span>
        </div>
      </div>
      
      <Button onClick={() => navigate('/pedidos')}>
        Ver Meus Pedidos
      </Button>
    </div>
  );
  
  // Definir etapas do checkout
  const steps: CheckoutStep[] = [
    { title: 'Endereço', component: AddressStep },
    { title: 'Pagamento', component: PaymentStep },
    { title: 'Confirmação', component: ConfirmationStep }
  ];
  
  // Avançar para etapa de confirmação se o pagamento for aprovado
  useEffect(() => {
    if (paymentStatus === PAYMENT_STATUS.APPROVED) {
      setActiveStep(2);
    }
  }, [paymentStatus]);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Finalizar Compra</h1>
      
      <div className="flex mb-8">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeStep >= index
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index + 1}
            </div>
            <div
              className={`ml-2 ${
                activeStep >= index ? 'text-primary' : 'text-gray-500'
              }`}
            >
              {step.title}
            </div>
            {index < steps.length - 1 && (
              <div className="mx-4 flex-grow h-px bg-gray-300" />
            )}
          </div>
        ))}
      </div>
      
      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3">
          <Card>
            <CardContent className="p-6">
              {steps[activeStep].component}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between py-2">
                  <div>
                    <span>{item.quantity}x </span>
                    <span>{item.name}</span>
                  </div>
                  <div>{formatCurrency(item.price * item.quantity)}</div>
                </div>
              ))}
              <Separator className="my-4" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 