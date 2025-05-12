export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Tabela para informações de sistema e configurações
      system_info: {
        Row: {
          id: number
          key: string
          value: Json
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: number
          key: string
          value: Json
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: number
          key?: string
          value?: Json
          updated_at?: string
          created_at?: string
        }
        Relationships: []
      }
      
      // Tabela de usuários
      users: {
        Row: {
          id: string
          name: string
          email: string
          password: string
          address: string | null
          phone: string | null
          type: "cliente" | "admin"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          password: string
          address?: string | null
          phone?: string | null
          type: "cliente" | "admin"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          password?: string
          address?: string | null
          phone?: string | null
          type?: "cliente" | "admin"
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      
      // Tabela de categorias de produtos
      categories: {
        Row: {
          id: number
          name: string
          description: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      
      // Tabela de produtos
      products: {
        Row: {
          id: number
          name: string
          description: string | null
          price: number
          image_url: string | null
          is_featured: boolean
          is_promotion: boolean
          old_price: number | null
          category_id: number
          available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          is_featured?: boolean
          is_promotion?: boolean
          old_price?: number | null
          category_id: number
          available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          is_featured?: boolean
          is_promotion?: boolean
          old_price?: number | null
          category_id?: number
          available?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      
      // Tabela de pedidos
      orders: {
        Row: {
          id: number
          user_id: string
          status: "pendente" | "confirmado" | "preparo" | "pronto" | "entrega" | "concluido" | "cancelado"
          total: number
          address: string
          created_at: string
          updated_at: string
          ticket_number: string | null
        }
        Insert: {
          id?: number
          user_id: string
          status?: "pendente" | "confirmado" | "preparo" | "pronto" | "entrega" | "concluido" | "cancelado"
          total: number
          address: string
          created_at?: string
          updated_at?: string
          ticket_number?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          status?: "pendente" | "confirmado" | "preparo" | "pronto" | "entrega" | "concluido" | "cancelado"
          total?: number
          address?: string
          created_at?: string
          updated_at?: string
          ticket_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      
      // Tabela de itens de pedido
      order_items: {
        Row: {
          id: number
          order_id: number
          product_id: number
          quantity: number
          price: number
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: number
          order_id: number
          product_id: number
          quantity: number
          price: number
          subtotal: number
          created_at?: string
        }
        Update: {
          id?: number
          order_id?: number
          product_id?: number
          quantity?: number
          price?: number
          subtotal?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      
      // Tabela de pagamentos
      payments: {
        Row: {
          id: number
          order_id: number
          method: "pix" | "cartao"
          status: string
          external_id: string | null
          amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          order_id: number
          method: "pix" | "cartao"
          status?: string
          external_id?: string | null
          amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          order_id?: number
          method?: "pix" | "cartao"
          status?: string
          external_id?: string | null
          amount?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      
      // Tabela para controle de estoque (plano intermediário)
      inventory_items: {
        Row: {
          id: number
          name: string
          quantity: number
          unit: string
          min_quantity: number
          supplier_id: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          quantity: number
          unit: string
          min_quantity?: number
          supplier_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          quantity?: number
          unit?: string
          min_quantity?: number
          supplier_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_supplier_id_fkey"
            columns: ["supplier_id"]
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          }
        ]
      }
      
      // Tabela para fornecedores (plano intermediário)
      suppliers: {
        Row: {
          id: number
          name: string
          email: string | null
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      
      // Tabela para clientes (plano premium)
      customers: {
        Row: {
          id: string
          user_id: string
          points: number
          birth_date: string | null
          preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          points?: number
          birth_date?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          points?: number
          birth_date?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 