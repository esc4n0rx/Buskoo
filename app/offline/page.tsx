"use client"

import Link from "next/link"
import { WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
        <WifiOff className="w-10 h-10 text-muted-foreground" />
      </div>

      <h1 className="text-2xl font-bold mb-2">Você está offline</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        Não foi possível carregar esta página. Verifique sua conexão com a internet e tente novamente.
      </p>

      <div className="flex gap-4">
        <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        <Button variant="outline" asChild>
          <Link href="/">Ir para o início</Link>
        </Button>
      </div>
    </div>
  )
}
