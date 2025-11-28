import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"
import type { SolicitacaoInsert } from "@/lib/supabase/types"

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('buskoo_solicitacoes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Erro ao buscar solicitações:", error)
      return NextResponse.json(
        { error: "Erro ao buscar solicitações" },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Erro inesperado:", error)
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar campos obrigatórios
    if (!body.nome || !body.produto || !body.pagamento) {
      return NextResponse.json(
        { error: "Campos obrigatórios: nome, produto, pagamento" },
        { status: 400 }
      )
    }

    // Preparar dados para inserção
    const solicitacao: SolicitacaoInsert = {
      nome: body.nome,
      produto: body.produto,
      pagamento: body.pagamento,
      obs: body.obs || null,
    }

    // Inserir no banco de dados
    const { data, error } = await supabaseServer
      .from('buskoo_solicitacoes')
      .insert(solicitacao)
      .select()

    if (error) {
      console.error("Erro ao salvar solicitação:", error)
      return NextResponse.json(
        { error: "Erro ao processar solicitação" },
        { status: 500 }
      )
    }

    console.log("Nova solicitação registrada:", data)

    return NextResponse.json({
      success: true,
      message: "Solicitação registrada com sucesso",
      id: data?.[0]?.id,
    }, { status: 201 })
  } catch (error) {
    console.error("Erro inesperado:", error)
    return NextResponse.json(
      { error: "Erro ao processar solicitação" },
      { status: 500 }
    )
  }
}
