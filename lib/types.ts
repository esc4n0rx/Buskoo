/**
 * Tipos compartilhados do Buskoo
 * Baseados nas tabelas do Supabase mas adaptados para uso no frontend
 */

// Categoria de produtos
export interface Categoria {
  id: string
  nome: string
  slug: string
  icone: string
  descricao: string
  created_at?: string
  updated_at?: string
}

// Produto genérico (smartphone, computador, etc)
export interface Produto {
  id: string
  fabricante: string
  modelo: string
  cat?: string
  tipo?: string
  specs?: string | null // Descrição do produto
  preco_base: number
  preco_venda: number
  fornecedor: string
  regiao: string
  image_url: string[] // Array de URLs de imagens
  created_at?: string
  updated_at?: string
}

// Resposta da API de produtos com paginação
export interface ProdutosResponse {
  produtos: Produto[]
  total: number
  page: number
  totalPages: number
  message?: string
}

// Solicitação de produto
export interface Solicitacao {
  id?: string
  nome: string
  produto: string
  pagamento: string
  obs?: string | null
  created_at?: string
}
