"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Package, Truck, ShoppingBag } from "lucide-react"
import { Header } from "@/components/header"
import { InstallmentSimulator } from "@/components/installment-simulator"
import { RequestModal } from "@/components/request-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { useParams } from "next/navigation"
import type { Produto, Categoria } from "@/lib/types"

export default function ProdutoPage() {
  const params = useParams()
  const id = params.id as string

  const [produto, setProduto] = useState<Produto | null>(null)
  const [categoria, setCategoria] = useState<Categoria | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProduto() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/produtos/${id}`)
        if (res.ok) {
          const data: Produto = await res.json()
          setProduto(data)

          const catApiRes = await fetch(`/api/produtos/${id}/categoria`)
          if (catApiRes.ok) {
            const { categoria: catSlug } = await catApiRes.json()
            const categorias = await fetch('/api/categorias').then(r => r.json())
            const cat = categorias.find((c: Categoria) => c.slug === catSlug)
            setCategoria(cat || null)
          }
        } else {
          setProduto(null)
        }
      } catch (error) {
        console.error('Erro ao buscar produto:', error)
        setProduto(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProduto()
  }, [id])

  useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-secondary rounded w-1/3"></div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="h-72 bg-secondary rounded"></div>
              <div className="space-y-3">
                <div className="h-6 bg-secondary rounded"></div>
                <div className="h-4 bg-secondary rounded w-2/3"></div>
                <div className="h-8 bg-secondary rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!produto) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <Button asChild>
            <Link href="/">Voltar para o início</Link>
          </Button>
        </main>
      </div>
    )
  }

  const precoFormatado = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(produto.preco_venda)

  // Garantir que image_url seja array e usar imagens do produto ou placeholders
  let imageUrls = produto.image_url

  // Normalizar para array (proteção adicional caso a API não normalize)
  if (typeof imageUrls === 'string') {
    imageUrls = imageUrls ? [imageUrls] : []
  }
  if (!Array.isArray(imageUrls)) {
    imageUrls = []
  }

  const images = imageUrls.length > 0
    ? imageUrls
    : [
        `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(produto.modelo)} front`,
        `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(produto.modelo)} side`,
        `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(produto.modelo)} back`,
        `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(produto.modelo)} detail`,
      ]

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-4 md:py-6">
        <Link
          href={categoria ? `/categoria/${categoria.slug}` : "/"}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-smooth mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para {categoria?.nome || "categorias"}
        </Link>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Carrossel de Imagens */}
          <div className="space-y-3">
            <Carousel setApi={setApi} className="w-full">
              <CarouselContent>
                {images.map((img, idx) => (
                  <CarouselItem key={idx}>
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-secondary border border-border">
                      <Image
                        src={img || "/placeholder.svg"}
                        alt={`${produto.modelo} - imagem ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={idx === 0}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:block">
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </div>
            </Carousel>
            <div className="flex justify-center gap-1.5 py-2 text-sm text-muted-foreground">
              {current} / {count}
            </div>
          </div>

          {/* Informações do Produto */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{produto.fabricante}</Badge>
                <Badge variant="outline">{produto.regiao}</Badge>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground mb-2 text-balance">
                {produto.fabricante} {produto.modelo}
              </h1>
              {produto.tipo && (
                <p className="text-sm text-muted-foreground capitalize">{produto.tipo}</p>
              )}
            </div>

            <div className="border-t border-b border-border py-4">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold text-primary">{precoFormatado}</span>
                <span className="text-sm text-muted-foreground">à vista</span>
              </div>
              <p className="text-sm text-muted-foreground">
                ou em até 12x de{" "}
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                  produto.preco_venda / 12
                )}{" "}
                sem juros
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                <Package className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs font-medium">Fornecedor</p>
                  <p className="text-xs text-muted-foreground truncate">{produto.fornecedor}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                <Truck className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs font-medium">Região</p>
                  <p className="text-xs text-muted-foreground truncate">{produto.regiao}</p>
                </div>
              </div>
            </div>

            <Button size="lg" className="w-full gap-2 h-14 text-lg font-semibold shadow-lg" onClick={() => setIsModalOpen(true)}>
              <ShoppingBag className="w-5 h-5" />
              Solicitar Agora
            </Button>

            {produto.specs && produto.specs.trim() && (
              <div className="space-y-3 pt-4">
                <h2 className="font-semibold text-lg">Descrição do Produto</h2>
                <div className="p-4 bg-secondary/30 rounded-lg text-sm border border-border/50">
                  <p className="text-foreground leading-relaxed whitespace-pre-line">{produto.specs}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <section className="mt-10 mb-10">
          <InstallmentSimulator preco={produto.preco_venda} />
        </section>
      </main>

      <footer className="border-t border-border py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Buskoo. Todos os direitos reservados.</p>
        </div>
      </footer>

      <RequestModal produto={produto} open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}
