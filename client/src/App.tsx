import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import CategoryManagement from "@/pages/admin/CategoryManagement";
import Dashboard from "@/pages/admin/Dashboard";
import OrdersList from "@/pages/admin/OrdersList";
import ProductManagement from "@/pages/admin/ProductManagement";
import Checkout from "@/pages/Checkout";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import OrderHistory from "@/pages/OrderHistory";
import ProductsList from "@/pages/ProductsList";
import Register from "@/pages/Register";
import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";

function Router() {
  return (
    <Switch>
      {/* Páginas de cliente */}
      <Route path="/" component={Home} />
      <Route path="/produtos" component={ProductsList} />
      <Route path="/produtos/:categoria" component={ProductsList} />
      <Route path="/pedidos" component={OrderHistory} />
      <Route path="/checkout" component={Checkout} />
      
      {/* Autenticação */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Páginas de admin */}
      <Route path="/admin" component={Dashboard} />
      <Route path="/admin/produtos" component={ProductManagement} />
      <Route path="/admin/categorias" component={CategoryManagement} />
      <Route path="/admin/pedidos" component={OrdersList} />
      
      {/* Fallback para 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">
                <Router />
              </main>
              <Footer />
            </div>
            
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
