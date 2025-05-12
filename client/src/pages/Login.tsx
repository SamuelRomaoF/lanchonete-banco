import LoginForm from "@/components/LoginForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Login() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);
  
  const handleSuccessfulLogin = () => {
    setLocation("/");
  };
  
  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <Card className="border shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Entrar</CardTitle>
          <CardDescription className="text-center">
            Faça login para acessar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm onSuccess={handleSuccessfulLogin} />
          
          <div className="mt-6 text-center text-sm">
            Não tem uma conta?{" "}
            <Button variant="link" className="p-0" onClick={() => setLocation("/register")}>
              Cadastre-se
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 