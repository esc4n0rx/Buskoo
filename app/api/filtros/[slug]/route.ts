import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"

/**
 * API para buscar marcas e regiões disponíveis para filtros
 * GET /api/filtros/[slug]
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

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
        marcas: [],
        regioes: []
      })
    }

    // Buscar marcas distintas (coluna 'fabricante')
    const { data: marcasData } = await supabaseServer
      .from(tableName)
      .select('fabricante')
      .order('fabricante', { ascending: true })

    // Buscar regiões distintas
    const { data: regioesData } = await supabaseServer
      .from(tableName)
      .select('regiao')
      .order('regiao', { ascending: true })

    // Extrair valores únicos
    const marcas = marcasData
      ? Array.from(new Set(marcasData.map(item => item.fabricante))).sort()
      : []

    const regioes = regioesData
      ? Array.from(new Set(regioesData.map(item => item.regiao))).sort()
      : []

    return NextResponse.json({
      marcas,
      regioes
    })
  } catch (error) {
    console.error('Erro ao buscar filtros:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
