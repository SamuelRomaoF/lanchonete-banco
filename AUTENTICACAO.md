# Sistema de Autenticação do FastLanche

O sistema de autenticação do FastLanche foi implementado usando o Supabase Auth para proporcionar uma experiência segura aos usuários.

## Características Implementadas

- **Registro de Usuários**: Os clientes podem criar suas próprias contas
- **Login**: Sistema de login com email e senha
- **Perfis de Usuário**: Integração entre autenticação e perfil do usuário
- **Segurança**: Políticas de acesso a dados (Row Level Security)
- **Autorização**: Permissões diferentes para clientes e administradores

## Como Funciona

1. **Registro de Usuário**:

   - Quando um cliente se registra, é criado um registro na tabela Auth do Supabase
   - Um trigger automático cria um perfil na tabela `users` com tipo "cliente"
   - A senha é armazenada de forma segura, com hash e salt, pelo Supabase Auth

2. **Login**:

   - O usuário faz login com email e senha
   - Supabase Auth valida as credenciais e retorna um token JWT
   - O token é usado para autorizar requisições futuras

3. **Perfil de Usuário**:

   - Os dados do perfil são armazenados na tabela `users`
   - Ao fazer login, o sistema busca as informações do perfil e as disponibiliza para a aplicação

4. **Segurança**:
   - Row Level Security garante que os usuários só possam acessar seus próprios dados
   - Administradores têm acesso estendido a todos os dados
   - Funções de segurança controlam o acesso a operações sensíveis

## Estrutura de Autenticação

### Tabelas

- **auth.users**: Tabela interna do Supabase que gerencia autenticação
- **public.users**: Tabela de perfis de usuário com informações adicionais
- **policies**: Políticas que controlam o acesso aos dados

### Tipos de Usuário

1. **Cliente**:

   - Pode criar e gerenciar seu próprio perfil
   - Pode ver e gerenciar seus próprios pedidos
   - Não tem acesso a dados de outros usuários ou administrativos

2. **Administrador**:
   - Tem acesso completo ao sistema
   - Pode gerenciar produtos, categorias, pedidos
   - Tem acesso ao painel administrativo

## Fluxos de Uso

### Registro

1. Usuário acessa a página de registro
2. Preenche o formulário com nome, email, senha
3. Ao enviar, o sistema cria o usuário no Auth e na tabela users
4. Usuário é automaticamente logado e redirecionado para a página inicial

### Login

1. Usuário acessa a página de login
2. Informa email e senha
3. Sistema valida e cria uma sessão autenticada
4. Usuário é redirecionado para a página inicial

## Credenciais de Administrador

Para acessar as funcionalidades de administrador, use:

- Email: admin@fastlanche.com.br
- Senha: admin123
