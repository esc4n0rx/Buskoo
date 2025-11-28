"use client"

import { useState, useEffect } from "react"
import { Shield, Package, Upload, ListChecks, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { AddProductForm } from "@/components/admin/add-product-form"
import { UploadXlsxForm } from "@/components/admin/upload-xlsx-form"
import { RequestsManager } from "@/components/admin/requests-manager"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Verificar se já está autenticado via sessionStorage
    const auth = sessionStorage.getItem("buskoo_admin_auth")
    if (auth === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        sessionStorage.setItem("buskoo_admin_auth", "true")
        setIsAuthenticated(true)
        toast({
          title: "Acesso concedido",
          description: "Bem-vindo ao painel de administração",
        })
      } else {
        toast({
          title: "Acesso negado",
          description: "Senha incorreta",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao autenticar",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setPassword("")
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("buskoo_admin_auth")
    setIsAuthenticated(false)
    toast({
      title: "Logout realizado",
      description: "Você saiu do painel de administração",
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <Shield className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Painel Administrativo</CardTitle>
            <CardDescription>
              Digite a senha para acessar o painel do Buskoo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha de administrador"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verificando..." : "Acessar Painel"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Buskoo Admin</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="produtos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="produtos" className="gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Adicionar Produto</span>
              <span className="sm:hidden">Produto</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload XLSX</span>
              <span className="sm:hidden">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="solicitacoes" className="gap-2">
              <ListChecks className="w-4 h-4" />
              <span className="hidden sm:inline">Solicitações</span>
              <span className="sm:hidden">Pedidos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="produtos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Novo Produto</CardTitle>
                <CardDescription>
                  Adicione um produto individualmente ao catálogo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddProductForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Importação em Massa</CardTitle>
                <CardDescription>
                  Faça upload de uma planilha XLSX com múltiplos produtos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UploadXlsxForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="solicitacoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Solicitações</CardTitle>
                <CardDescription>
                  Visualize e gerencie as solicitações de produtos dos clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RequestsManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
