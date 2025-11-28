import { Header } from "@/components/header"
import { CategoryCard } from "@/components/category-card"
import { supabaseServer } from "@/lib/supabase/server"
import type { Categoria } from "@/lib/types"

async function getCategorias(): Promise<Categoria[]> {
  try {
    const { data, error } = await supabaseServer
      .from('buskoo_categorias')
      .select('*')
      .order('nome', { ascending: true })

    if (error) {
      console.error('Erro ao buscar categorias:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Erro inesperado ao buscar categorias:', error)
    return []
  }
}

export default async function HomePage() {
  const categorias = await getCategorias()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Encontre os melhores produtos
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Navegue por nossas categorias e descubra produtos incríveis com os melhores preços do mercado.
          </p>
        </section>

        <section aria-labelledby="categorias-heading">
          <h2 id="categorias-heading" className="sr-only">
            Categorias de Produtos
          </h2>
          {categorias.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                Nenhuma categoria disponível no momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {categorias.map((categoria) => (
                <CategoryCard key={categoria.id} categoria={categoria} />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-border py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Buskoo. Todos os direitos reservados.</p>
          <p className="mt-2">Catálogo de produtos - Não é uma loja virtual</p>
        </div>
      </footer>
    </div>
  )
}

// Revalidar a cada 1 hora
export const revalidate = 3600
