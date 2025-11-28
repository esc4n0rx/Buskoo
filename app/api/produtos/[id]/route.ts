import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Lista de todas as tabelas de produtos
    const tables = [
      'buskoo_smartphones',
      'buskoo_computadores',
      'buskoo_videogames',
      'buskoo_perifericos',
      'buskoo_smartwatches',
      'buskoo_audio',
      'buskoo_cameras',
      'buskoo_tablets',
    ]

    // Tentar buscar em todas as tabelas até encontrar
    for (const table of tables) {
      const { data: produto, error } = await supabaseServer
        .from(table)
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (produto && !error) {
        // Normalizar image_url para sempre ser array
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

        return NextResponse.json({
          ...produto,
          image_url: imageUrls
        })
      }
    }

    // Se não encontrou em nenhuma tabela
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
  } catch (error) {
    console.error('Erro ao buscar produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
