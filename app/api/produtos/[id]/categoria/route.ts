import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"

/**
 * API para descobrir a categoria de um produto pelo ID
 * GET /api/produtos/[id]/categoria
 *
 * Retorna a categoria (nome da tabela) onde o produto foi encontrado
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Mapa de tabela → categoria
    const tableToCategory: Record<string, string> = {
      'buskoo_smartphones': 'smartphones',
      'buskoo_computadores': 'computadores',
      'buskoo_videogames': 'videogames',
      'buskoo_perifericos': 'perifericos',
      'buskoo_smartwatches': 'smartwatches',
      'buskoo_audio': 'audio',
      'buskoo_cameras': 'cameras',
      'buskoo_tablets': 'tablets',
    }

    // Buscar em todas as tabelas
    for (const [table, categorySlug] of Object.entries(tableToCategory)) {
      const { data, error } = await supabaseServer
        .from(table)
        .select('id')
        .eq('id', id)
        .maybeSingle()

      if (data && !error) {
        // Encontrou! Retornar o slug da categoria
        return NextResponse.json({
          categoria: categorySlug,
          tabela: table
        })
      }
    }

    // Não encontrou em nenhuma tabela
    return NextResponse.json(
      { error: 'Produto não encontrado' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Erro ao buscar categoria do produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
