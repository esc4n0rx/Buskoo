import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)

    // Verificar se a categoria existe
    const { data: categoria, error: categoriaError } = await supabaseServer
      .from('buskoo_categorias')
      .select('*')
      .eq('slug', slug)
      .single()

    if (categoriaError || !categoria) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 })
    }

    // Mapear slug para nome da tabela
    const tableMap: Record<string, string> = {
      'smartphones': 'buskoo_smartphones',
      'computadores': 'buskoo_computadores',
      'videogames': 'buskoo_videogames',
      'perifericos': 'buskoo_perifericos',
      'smartwatches': 'buskoo_smartwatches',
      'audio': 'buskoo_audio',
      'cameras': 'buskoo_cameras',
      'tablets': 'buskoo_tablets',
    }

    const tableName = tableMap[slug]

    if (!tableName) {
      return NextResponse.json({
        produtos: [],
        total: 0,
        page: 1,
        totalPages: 0,
        message: 'Produtos desta categoria ainda não estão disponíveis'
      })
    }

    // Parâmetros de filtro e paginação
    const precoMin = searchParams.get("precoMin")
    const precoMax = searchParams.get("precoMax")
    const marcas = searchParams.get("marcas")
    const regiao = searchParams.get("regiao")
    const ordenacao = searchParams.get("ordenacao") || "recente"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")

    // Construir query base
    let query = supabaseServer
      .from(tableName)
      .select('*', { count: 'exact' })

    // Aplicar filtros
    if (precoMin) {
      query = query.gte('preco_venda', Number(precoMin))
    }
    if (precoMax) {
      query = query.lte('preco_venda', Number(precoMax))
    }
    if (marcas) {
      const marcasList = marcas.split(",")
      query = query.in('fabricante', marcasList)
    }
    if (regiao && regiao !== "todas") {
      query = query.eq('regiao', regiao)
    }

    // Aplicar ordenação
    switch (ordenacao) {
      case "preco-asc":
        query = query.order('preco_venda', { ascending: true })
        break
      case "preco-desc":
        query = query.order('preco_venda', { ascending: false })
        break
      case "nome":
        query = query.order('modelo', { ascending: true })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    // Aplicar paginação
    const start = (page - 1) * limit
    query = query.range(start, start + limit - 1)

    const { data: produtos, error: produtosError, count } = await query

    if (produtosError) {
      console.error('Erro ao buscar produtos:', produtosError)
      return NextResponse.json(
        { error: 'Erro ao buscar produtos' },
        { status: 500 }
      )
    }

    // Normalizar image_url para sempre ser array
    const produtosNormalizados = (produtos || []).map(produto => {
      let imageUrls = produto.image_url

      // Se for array com 1 elemento que é string JSON, fazer parse
      if (Array.isArray(imageUrls) && imageUrls.length === 1 && typeof imageUrls[0] === 'string') {
        try {
          const parsed = JSON.parse(imageUrls[0])
          if (Array.isArray(parsed)) {
            imageUrls = parsed
          }
        } catch (e) {
          // Se não for JSON válido, manter como está
        }
      }

      // Se for string, converter para array
      if (typeof imageUrls === 'string') {
        try {
          // Tentar fazer parse como JSON primeiro
          const parsed = JSON.parse(imageUrls)
          if (Array.isArray(parsed)) {
            imageUrls = parsed
          } else {
            imageUrls = [imageUrls]
          }
        } catch (e) {
          // Se não for JSON, usar como string simples
          imageUrls = imageUrls ? [imageUrls] : []
        }
      }

      // Se for null/undefined, usar array vazio
      if (!imageUrls || !Array.isArray(imageUrls)) {
        imageUrls = []
      }

      return {
        ...produto,
        image_url: imageUrls
      }
    })

    return NextResponse.json({
      produtos: produtosNormalizados,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
