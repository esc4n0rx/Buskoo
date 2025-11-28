export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Tabela de Categorias
export interface BuskooCategoria {
  id: string // UUID
  nome: string
  slug: string
  icone: string
  descricao: string
  created_at?: string
  updated_at?: string
}

// Tabela de Produtos - Smartphones
export interface BuskooSmartphone {
  id: string // UUID
  fabricante: string
  modelo: string
  cat: string // categoria
  tipo: string
  specs: Json // especificações em JSON
  preco_base: number
  preco_venda: number
  fornecedor: string
  regiao: string
  image_url: string[] // Array de URLs de imagens
  created_at?: string
  updated_at?: string
}

// Interface genérica para produtos (usada por todas as categorias)
export interface BuskooProdutoBase {
  id: string // UUID
  fabricante: string
  modelo: string
  cat: string
  tipo?: string
  specs: Json // especificações em JSON
  preco_base: number
  preco_venda: number
  fornecedor: string
  regiao: string
  image_url: string[] // Array de URLs de imagens
  created_at?: string
  updated_at?: string
}

// Tipos específicos por categoria (todos seguem a mesma estrutura)
export type BuskooComputador = BuskooProdutoBase
export type BuskooVideogame = BuskooProdutoBase
export type BuskooPerifericos = BuskooProdutoBase
export type BuskooSmartwatch = BuskooProdutoBase
export type BuskooAudio = BuskooProdutoBase
export type BuskooCamera = BuskooProdutoBase
export type BuskooTablet = BuskooProdutoBase

// Tabela de Solicitações
export interface BuskooSolicitacao {
  id: string // UUID
  nome: string
  produto: string
  pagamento: string
  obs?: string
  created_at?: string
}

// Database schema type
export interface Database {
  public: {
    Tables: {
      buskoo_categorias: {
        Row: BuskooCategoria
        Insert: Omit<BuskooCategoria, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<BuskooCategoria, 'id' | 'created_at' | 'updated_at'>>
      }
      buskoo_smartphones: {
        Row: BuskooSmartphone
        Insert: Omit<BuskooSmartphone, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<BuskooSmartphone, 'id' | 'created_at' | 'updated_at'>>
      }
      buskoo_computadores: {
        Row: BuskooComputador
        Insert: Omit<BuskooComputador, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<BuskooComputador, 'id' | 'created_at' | 'updated_at'>>
      }
      buskoo_videogames: {
        Row: BuskooVideogame
        Insert: Omit<BuskooVideogame, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<BuskooVideogame, 'id' | 'created_at' | 'updated_at'>>
      }
      buskoo_perifericos: {
        Row: BuskooPerifericos
        Insert: Omit<BuskooPerifericos, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<BuskooPerifericos, 'id' | 'created_at' | 'updated_at'>>
      }
      buskoo_smartwatches: {
        Row: BuskooSmartwatch
        Insert: Omit<BuskooSmartwatch, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<BuskooSmartwatch, 'id' | 'created_at' | 'updated_at'>>
      }
      buskoo_audio: {
        Row: BuskooAudio
        Insert: Omit<BuskooAudio, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<BuskooAudio, 'id' | 'created_at' | 'updated_at'>>
      }
      buskoo_cameras: {
        Row: BuskooCamera
        Insert: Omit<BuskooCamera, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<BuskooCamera, 'id' | 'created_at' | 'updated_at'>>
      }
      buskoo_tablets: {
        Row: BuskooTablet
        Insert: Omit<BuskooTablet, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<BuskooTablet, 'id' | 'created_at' | 'updated_at'>>
      }
      buskoo_solicitacoes: {
        Row: BuskooSolicitacao
        Insert: Omit<BuskooSolicitacao, 'id' | 'created_at'>
        Update: Partial<Omit<BuskooSolicitacao, 'id' | 'created_at'>>
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

// Helper types para facilitar o uso
export type Categoria = Database['public']['Tables']['buskoo_categorias']['Row']
export type CategoriaInsert = Database['public']['Tables']['buskoo_categorias']['Insert']
export type CategoriaUpdate = Database['public']['Tables']['buskoo_categorias']['Update']

export type Smartphone = Database['public']['Tables']['buskoo_smartphones']['Row']
export type SmartphoneInsert = Database['public']['Tables']['buskoo_smartphones']['Insert']
export type SmartphoneUpdate = Database['public']['Tables']['buskoo_smartphones']['Update']

export type Solicitacao = Database['public']['Tables']['buskoo_solicitacoes']['Row']
export type SolicitacaoInsert = Database['public']['Tables']['buskoo_solicitacoes']['Insert']
export type SolicitacaoUpdate = Database['public']['Tables']['buskoo_solicitacoes']['Update']
