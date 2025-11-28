"use client"

import { useState } from "react"
import { Upload, Loader2, FileSpreadsheet, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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

export function UploadXlsxForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [categoria, setCategoria] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione um arquivo .xlsx ou .xls",
          variant: "destructive",
        })
        return
      }
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file || !categoria) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione uma categoria e um arquivo",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('categoria', categoria)

      const response = await fetch("/api/admin/upload-xlsx", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Importação concluída",
          description: data.message || `${data.total} produtos importados`,
        })
        setFile(null)
        setCategoria("")
        // Resetar input de arquivo
        const fileInput = document.getElementById('xlsx-file') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        const errorData = await response.json()
        toast({
          title: "Erro ao importar",
          description: errorData.error || "Tente novamente",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar arquivo",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Formato da Planilha</AlertTitle>
        <AlertDescription>
          A planilha deve conter as seguintes colunas:
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li><strong>fabricante</strong> - Fabricante do produto (obrigatório)</li>
            <li><strong>modelo</strong> - Modelo do produto (obrigatório)</li>
            <li><strong>cat</strong> - Subcategoria (opcional)</li>
            <li><strong>tipo</strong> - Tipo/uso do produto (opcional)</li>
            <li><strong>specs</strong> - Descrição do produto (opcional)</li>
            <li><strong>preco_base</strong> - Preço base em número (obrigatório)</li>
            <li><strong>preco_venda</strong> - Preço de venda em número (obrigatório)</li>
            <li><strong>fornecedor</strong> - Nome do fornecedor (obrigatório)</li>
            <li><strong>regiao</strong> - Região de origem (obrigatório)</li>
            <li><strong>image_url</strong> - URLs das imagens separadas por vírgula (opcional)</li>
          </ul>
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="categoria-upload">Categoria *</Label>
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger id="categoria-upload">
              <SelectValue placeholder="Selecione a categoria dos produtos" />
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
          <Label htmlFor="xlsx-file">Arquivo XLSX *</Label>
          <div className="flex items-center gap-3">
            <Input
              id="xlsx-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={isLoading}
              className="cursor-pointer"
            />
            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileSpreadsheet className="w-4 h-4" />
                <span className="truncate max-w-[200px]">{file.name}</span>
              </div>
            )}
          </div>
        </div>

        <Button type="submit" disabled={isLoading || !file || !categoria} className="w-full gap-2">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Importar Produtos
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
