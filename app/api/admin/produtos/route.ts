import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"

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
    const body = await request.json()
    const { categoria, produto } = body

    if (!categoria || !produto) {
      return NextResponse.json(
        { error: "Categoria e produto são obrigatórios" },
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

    // Validar campos obrigatórios
    if (!produto.fabricante || !produto.modelo || !produto.preco_base ||
        !produto.preco_venda || !produto.fornecedor || !produto.regiao) {
      return NextResponse.json(
        { error: "Campos obrigatórios: fabricante, modelo, preco_base, preco_venda, fornecedor, regiao" },
        { status: 400 }
      )
    }

    // Processar image_url - garantir que seja array
    let imageUrls = produto.image_url || []
    if (typeof imageUrls === 'string') {
      // Se vier como string, transformar em array
      imageUrls = imageUrls.split(',').map((url: string) => url.trim()).filter(Boolean)
    }

    // Inserir na tabela correspondente
    const { data, error } = await supabaseServer
      .from(tabela)
      .insert({
        fabricante: produto.fabricante,
        modelo: produto.modelo,
        cat: produto.cat || null,
        tipo: produto.tipo || null,
        specs: produto.specs || null,
        preco_base: produto.preco_base,
        preco_venda: produto.preco_venda,
        fornecedor: produto.fornecedor,
        regiao: produto.regiao,
        image_url: imageUrls.length > 0 ? imageUrls : null,
      })
      .select()

    if (error) {
      console.error("Erro ao inserir produto:", error)
      return NextResponse.json(
        { error: "Erro ao inserir produto" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Produto adicionado com sucesso",
      data: data?.[0],
    }, { status: 201 })
  } catch (error) {
    console.error("Erro inesperado:", error)
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    )
  }
}
