"use client"

import Link from "next/link"
import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Produto } from "@/lib/types"

interface ProductCardProps {
  produto: Produto
}

export function ProductCard({ produto }: ProductCardProps) {
  const precoFormatado = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(produto.preco_venda)

  const nomeCompleto = `${produto.fabricante} ${produto.modelo}`
  const descricao = produto.tipo ? produto.tipo.charAt(0).toUpperCase() + produto.tipo.slice(1) : ''

  // Normalizar image_url para array (proteção adicional)
  let imageUrl = "/placeholder.svg?height=80&width=80&query=product"
  if (Array.isArray(produto.image_url) && produto.image_url.length > 0) {
    imageUrl = produto.image_url[0]
  } else if (typeof produto.image_url === 'string' && produto.image_url) {
    imageUrl = produto.image_url
  }

  return (
    <Card className="group transition-smooth hover-lift hover:shadow-md">
      <CardContent className="p-0">
        <Link href={`/produto/${produto.id}`} className="flex items-center gap-3 p-3">
          {/* Small square image on the left */}
          <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
            <Image
              src={imageUrl}
              alt={nomeCompleto}
              fill
              className="object-cover transition-smooth group-hover:scale-105"
              sizes="80px"
            />
          </div>

          {/* Product info on the right */}
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-smooth">
              {nomeCompleto}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2">{descricao}</p>
            <p className="text-base font-bold text-primary">{precoFormatado}</p>
          </div>

          {/* Arrow indicator */}
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 group-hover:text-primary transition-smooth" />
        </Link>
      </CardContent>
    </Card>
  )
}
