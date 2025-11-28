import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"
import * as XLSX from 'xlsx'

const CATEGORIA_TABELA_MAP: Record<string, string> = {
  "smartphones": "buskoo_smartphones",
  "computadores": "buskoo_computadores",
  "videogames": "buskoo_videogames",
  "perifericos": "buskoo_perifericos",
  "smartwatches": "buskoo_smartwatches",
  "audio": "buskoo_audio",
  "cameras": "buskoo_cameras",
  "tablets": "buskoo_tablets",
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const categoria = formData.get('categoria') as string

    if (!file || !categoria) {
      return NextResponse.json(
        { error: "Arquivo e categoria são obrigatórios" },
        { status: 400 }
      )
    }

    const tabela = CATEGORIA_TABELA_MAP[categoria.toLowerCase()]

    if (!tabela) {
      return NextResponse.json(
        { error: "Categoria inválida" },
        { status: 400 }
      )
    }

    // Converter arquivo para buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Ler planilha XLSX
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    // Converter para JSON
    const dadosOriginais = XLSX.utils.sheet_to_json(worksheet) as any[]

    if (dadosOriginais.length === 0) {
      return NextResponse.json(
        { error: "Planilha vazia" },
        { status: 400 }
      )
    }

    // Normalizar nomes das colunas e valores
    const dados = dadosOriginais.map((row) => {
      const normalizedRow: any = {}
      for (const key in row) {
        // Normalizar nome da coluna: remover espaços, lowercase
        const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '_')
        // Normalizar valor: trim se for string
        const value = row[key]
        normalizedRow[normalizedKey] = typeof value === 'string' ? value.trim() : value
      }
      return normalizedRow
    })

    // Validar se as colunas obrigatórias existem
    if (dados.length > 0) {
      const colunasDetectadas = Object.keys(dados[0])
      const colunasObrigatorias = ['fabricante', 'modelo', 'preco_base', 'preco_venda', 'fornecedor', 'regiao']
      const colunasFaltandoNoHeader = colunasObrigatorias.filter(col => !colunasDetectadas.includes(col))

      if (colunasFaltandoNoHeader.length > 0) {
        return NextResponse.json(
          {
            error: `Colunas obrigatórias faltando no cabeçalho da planilha: ${colunasFaltandoNoHeader.join(', ')}.\n\n` +
                   `Colunas detectadas: ${colunasDetectadas.join(', ')}\n\n` +
                   `Certifique-se de que o cabeçalho contém todas as colunas obrigatórias (sem espaços extras).`
          },
          { status: 400 }
        )
      }
    }

    // Validar e preparar dados
    const produtosParaInserir = dados.map((item, index) => {
      const linhaExcel = index + 2 // +2 porque linha 1 é o cabeçalho e arrays começam em 0

      // Validar campos obrigatórios (valores vazios)
      const camposFaltantes = []
      if (!item.fabricante) camposFaltantes.push('fabricante')
      if (!item.modelo) camposFaltantes.push('modelo')
      if (!item.preco_base) camposFaltantes.push('preco_base')
      if (!item.preco_venda) camposFaltantes.push('preco_venda')
      if (!item.fornecedor) camposFaltantes.push('fornecedor')
      if (!item.regiao) camposFaltantes.push('regiao')

      if (camposFaltantes.length > 0) {
        throw new Error(
          `Erro na linha ${linhaExcel}: Campos obrigatórios com valores vazios: ${camposFaltantes.join(', ')}.\n` +
          `Produto: ${item.modelo || item.fabricante || 'não identificado'}`
        )
      }

      // Validar se os preços são números válidos
      if (isNaN(Number(item.preco_base)) || Number(item.preco_base) <= 0) {
        throw new Error(
          `Erro na linha ${linhaExcel}: O campo 'preco_base' deve ser um número maior que zero. ` +
          `Valor atual: ${item.preco_base}. Produto: ${item.modelo}`
        )
      }

      if (isNaN(Number(item.preco_venda)) || Number(item.preco_venda) <= 0) {
        throw new Error(
          `Erro na linha ${linhaExcel}: O campo 'preco_venda' deve ser um número maior que zero. ` +
          `Valor atual: ${item.preco_venda}. Produto: ${item.modelo}`
        )
      }

      // Processar image_url - pode vir como string separada por vírgulas
      let imageUrls = null
      if (item.image_url) {
        const urlString = String(item.image_url)
        imageUrls = urlString.split(',').map((url: string) => url.trim()).filter(Boolean)
      }

      return {
        fabricante: String(item.fabricante),
        modelo: String(item.modelo),
        cat: item.cat ? String(item.cat) : null,
        tipo: item.tipo ? String(item.tipo) : null,
        specs: item.specs ? String(item.specs) : null,
        preco_base: Number(item.preco_base),
        preco_venda: Number(item.preco_venda),
        fornecedor: String(item.fornecedor),
        regiao: String(item.regiao),
        image_url: imageUrls,
      }
    })

    // Inserir em lote
    const { data, error } = await supabaseServer
      .from(tabela)
      .insert(produtosParaInserir)
      .select()

    if (error) {
      console.error("Erro ao inserir produtos:", error)
      return NextResponse.json(
        { error: "Erro ao inserir produtos no banco de dados" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${data?.length || 0} produtos importados com sucesso`,
      total: data?.length || 0,
    }, { status: 201 })
  } catch (error) {
    console.error("Erro ao processar XLSX:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao processar arquivo" },
      { status: 500 }
    )
  }
}
