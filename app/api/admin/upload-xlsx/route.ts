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
    const dados = XLSX.utils.sheet_to_json(worksheet) as any[]

    if (dados.length === 0) {
      return NextResponse.json(
        { error: "Planilha vazia" },
        { status: 400 }
      )
    }

    // Validar e preparar dados
    const produtosParaInserir = dados.map((item) => {
      // Validar campos obrigatórios
      if (!item.fabricante || !item.modelo || !item.preco_base ||
          !item.preco_venda || !item.fornecedor || !item.regiao) {
        throw new Error(`Produto inválido: faltam campos obrigatórios em ${item.modelo || 'produto sem nome'}`)
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
