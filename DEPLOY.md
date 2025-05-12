# Guia de Deploy no Netlify

Este guia explica como fazer o deploy deste projeto no Netlify corretamente.

## Pré-requisitos

1. Uma conta no [GitHub](https://github.com/)
2. Uma conta no [Netlify](https://www.netlify.com/)
3. Projeto Supabase existente

## Passos para Deploy

### 1. Faça upload do projeto para o GitHub

```bash
# Inicializar o repositório git (caso ainda não tenha feito)
git init

# Adicionar arquivos
git add .

# Fazer commit
git commit -m "Versão inicial"

# Conectar ao seu repositório remoto
git remote add origin https://github.com/seu-usuario/seu-repositorio.git

# Enviar para o GitHub
git push -u origin main
```

### 2. Configurar o Netlify

1. Faça login no Netlify
2. Clique em "New site from Git"
3. Selecione GitHub como provedor de Git
4. Selecione o repositório que acabou de criar
5. Configure as seguintes opções de build:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Adicione as seguintes variáveis de ambiente:
   - `VITE_SUPABASE_URL`: URL do seu projeto Supabase
   - `VITE_SUPABASE_ANON_KEY`: Chave anônima do seu projeto Supabase
7. Clique em "Deploy site"

### 3. Configurar CORS no Supabase

1. Acesse seu projeto no painel do Supabase
2. Vá para Settings > API
3. Em "Allowed Origins", adicione o domínio do seu site no Netlify:
   - `https://seu-site.netlify.app`
   - `https://seu-dominio-personalizado.com` (se estiver usando um domínio personalizado)

### 4. Configurar domínio personalizado (opcional)

1. No painel do Netlify, vá para Site settings > Domain management
2. Clique em "Add custom domain"
3. Siga as instruções para configurar seu domínio personalizado

## Solução de Problemas

### Erros de CORS

Se estiver enfrentando erros de CORS:

- Verifique se o domínio foi adicionado corretamente nas configurações do Supabase
- Certifique-se de que está usando o protocolo correto (https://)

### Problemas com Rotas

O arquivo `netlify.toml` na raiz do projeto configura todos os redirecionamentos necessários para o React Router funcionar corretamente. Se as rotas não estiverem funcionando:

- Verifique se o arquivo `netlify.toml` está presente no repositório
- Confirme que o conteúdo está correto

### Variáveis de Ambiente

Se as conexões com o Supabase não estiverem funcionando:

- Verifique se as variáveis de ambiente estão configuradas corretamente no Netlify
- Certifique-se de que os valores das variáveis estão corretos

## Lembre-se!

- As políticas de Row Level Security (RLS) do Supabase devem estar configuradas para permitir acesso público às tabelas necessárias
- A chave anônima do Supabase é pública, mas tem acesso limitado pelo RLS
- O conteúdo de `.env` não deve ser adicionado ao Git, use `.gitignore` para excluí-lo
