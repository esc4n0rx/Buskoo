"use client"

import { useState, useEffect } from "react"
import { Trash2, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Solicitacao } from "@/lib/types"

export function RequestsManager() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchSolicitacoes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/solicitacoes")
      if (response.ok) {
        const data = await response.json()
        setSolicitacoes(data)
      } else {
        toast({
          title: "Erro",
          description: "Erro ao carregar solicitações",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar solicitações",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSolicitacoes()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta solicitação?")) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/admin/solicitacoes/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Solicitação deletada",
          description: "A solicitação foi removida com sucesso",
        })
        setSolicitacoes(solicitacoes.filter((s) => s.id !== id))
      } else {
        toast({
          title: "Erro",
          description: "Erro ao deletar solicitação",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao deletar solicitação",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (solicitacoes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Nenhuma solicitação encontrada</p>
        <Button onClick={fetchSolicitacoes} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Recarregar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Total: {solicitacoes.length} solicitações
        </p>
        <Button onClick={fetchSolicitacoes} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {solicitacoes.map((solicitacao) => (
              <TableRow key={solicitacao.id}>
                <TableCell className="font-mono text-xs whitespace-nowrap">
                  {formatDate(solicitacao.created_at)}
                </TableCell>
                <TableCell className="font-medium">{solicitacao.nome}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {solicitacao.produto}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {solicitacao.pagamento}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[300px]">
                  {solicitacao.obs ? (
                    <span className="text-sm text-muted-foreground truncate block">
                      {solicitacao.obs}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Sem observações</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(solicitacao.id!)}
                    disabled={deletingId === solicitacao.id}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {deletingId === solicitacao.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
