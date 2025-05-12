import RegisterForm from "@/components/RegisterForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Register() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);
  
  const handleSuccessfulRegister = () => {
    setLocation("/");
  };
  
  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <Card className="border shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Criar uma conta</CardTitle>
          <CardDescription className="text-center">
            Crie sua conta e comece a fazer pedidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm onSuccess={handleSuccessfulRegister} />
          
          <div className="mt-6 text-center text-sm">
            Já tem uma conta?{" "}
            <Button variant="link" className="p-0" onClick={() => setLocation("/login")}>
              Faça login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 