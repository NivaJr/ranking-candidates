# 📦 Instruções de Instalação

## Passo 1: Instalar Dependências

Execute o seguinte comando na raiz do projeto:

```bash
npm install
```

Isso instalará todas as dependências necessárias:
- `next` - Framework Next.js 14
- `react` e `react-dom` - React
- `google-spreadsheet` - Biblioteca para integração com Google Sheets
- `google-auth-library` - Autenticação do Google
- `lucide-react` - Ícones
- `clsx` e `tailwind-merge` - Utilitários para classes CSS
- `class-variance-authority` - Para variantes de componentes
- `tailwindcss-animate` - Animações do Tailwind

## Passo 2: Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.local.example` para `.env.local`:

```bash
# No Windows (PowerShell)
Copy-Item .env.local.example .env.local

# No Linux/Mac
cp .env.local.example .env.local
```

2. Edite o arquivo `.env.local` e preencha com suas credenciais:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=seu-email@projeto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSua chave privada aqui\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=id-da-sua-planilha
```

### Como obter as credenciais:

#### A. Criar Conta de Serviço no Google Cloud

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs e Serviços** > **Biblioteca**
4. Procure por "Google Sheets API" e ative
5. Vá em **APIs e Serviços** > **Credenciais**
6. Clique em **Criar credenciais** > **Conta de serviço**
7. Preencha os dados e crie
8. Clique na conta criada e vá em **Chaves**
9. Clique em **Adicionar chave** > **Criar nova chave** > **JSON**
10. Baixe o arquivo JSON

#### B. Extrair Credenciais do JSON

Abra o arquivo JSON baixado e extraia:
- `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key` → `GOOGLE_PRIVATE_KEY` (mantenha as quebras de linha `\n`)

#### C. Obter ID da Planilha

1. Abra sua planilha do Google Sheets
2. A URL será algo como:
   ```
   https://docs.google.com/spreadsheets/d/SEU_SHEET_ID_AQUI/edit
   ```
3. Copie o `SEU_SHEET_ID_AQUI` para `GOOGLE_SHEET_ID`

#### D. Compartilhar Planilha

1. Na planilha do Google Sheets, clique em **Compartilhar**
2. Adicione o email da conta de serviço (o `client_email` do JSON)
3. Dê permissão de **Visualizador**

## Passo 3: Executar a Aplicação

```bash
npm run dev
```

A aplicação estará disponível em: [http://localhost:3000](http://localhost:3000)

## Estrutura da Planilha

Certifique-se de que sua planilha tenha as seguintes colunas na **primeira linha**:

| Nome | Cargo | Local | Link | Nota |
|------|-------|-------|------|------|
| João Silva | Desenvolvedor | São Paulo | https://linkedin.com/... | 85 |
| Maria Santos | Designer | Rio de Janeiro | https://linkedin.com/... | 72 |

- **Nome**: Nome completo do candidato
- **Cargo**: Nome da vaga (usado para filtro)
- **Local**: Localização
- **Link**: URL do LinkedIn
- **Nota**: Número de 0 a 100 (aderência)

## Troubleshooting

### Erro: "Variáveis de ambiente do Google Sheets não configuradas"
- Verifique se o arquivo `.env.local` existe
- Confirme que todas as variáveis estão preenchidas
- Reinicie o servidor após alterar `.env.local`

### Erro: "Permission denied" ou "Access denied"
- Verifique se a planilha foi compartilhada com o email da conta de serviço
- Confirme que a conta de serviço tem permissão de "Visualizador"

### Erro: "Invalid credentials"
- Verifique se o `GOOGLE_PRIVATE_KEY` está com as quebras de linha `\n`
- Confirme que o email da conta de serviço está correto

### Dados não aparecem
- Verifique se a primeira linha da planilha tem os headers corretos (Nome, Cargo, Local, Link, Nota)
- Confirme que há dados nas linhas abaixo do header
- Verifique o console do servidor para erros
