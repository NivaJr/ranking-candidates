import { getCandidatos, type Candidato } from "@/lib/googleSheets"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Users, TrendingUp, Award } from "lucide-react"
import { CargoFilter } from "@/components/cargo-filter"
import { Suspense } from "react"

interface PageProps {
  searchParams: Promise<{ cargo?: string }>
}

// ISR: Revalidar a página no máximo a cada 60 segundos
export const revalidate = 60

function getScoreBadge(nota: number) {
  if (nota >= 80) {
    return <Badge variant="alta">Alta</Badge>
  } else if (nota >= 50) {
    return <Badge variant="media">Média</Badge>
  } else {
    return <Badge variant="baixa">Baixa</Badge>
  }
}


export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams
  let candidatos: Candidato[] = []
  let error: string | null = null
  let isQuotaError = false

  try {
    candidatos = await getCandidatos()
    
    // Se retornou array vazio, pode ser erro de quota
    if (candidatos.length === 0) {
      isQuotaError = true
      error = "Limite de tráfego atingido. Tente novamente em 1 minuto"
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    
    // Verificar se é erro de quota
    if (errorMessage.includes("429") || errorMessage.includes("Quota") || errorMessage.includes("quota")) {
      isQuotaError = true
      error = "Limite de tráfego atingido. Tente novamente em 1 minuto"
    } else {
      error = errorMessage || "Erro ao carregar dados"
    }
  }

  // Filtrar por cargo se especificado (normalizando para comparação)
  const cargoFiltro = params.cargo?.trim()
  const candidatosFiltrados = cargoFiltro
    ? candidatos.filter((c) => c.cargo?.trim() === cargoFiltro)
    : candidatos

  // Obter lista única de cargos (removendo valores vazios e normalizando)
  const cargosUnicos = Array.from(
    new Set(
      candidatos
        .map((c) => c.cargo?.trim())
        .filter((cargo) => cargo && cargo.length > 0)
    )
  ).sort()

  // Ordenar por nota (decrescente)
  const candidatosOrdenados = [...candidatosFiltrados].sort((a, b) => b.nota - a.nota)

  // Calcular métricas
  const totalCandidatos = candidatosFiltrados.length
  const mediaNota =
    totalCandidatos > 0
      ? candidatosFiltrados.reduce((sum, c) => sum + c.nota, 0) / totalCandidatos
      : 0
  const topTalento =
    candidatosOrdenados.length > 0 ? candidatosOrdenados[0].nome : "N/A"

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-4xl font-bold">🎯 Hunting Leaderboard</h1>
          <Suspense fallback={<div className="h-10 w-[250px] animate-pulse bg-muted rounded-md" />}>
            <CargoFilter cargos={cargosUnicos} cargoAtual={cargoFiltro} />
          </Suspense>
        </div>

        {error ? (
          <Card className={isQuotaError ? "border-yellow-500/50 bg-yellow-500/10" : "border-destructive"}>
            <CardContent className="pt-6">
              <p className={isQuotaError ? "text-yellow-600 dark:text-yellow-400 font-medium" : "text-destructive"}>
                {isQuotaError ? "⚠️ " : ""}{error}
              </p>
              {isQuotaError && (
                <p className="text-sm text-muted-foreground mt-2">
                  O cache será atualizado automaticamente em até 60 segundos. Você também pode clicar no botão de refresh.
                </p>
              )}
            </CardContent>
          </Card>
        ) : candidatos.length === 0 ? (
          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="pt-6">
              <p className="text-yellow-600 dark:text-yellow-400 font-medium">
                ⚠️ Limite de tráfego atingido. Tente novamente em 1 minuto
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                O cache será atualizado automaticamente em até 60 segundos. Você também pode clicar no botão de refresh.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Candidatos
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCandidatos}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Média de Match
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mediaNota.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Top Talento</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold truncate">{topTalento}</div>
                </CardContent>
              </Card>
            </div>

            {/* Tabela de Ranking */}
            <Card>
              <CardHeader>
                <CardTitle>Ranking de Candidatos</CardTitle>
              </CardHeader>
              <CardContent>
                {candidatosOrdenados.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum candidato encontrado
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Local</TableHead>
                        <TableHead className="text-center">Nota</TableHead>
                        <TableHead className="text-center">Score</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {candidatosOrdenados.map((candidato, index) => (
                        <TableRow key={`${candidato.nome}-${index}`}>
                          <TableCell className="font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {candidato.nome}
                          </TableCell>
                          <TableCell>{candidato.cargo}</TableCell>
                          <TableCell>{candidato.local}</TableCell>
                          <TableCell className="text-center">
                            {candidato.nota.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-center">
                            {getScoreBadge(candidato.nota)}
                          </TableCell>
                          <TableCell className="text-right">
                            {candidato.link ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                              >
                                <a
                                  href={candidato.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  LinkedIn
                                </a>
                              </Button>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                N/A
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
