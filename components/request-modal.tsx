"use client"

import type React from "react"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { addSolicitacao } from "@/lib/storage"
import type { Produto } from "@/lib/types"

interface RequestModalProps {
  produto: Produto
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RequestModal({ produto, open, onOpenChange }: RequestModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nomeCliente: "",
    metodoPagamento: "",
    observacoes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nomeCliente.trim()) {
      newErrors.nomeCliente = "Nome é obrigatório"
    }

    if (!formData.metodoPagamento) {
      newErrors.metodoPagamento = "Selecione um método de pagamento"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsLoading(true)

    try {
      const produtoNome = `${produto.fabricante} ${produto.modelo}`

      // Enviar para API
      const response = await fetch("/api/solicitacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nomeCliente,
          produto: produtoNome,
          pagamento: formData.metodoPagamento,
          obs: formData.observacoes || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error("API Error:", response.status, errorData)
        throw new Error(`Erro na API: ${response.status}`)
      }

      // Salvar localmente também (para histórico offline)
      // Envolvemos em try/catch para que erro no storage não afete a UX
      try {
        addSolicitacao({
          produtoId: String(produto.id), // Garantir que é string
          produtoNome: produtoNome,
          nomeCliente: formData.nomeCliente,
          metodoPagamento: formData.metodoPagamento,
          observacoes: formData.observacoes,
        })
      } catch (storageError) {
        console.warn("Falha ao salvar no histórico local:", storageError)
      }

      toast({
        title: "Solicitação enviada!",
        description: `Sua solicitação para ${produtoNome} foi registrada com sucesso.`,
      })

      setFormData({ nomeCliente: "", metodoPagamento: "", observacoes: "" })
      onOpenChange(false)
    } catch (error) {
      console.error("Erro completo no modal:", error)
      toast({
        title: "Erro ao enviar",
        description: "Ocorreu um erro, mas verifique se a solicitação foi processada.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] max-w-lg rounded-xl sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Solicitar Produto</DialogTitle>
          <DialogDescription>
            Preencha os dados para solicitar: <strong>{produto.fabricante} {produto.modelo}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nomeCliente">Nome do Cliente *</Label>
            <Input
              id="nomeCliente"
              value={formData.nomeCliente}
              onChange={(e) => setFormData({ ...formData, nomeCliente: e.target.value })}
              placeholder="Seu nome completo"
              aria-invalid={!!errors.nomeCliente}
              aria-describedby={errors.nomeCliente ? "nomeCliente-error" : undefined}
            />
            {errors.nomeCliente && (
              <p id="nomeCliente-error" className="text-sm text-destructive">
                {errors.nomeCliente}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="metodoPagamento">Método de Pagamento *</Label>
            <Select
              value={formData.metodoPagamento}
              onValueChange={(value) => setFormData({ ...formData, metodoPagamento: value })}
            >
              <SelectTrigger id="metodoPagamento" aria-invalid={!!errors.metodoPagamento}>
                <SelectValue placeholder="Selecione um método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="boleto">Boleto Bancário</SelectItem>
                <SelectItem value="cartao">Cartão de Crédito (Simulado)</SelectItem>
                <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
              </SelectContent>
            </Select>
            {errors.metodoPagamento && <p className="text-sm text-destructive">{errors.metodoPagamento}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Alguma observação adicional?"
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Enviar Solicitação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
