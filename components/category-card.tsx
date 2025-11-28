"use client"

import Link from "next/link"
import { Smartphone, Laptop, Gamepad2, Mouse, Watch, Headphones, Camera, Tablet, type LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Categoria } from "@/lib/types"

const iconMap: Record<string, LucideIcon> = {
  smartphone: Smartphone,
  laptop: Laptop,
  "gamepad-2": Gamepad2,
  mouse: Mouse,
  watch: Watch,
  headphones: Headphones,
  camera: Camera,
  tablet: Tablet,
}

interface CategoryCardProps {
  categoria: Categoria
}

export function CategoryCard({ categoria }: CategoryCardProps) {
  const Icon = iconMap[categoria.icone] || Smartphone

  return (
    <Link href={`/categoria/${categoria.slug}`}>
      <Card className="group h-full cursor-pointer transition-smooth hover-lift hover:shadow-lg hover:border-primary/30">
        <CardContent className="flex flex-col items-center justify-center p-6 text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-smooth">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-smooth">
              {categoria.nome}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{categoria.descricao}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
