"use client"

import { useState } from "react"
import { Loader2, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

const CATEGORIAS = [
  { value: "smartphones", label: "Smartphones" },
  { value: "computadores", label: "Computadores" },
  { value: "videogames", label: "Videogames" },
  { value: "perifericos", label: "Periféricos" },
  { value: "smartwatches", label: "Smartwatches" },
  { value: "audio", label: "Áudio" },
  { value: "cameras", label: "Câmeras" },
  { value: "tablets", label: "Tablets" },
]

export function AddProductForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    categoria: "",
    fabricante: "",
    modelo: "",
    cat: "",
    tipo: "",
    specs: "",
    preco_base: "",
    preco_venda: "",
    fornecedor: "",
    regiao: "",
  })
  const [imageUrls, setImageUrls] = useState<string[]>([""])
  const { toast } = useToast()

  const addImageUrl = () => {
    setImageUrls([...imageUrls, ""])
  }

  const removeImageUrl = (index: number) => {
    if (imageUrls.length > 1) {
      setImageUrls(imageUrls.filter((_, i) => i !== index))
    }
  }

  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...imageUrls]
    newUrls[index] = value
    setImageUrls(newUrls)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Filtrar URLs vazias
      const validImageUrls = imageUrls.filter(url => url.trim() !== "")

      const response = await fetch("/api/admin/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoria: formData.categoria,
          produto: {
            fabricante: formData.fabricante,
            modelo: formData.modelo,
            cat: formData.cat || null,
            tipo: formData.tipo || null,
            specs: formData.specs || null,
            preco_base: parseFloat(formData.preco_base),
            preco_venda: parseFloat(formData.preco_venda),
            fornecedor: formData.fornecedor,
            regiao: formData.regiao,
            image_url: validImageUrls.length > 0 ? validImageUrls : [],
          },
        }),
      })

      if (response.ok) {
        toast({
          title: "Produto adicionado",
          description: "O produto foi adicionado com sucesso ao catálogo",
        })
        // Limpar formulário
        setFormData({
          categoria: "",
          fabricante: "",
          modelo: "",
          cat: "",
          tipo: "",
          specs: "",
          preco_base: "",
          preco_venda: "",
          fornecedor: "",
          regiao: "",
        })
        setImageUrls([""])
      } else {
        const errorData = await response.json()
        toast({
          title: "Erro ao adicionar produto",
          description: errorData.error || "Tente novamente",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar produto",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria *</Label>
          <Select
            value={formData.categoria}
            onValueChange={(value) => setFormData({ ...formData, categoria: value })}
          >
            <SelectTrigger id="categoria">
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIAS.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fabricante">Fabricante *</Label>
          <Input
            id="fabricante"
            value={formData.fabricante}
            onChange={(e) => setFormData({ ...formData, fabricante: e.target.value })}
            placeholder="Ex: Samsung, Apple, Dell"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="modelo">Modelo *</Label>
          <Input
            id="modelo"
            value={formData.modelo}
            onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
            placeholder="Ex: Galaxy S24, iPhone 15"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cat">Subcategoria</Label>
          <Input
            id="cat"
            value={formData.cat}
            onChange={(e) => setFormData({ ...formData, cat: e.target.value })}
            placeholder="Ex: flagship, notebook, console"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo/Uso</Label>
          <Input
            id="tipo"
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
            placeholder="Ex: gamer, profissional, básico"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="preco_base">Preço Base (R$) *</Label>
          <Input
            id="preco_base"
            type="number"
            step="0.01"
            value={formData.preco_base}
            onChange={(e) => setFormData({ ...formData, preco_base: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="preco_venda">Preço Venda (R$) *</Label>
          <Input
            id="preco_venda"
            type="number"
            step="0.01"
            value={formData.preco_venda}
            onChange={(e) => setFormData({ ...formData, preco_venda: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fornecedor">Fornecedor *</Label>
          <Input
            id="fornecedor"
            value={formData.fornecedor}
            onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
            placeholder="Ex: TechDistribuidora"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="regiao">Região *</Label>
          <Input
            id="regiao"
            value={formData.regiao}
            onChange={(e) => setFormData({ ...formData, regiao: e.target.value })}
            placeholder="Ex: São Paulo, Brasil"
            required
          />
        </div>

        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <Label>URLs das Imagens</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addImageUrl}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Imagem
            </Button>
          </div>
          <div className="space-y-2">
            {imageUrls.map((url, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => updateImageUrl(index, e.target.value)}
                  placeholder={`https://exemplo.com/imagem-${index + 1}.jpg`}
                />
                {imageUrls.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeImageUrl(index)}
                    className="shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="specs">Descrição do Produto</Label>
          <Textarea
            id="specs"
            value={formData.specs}
            onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
            placeholder="Descreva as características e especificações do produto..."
            rows={4}
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full gap-2">
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        Adicionar Produto
      </Button>
    </form>
  )
}
