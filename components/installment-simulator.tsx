"use client"

import { useState, useMemo } from "react"
import { Calculator, Info } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface InstallmentSimulatorProps {
  preco: number
}

// Taxas reais do gateway de cartão
const TAXAS_GATEWAY: Record<number, number> = {
  1: 5.99,
  2: 11.39,
  3: 12.49,
  4: 13.09,
  5: 13.79,
  6: 14.49,
  7: 15.49,
  8: 16.09,
  9: 16.69,
  10: 17.39,
  11: 18.39,
  12: 18.79,
}

export function InstallmentSimulator({ preco }: InstallmentSimulatorProps) {
  const [parcelas, setParcelas] = useState(1)
  const [valorEntrada, setValorEntrada] = useState(0)

  const calculo = useMemo(() => {
    // Valor a ser financiado (após a entrada)
    const valorFinanciado = Math.max(0, preco - valorEntrada)

    // Taxa do gateway para o número de parcelas
    const taxaGateway = TAXAS_GATEWAY[parcelas] || 0
    const i = taxaGateway / 100

    let valorParcela: number
    let totalPago: number
    let totalJuros: number

    if (valorFinanciado === 0) {
      valorParcela = 0
      totalPago = valorEntrada
      totalJuros = 0
    } else if (i === 0 || parcelas === 1) {
      valorParcela = valorFinanciado / parcelas
      totalPago = valorEntrada + valorFinanciado
      totalJuros = 0
    } else {
      const fator = Math.pow(1 + i, parcelas)
      valorParcela = (valorFinanciado * (fator * i)) / (fator - 1)
      totalPago = valorEntrada + (valorParcela * parcelas)
      totalJuros = totalPago - preco
    }

    return {
      valorParcela,
      totalPago,
      totalJuros,
      valorFinanciado,
      taxaGateway,
    }
  }, [preco, parcelas, valorEntrada])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  return (
    <div className="bg-secondary/50 rounded-lg p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">Simulador de Parcelamento</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="text-muted-foreground hover:text-foreground transition-smooth"
                aria-label="Informação sobre o simulador"
              >
                <Info className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                Simulador com taxas reais do gateway de cartão de crédito.
                <br />
                Você pode dar uma entrada e parcelar o restante.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="entrada">Valor de Entrada (Opcional)</Label>
            <Input
              id="entrada"
              type="number"
              min={0}
              max={preco}
              step={0.01}
              value={valorEntrada}
              onChange={(e) => setValorEntrada(Math.min(Number(e.target.value), preco))}
              placeholder="R$ 0,00"
              aria-label="Valor de entrada"
            />
            <p className="text-xs text-muted-foreground">
              Máximo: {formatCurrency(preco)}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="parcelas">Número de Parcelas</Label>
              <div className="text-right">
                <span className="text-sm font-medium text-primary">{parcelas}x</span>
                <span className="text-xs text-muted-foreground ml-2">({calculo.taxaGateway}% a.m.)</span>
              </div>
            </div>
            <Slider
              id="parcelas"
              min={1}
              max={12}
              step={1}
              value={[parcelas]}
              onValueChange={([value]) => setParcelas(value)}
              aria-label="Número de parcelas"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1x (5,99%)</span>
              <span>12x (18,79%)</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/2">Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Preço do produto</TableCell>
                <TableCell className="text-right">{formatCurrency(preco)}</TableCell>
              </TableRow>
              {valorEntrada > 0 && (
                <>
                  <TableRow>
                    <TableCell className="font-medium">Entrada</TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(valorEntrada)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Valor a financiar</TableCell>
                    <TableCell className="text-right">{formatCurrency(calculo.valorFinanciado)}</TableCell>
                  </TableRow>
                </>
              )}
              <TableRow>
                <TableCell className="font-medium">Valor por parcela</TableCell>
                <TableCell className="text-right text-primary font-bold">
                  {parcelas}x de {formatCurrency(calculo.valorParcela)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Total de juros</TableCell>
                <TableCell className={`text-right ${calculo.totalJuros > 0 ? "text-destructive" : "text-green-600"}`}>
                  {formatCurrency(calculo.totalJuros)}
                </TableCell>
              </TableRow>
              <TableRow className="border-t-2">
                <TableCell className="font-bold">Total a pagar</TableCell>
                <TableCell className="text-right font-bold text-lg">{formatCurrency(calculo.totalPago)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
