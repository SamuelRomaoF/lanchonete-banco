import { supabase } from "@shared/supabase";
import { User as SupabaseUser } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface User {
  id: string; // Alterado para string para compatibilidade com o UUID do Supabase
  name: string;
  email: string;
  type: 'cliente' | 'admin';
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Configurar listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Verificar se já existe uma sessão ativa
    checkAuth();

    return () => {
      // Remover listener ao desmontar
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Função auxiliar para buscar o perfil completo do usuário
  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      
      if (error) {
        console.error("Erro ao buscar perfil do usuário:", error);
        return;
      }
      
      if (data) {
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          type: data.type
        });
      }
    } catch (error) {
      console.error("Erro ao buscar perfil do usuário:", error);
    }
  };
  
  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Erro ao verificar sessão:", error);
        setLoading(false);
        return;
      }
      
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.user) {
        await fetchUserProfile(data.user);
      }
    } catch (error) {
      console.error("Erro durante o login:", error);
      throw error;
    }
  };
  
  const register = async (data: RegisterData) => {
    try {
      // 1. Registrar usuário com autenticação do Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });
      
      if (authError) {
        throw new Error(authError.message);
      }
      
      if (!authData.user) {
        throw new Error("Falha ao criar usuário");
      }
      
      // 2. Criar perfil do usuário na tabela users
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: authData.user.id,
          name: data.name,
          email: data.email,
          password: '', // Não armazenamos a senha diretamente, o Supabase Auth já cuida disso
          phone: data.phone || null,
          address: data.address || null,
          type: 'cliente' // Tipo padrão para novos usuários
        });
      
      if (profileError) {
        // Se falhar em criar o perfil, tentar excluir o usuário auth (opcional)
        console.error("Erro ao criar perfil de usuário:", profileError);
        throw new Error("Erro ao criar perfil de usuário: " + profileError.message);
      }
      
      // 3. Já estamos logados após o signUp, então apenas atualizamos o estado
      await fetchUserProfile(authData.user);
    } catch (error) {
      console.error("Erro durante o registro:", error);
      throw error;
    }
  };
  
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Erro ao fazer logout:", error);
      }
      
      setUser(null);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };
  
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
