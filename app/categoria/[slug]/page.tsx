"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Header } from "@/components/header"
import { Filters } from "@/components/filters"
import { ProductCard } from "@/components/product-card"
import { ProductSkeletonGrid } from "@/components/product-skeleton"
import { Button } from "@/components/ui/button"
import type { FilterPreferences } from "@/lib/storage"
import type { Categoria, Produto } from "@/lib/types"

const ITEMS_PER_PAGE = 12

export default function CategoriaPage() {
  const params = useParams()
  const slug = params.slug as string

  const [categoria, setCategoria] = useState<Categoria | null>(null)
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<FilterPreferences>({})

  // Buscar categoria
  useEffect(() => {
    async function fetchCategoria() {
      try {
        const res = await fetch('/api/categorias')
        const categorias: Categoria[] = await res.json()
        const cat = categorias.find(c => c.slug === slug)
        setCategoria(cat || null)
      } catch (error) {
        console.error('Erro ao buscar categoria:', error)
      }
    }
    fetchCategoria()
  }, [slug])

  // Buscar produtos quando filtros ou página mudam
  useEffect(() => {
    async function fetchProdutos() {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: ITEMS_PER_PAGE.toString(),
        })

        if (filters.precoMin) params.append('precoMin', filters.precoMin.toString())
        if (filters.precoMax) params.append('precoMax', filters.precoMax.toString())
        if (filters.marcas && filters.marcas.length > 0) params.append('marcas', filters.marcas.join(','))
        if (filters.regiao && filters.regiao !== 'todas') params.append('regiao', filters.regiao)
        if (filters.ordenacao) params.append('ordenacao', filters.ordenacao)

        const res = await fetch(`/api/categorias/${slug}/produtos?${params}`)
        const data = await res.json()

        if (data.produtos) {
          setProdutos(data.produtos)
          setTotal(data.total || 0)
        } else {
          setProdutos([])
          setTotal(0)
        }
      } catch (error) {
        console.error('Erro ao buscar produtos:', error)
        setProdutos([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProdutos()
  }, [slug, filters, page])

  const handleFilterChange = (newFilters: FilterPreferences) => {
    setFilters(newFilters)
    setPage(1) // Reset para primeira página ao filtrar
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  const hasMore = page < totalPages

  if (!categoria && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Categoria não encontrada</h1>
          <Button asChild>
            <Link href="/">Voltar para o início</Link>
          </Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-smooth mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar para categorias
          </Link>

          {categoria && (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{categoria.nome}</h1>
              <p className="text-muted-foreground mt-1">
                {total} produto{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
              </p>
            </>
          )}
        </div>

        <div className="mb-6">
          <Filters categoriaSlug={slug} onFilterChange={handleFilterChange} />
        </div>

        {isLoading ? (
          <ProductSkeletonGrid count={ITEMS_PER_PAGE} />
        ) : produtos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              Nenhum produto encontrado com os filtros selecionados.
            </p>
            <Button variant="outline" onClick={() => handleFilterChange({})}>
              Limpar filtros
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {produtos.map((produto) => (
                <ProductCard key={produto.id} produto={produto} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setPage(p => p + 1)}
                  className="min-w-48"
                >
                  Carregar mais produtos ({page} de {totalPages})
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-border py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Buskoo. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
