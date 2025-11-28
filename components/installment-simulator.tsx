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

export function InstallmentSimulator({ preco }: InstallmentSimulatorProps) {
  const [parcelas, setParcelas] = useState(1)
  const [taxaJuros, setTaxaJuros] = useState(0)

  const calculo = useMemo(() => {
    const i = taxaJuros / 100
    const n = parcelas

    let valorParcela: number
    let totalPago: number
    let totalJuros: number

    if (i === 0) {
      valorParcela = preco / n
      totalPago = preco
      totalJuros = 0
    } else {
      const fator = Math.pow(1 + i, n)
      valorParcela = (preco * (fator * i)) / (fator - 1)
      totalPago = valorParcela * n
      totalJuros = totalPago - preco
    }

    return {
      valorParcela,
      totalPago,
      totalJuros,
    }
  }, [preco, parcelas, taxaJuros])

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
                aria-label="Informação sobre a fórmula"
              >
                <Info className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                Fórmula Price: Parcela = P × ((1+i)ⁿ × i) / ((1+i)ⁿ - 1)
                <br />
                Onde P = principal, i = taxa mensal, n = número de parcelas
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="parcelas">Número de Parcelas</Label>
              <span className="text-sm font-medium text-primary">{parcelas}x</span>
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
              <span>1x</span>
              <span>12x</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxa">Taxa de Juros Mensal (%)</Label>
            <Input
              id="taxa"
              type="number"
              min={0}
              max={10}
              step={0.1}
              value={taxaJuros}
              onChange={(e) => setTaxaJuros(Number(e.target.value))}
              aria-label="Taxa de juros mensal"
            />
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
                <TableCell className="font-medium">Valor por parcela</TableCell>
                <TableCell className="text-right text-primary font-bold">
                  {parcelas}x de {formatCurrency(calculo.valorParcela)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Total pago</TableCell>
                <TableCell className="text-right">{formatCurrency(calculo.totalPago)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Total de juros</TableCell>
                <TableCell className={`text-right ${calculo.totalJuros > 0 ? "text-destructive" : "text-green-600"}`}>
                  {formatCurrency(calculo.totalJuros)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
