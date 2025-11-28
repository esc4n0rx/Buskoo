"use client"

import { useState, useEffect } from "react"
import { Filter, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { getFilterPreferences, saveFilterPreferences, type FilterPreferences } from "@/lib/storage"

interface FiltersProps {
  categoriaSlug: string
  onFilterChange: (filters: FilterPreferences) => void
}

export function Filters({ categoriaSlug, onFilterChange }: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterPreferences>({})
  const [marcas, setMarcas] = useState<string[]>([])
  const [regioes, setRegioes] = useState<string[]>([])

  // Buscar marcas e regiões da API
  useEffect(() => {
    async function fetchFiltros() {
      try {
        const res = await fetch(`/api/filtros/${categoriaSlug}`)
        const data = await res.json()
        setMarcas(data.marcas || [])
        setRegioes(data.regioes || [])
      } catch (error) {
        console.error('Erro ao buscar filtros:', error)
      }
    }
    fetchFiltros()
  }, [categoriaSlug])

  useEffect(() => {
    const saved = getFilterPreferences(categoriaSlug)
    setFilters(saved)
    onFilterChange(saved)
  }, [categoriaSlug])

  const updateFilters = (newFilters: FilterPreferences) => {
    setFilters(newFilters)
    saveFilterPreferences(categoriaSlug, newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const empty: FilterPreferences = {}
    setFilters(empty)
    saveFilterPreferences(categoriaSlug, empty)
    onFilterChange(empty)
  }

  const hasActiveFilters =
    filters.precoMin ||
    filters.precoMax ||
    (filters.marcas && filters.marcas.length > 0) ||
    filters.regiao ||
    filters.ordenacao

  const toggleMarca = (marca: string) => {
    const current = filters.marcas || []
    const updated = current.includes(marca) ? current.filter((m) => m !== marca) : [...current, marca]
    updateFilters({ ...filters, marcas: updated.length > 0 ? updated : undefined })
  }

  return (
    <div className="bg-secondary/50 rounded-lg border border-border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto hover:bg-transparent"
            aria-label="Abrir filtros"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filtros</span>
              {hasActiveFilters && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">Ativos</span>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-4 pt-0 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Faixa de Preço */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Faixa de Preço</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Mín"
                  value={filters.precoMin || ""}
                  onChange={(e) =>
                    updateFilters({
                      ...filters,
                      precoMin: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full"
                  aria-label="Preço mínimo"
                />
                <Input
                  type="number"
                  placeholder="Máx"
                  value={filters.precoMax || ""}
                  onChange={(e) =>
                    updateFilters({
                      ...filters,
                      precoMax: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full"
                  aria-label="Preço máximo"
                />
              </div>
            </div>

            {/* Marcas */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Marca</Label>
              <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
                {marcas.slice(0, 6).map((marca) => (
                  <div key={marca} className="flex items-center gap-2">
                    <Checkbox
                      id={`marca-${marca}`}
                      checked={filters.marcas?.includes(marca) || false}
                      onCheckedChange={() => toggleMarca(marca)}
                    />
                    <Label htmlFor={`marca-${marca}`} className="text-sm font-normal cursor-pointer">
                      {marca}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Região */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Região</Label>
              <Select
                value={filters.regiao || ""}
                onValueChange={(value) =>
                  updateFilters({
                    ...filters,
                    regiao: value || undefined,
                  })
                }
              >
                <SelectTrigger aria-label="Selecionar região">
                  <SelectValue placeholder="Todas as regiões" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as regiões</SelectItem>
                  {regioes.map((regiao) => (
                    <SelectItem key={regiao} value={regiao}>
                      {regiao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ordenação */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Ordenar por</Label>
              <Select
                value={filters.ordenacao || ""}
                onValueChange={(value) =>
                  updateFilters({
                    ...filters,
                    ordenacao: value || undefined,
                  })
                }
              >
                <SelectTrigger aria-label="Ordenar produtos">
                  <SelectValue placeholder="Mais recentes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recentes">Mais recentes</SelectItem>
                  <SelectItem value="preco-asc">Menor preço</SelectItem>
                  <SelectItem value="preco-desc">Maior preço</SelectItem>
                  <SelectItem value="nome">Nome A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="px-4 pb-4">
              <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2 bg-transparent">
                <X className="w-3 h-3" />
                Limpar filtros
              </Button>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
