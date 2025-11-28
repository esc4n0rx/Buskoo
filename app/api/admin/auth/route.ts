import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: "Senha é obrigatória" },
        { status: 400 }
      )
    }

    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      console.error("ADMIN_PASSWORD não configurada no ambiente")
      return NextResponse.json(
        { error: "Configuração do servidor inválida" },
        { status: 500 }
      )
    }

    if (password !== adminPassword) {
      return NextResponse.json(
        { error: "Senha incorreta" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Autenticação realizada com sucesso",
    })
  } catch (error) {
    console.error("Erro na autenticação:", error)
    return NextResponse.json(
      { error: "Erro ao processar autenticação" },
      { status: 500 }
    )
  }
}
