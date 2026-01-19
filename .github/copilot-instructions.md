# Copilot Instructions - Hunting Leaderboard

## Project Overview
Dashboard Next.js 14 (App Router) para exibir ranking de candidatos de vagas a partir de Google Sheets. Aplicação server-side com dark mode fixo.

## Architecture

### Data Flow
1. **Google Sheets → Server** - [lib/googleSheets.ts](../lib/googleSheets.ts) busca dados via `google-spreadsheet` com autenticação JWT
2. **Server Components** - [app/page.tsx](../app/page.tsx) é um Server Component async que filtra e ordena candidatos
3. **Client Components** - Apenas interatividade usa `"use client"` (ex: [cargo-filter.tsx](../components/cargo-filter.tsx))

### Key Patterns

**Server vs Client Components:**
- Páginas são Server Components async por padrão
- Use `"use client"` apenas para hooks (`useRouter`, `useSearchParams`) e eventos
- Filtros são passados via `searchParams` URL, processados no servidor

**URL-based State:**
```tsx
// Filtro via query params - NÃO use useState para filtros
interface PageProps {
  searchParams: Promise<{ cargo?: string }>
}
```

## Component Structure

### UI Components (`components/ui/`)
Componentes base estilo shadcn/ui com `class-variance-authority`:
- Use `cn()` de [lib/utils.ts](../lib/utils.ts) para merge de classes
- Variantes customizadas para score: `alta`, `media`, `baixa` em Badge

```tsx
// Exemplo de variantes customizadas - badge.tsx
variant: {
  alta: "bg-green-500/20 text-green-400 border-green-500/50",
  media: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  baixa: "bg-red-500/20 text-red-400 border-red-500/50",
}
```

### Score Classification
```tsx
// Thresholds fixos - getScoreBadge em page.tsx
nota >= 80 → "alta" (verde)
nota >= 50 → "media" (amarelo)
nota < 50  → "baixa" (vermelho)
```

## Data Model

**Candidato Interface:**
```typescript
interface Candidato {
  nome: string   // Nome completo
  cargo: string  // Vaga/posição (usado para filtro)
  local: string  // Localização
  link: string   // URL LinkedIn
  nota: number   // Score 0-100
}
```

**Colunas obrigatórias na planilha:** `Nome`, `Cargo`, `Local`, `Link`, `Nota`

## Development

```bash
npm run dev    # Servidor local :3000
npm run build  # Build produção
npm run lint   # ESLint
```

### Environment Variables (`.env.local`)
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=...
```

## Styling

- **Dark mode fixo** - CSS variables em [globals.css](../app/globals.css) já são tema escuro
- **Tailwind + shadcn** - Use tokens semânticos: `bg-background`, `text-foreground`, `text-muted-foreground`
- **Lucide icons** - Import específico: `import { IconName } from "lucide-react"`

## Conventions

1. **Idioma:** Código em inglês, UI em português brasileiro
2. **Imports:** Use `@/` alias para paths absolutos
3. **Tipos:** Export interfaces junto com funções relacionadas (ex: `Candidato` em googleSheets.ts)
4. **Data refresh:** Use `router.refresh()` para revalidar Server Components
