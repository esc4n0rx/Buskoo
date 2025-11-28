import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabaseServer
      .from('buskoo_solicitacoes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error("Erro ao deletar solicitação:", error)
      return NextResponse.json(
        { error: "Erro ao deletar solicitação" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Solicitação deletada com sucesso"
    })
  } catch (error) {
    console.error("Erro inesperado:", error)
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    )
  }
}
