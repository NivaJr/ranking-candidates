import { cache } from "react"
import { GoogleSpreadsheet } from "google-spreadsheet"
import { JWT } from "google-auth-library"

export interface Candidato {
  nome: string
  cargo: string
  local: string
  link: string
  nota: number
}

// Cache para deduplicar requisições simultâneas
export const getCandidatos = cache(async (): Promise<Candidato[]> => {
  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    // Formatar a chave privada: substituir \n literais por quebras de linha reais
    let privateKey = process.env.GOOGLE_PRIVATE_KEY
    if (privateKey) {
      // Remove aspas externas se existirem
      privateKey = privateKey.replace(/^["']|["']$/g, "")
      // Substitui \n literal por quebras de linha reais
      privateKey = privateKey.replace(/\\n/g, "\n")
      // Também trata o caso de \\n (duplo escape)
      privateKey = privateKey.replace(/\\\\n/g, "\n")
    }
    const sheetId = process.env.GOOGLE_SHEET_ID

    if (!serviceAccountEmail || !privateKey || !sheetId) {
      throw new Error("Variáveis de ambiente do Google Sheets não configuradas")
    }

    // Autenticação
    const serviceAccountAuth = new JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    // Inicializar a planilha
    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth)
    await doc.loadInfo()

    // Percorrer todas as abas da planilha
    const todasAsAbas = doc.sheetsByIndex
    const todosCandidatos: Candidato[] = []

    for (const sheet of todasAsAbas) {
      try {
        // Carregar as linhas da aba atual
        const rows = await sheet.getRows()

        // Mapear as linhas para objetos Candidato
        const candidatosDaAba = rows.map((row) => {
          // Converter Nota para número (pode vir como string)
          const notaStr = row.get("Nota")?.toString() || "0"
          const nota = parseFloat(notaStr) || 0

          return {
            nome: row.get("Nome")?.toString().trim() || "",
            cargo: row.get("Cargo")?.toString().trim() || "",
            local: row.get("Local")?.toString().trim() || "",
            link: row.get("Link")?.toString().trim() || "",
            nota: nota,
          }
        })

        // Adicionar os candidatos desta aba à lista geral
        todosCandidatos.push(...candidatosDaAba)
      } catch (error) {
        // Se houver erro ao ler uma aba, registra mas continua com as outras
        console.warn(`Erro ao ler aba "${sheet.title}":`, error)
      }
    }

    return todosCandidatos
  } catch (error) {
    console.error("Erro ao buscar dados do Google Sheets:", error)
    throw error
  }
})
