// Local storage utilities for BuscaAqui

export interface Solicitacao {
  id: string
  produtoId: string
  produtoNome: string
  nomeCliente: string
  metodoPagamento: string
  observacoes: string
  criadoEm: string
}

export interface FilterPreferences {
  precoMin?: number
  precoMax?: number
  marcas?: string[]
  regiao?: string
  ordenacao?: string
}

const SOLICITACOES_KEY = "buscaaqui_solicitacoes"
const FILTERS_KEY = "buscaaqui_filters"
const CACHED_DATA_KEY = "buscaaqui_cached_data"

export function getSolicitacoes(): Solicitacao[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(SOLICITACOES_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error("Erro ao ler solicitações:", e)
    return []
  }
}

export function addSolicitacao(solicitacao: Omit<Solicitacao, "id" | "criadoEm">): Solicitacao {
  const solicitacoes = getSolicitacoes()
  const nova: Solicitacao = {
    ...solicitacao,
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    criadoEm: new Date().toISOString(),
  }
  try {
    solicitacoes.push(nova)
    localStorage.setItem(SOLICITACOES_KEY, JSON.stringify(solicitacoes))
  } catch (e) {
    console.error("Erro ao salvar solicitação localmente:", e)
  }
  return nova
}

export function getFilterPreferences(categoriaSlug: string): FilterPreferences {
  if (typeof window === "undefined") return {}
  const data = localStorage.getItem(`${FILTERS_KEY}_${categoriaSlug}`)
  return data ? JSON.parse(data) : {}
}

export function saveFilterPreferences(categoriaSlug: string, filters: FilterPreferences) {
  if (typeof window === "undefined") return
  localStorage.setItem(`${FILTERS_KEY}_${categoriaSlug}`, JSON.stringify(filters))
}

export function cacheData(key: string, data: unknown) {
  if (typeof window === "undefined") return
  const cache = getCachedData()
  cache[key] = { data, timestamp: Date.now() }
  localStorage.setItem(CACHED_DATA_KEY, JSON.stringify(cache))
}

export function getCachedData(): Record<string, { data: unknown; timestamp: number }> {
  if (typeof window === "undefined") return {}
  const data = localStorage.getItem(CACHED_DATA_KEY)
  return data ? JSON.parse(data) : {}
}

export function getCachedItem<T>(key: string, maxAge = 3600000): T | null {
  const cache = getCachedData()
  const item = cache[key]
  if (!item) return null
  if (Date.now() - item.timestamp > maxAge) return null
  return item.data as T
}
