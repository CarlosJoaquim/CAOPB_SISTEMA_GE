# 🎯 Dashboard Administrativo Caop-B

Sistema web completo de painel administrativo para a plataforma **Caop-B** (Lazer ao alcance do seu bolso).

---

## 📋 Sobre o Sistema

Dashboard profissional e moderno para gestão total da plataforma Caop-B, incluindo:

✅ **Gestão de Usuários** - Controle completo de usuários, agentes e admins
✅ **Gestão de Estabelecimentos** - Gerenciamento de lugares/locais
✅ **Controle de Reservas** - Visualização e alteração de status
✅ **Gestão de Pedidos** - Acompanhamento de pedidos em tempo real
✅ **Análise Financeira** - Gráficos, métricas e receita detalhada
✅ **Avaliações** - Monitoramento de feedback dos usuários
✅ **Favoritos** - Ranking de lugares mais populares
✅ **Exportação em PDF** - Relatórios financeiros exportáveis

---

## 🚀 Configuração Inicial

### 1️⃣ Criar Usuário Administrador

Antes de usar o sistema, você precisa criar um usuário admin no Supabase:

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Execute o script que está em `SETUP_ADMIN.sql`

Ou execute manualmente:

```sql
INSERT INTO usuarios (nome, sobrenome, email, senha, telefone, papel, ativo)
VALUES ('Admin', 'Caop-B', 'admin@caopb.com', 'admin123', '+244900000000', 'ADMIN', true);
```

### 2️⃣ Deploy do Servidor Backend (Edge Function)

O servidor backend precisa ser deployado no Supabase:

1. Acesse o **Supabase Dashboard**
2. Vá em **Edge Functions**
3. Crie uma nova função chamada `make-server-b2f35964`
4. Cole o código do arquivo `src/supabase/functions/server/index.tsx`
5. Configure as variáveis de ambiente:
   - `SUPABASE_URL`: https://ewyckxscedklztarigha.supabase.co
   - `SUPABASE_SERVICE_ROLE_KEY`: (sua chave de serviço)   - `VITE_SUPABASE_ANON_KEY`: sua chave pública Supabase
   - `VITE_SUPABASE_FUNCTION_URL`: https://ewyckxscedklztarigha.supabase.co/functions/v1/make-server-b2f35964

> Nunca coloque `SUPABASE_SERVICE_ROLE_KEY` no frontend. Essa chave deve ficar apenas no backend / ambiente da função.
### 3️⃣ Fazer Login

Use as credenciais criadas:

- **Email**: `admin@caopb.com`
- **Senha**: `admin123`

⚠️ **IMPORTANTE**: Troque a senha padrão em produção!

---

## 🎨 Funcionalidades Principais

### 📊 Dashboard Geral
- Métricas em tempo real (usuários, agentes, estabelecimentos, receita)
- Gráfico de crescimento de usuários
- Gráfico de receita mensal
- Distribuição de tipos de usuários
- Lugares mais populares

### 👥 Gestão de Usuários
- Listagem completa com busca
- Filtro por tipo (USUARIO, AGENTE, ADMIN)
- Ativar/desativar usuários
- Ver histórico de atividades (reservas, pedidos, avaliações)
- Detalhes completos de cada usuário

### 🏢 Gestão de Lugares
- Cards visuais com métricas de cada lugar
- Busca por nome ou categoria
- Visualização de receita por estabelecimento
- Contadores de reservas e pedidos
- Ativar/desativar lugares

### 📅 Reservas
- Listagem completa com detalhes
- Filtro por status (PENDENTE, ACEITA, REJEITADA, CONCLUIDA, CANCELADA)
- Alterar status das reservas
- Informações de usuário e lugar

### 🛒 Pedidos
- Listagem de todos os pedidos
- Filtro por status
- Acompanhamento de entrega (RETIRADA/ENTREGA)
- Workflow completo (PENDENTE → ACEITO → EM_TRANSITO → CONCLUIDO)

### ⭐ Avaliações
- Visualização de todas as avaliações
- Estatísticas (média, melhores, piores)
- Comentários dos usuários

### ❤️ Favoritos
- Ranking de lugares mais favoritados
- Insights de popularidade

### 💰 Análise Financeira
- Receita total e ticket médio
- Gráfico de receita mensal
- Distribuição de receita por fonte (reservas/pedidos)
- Top 10 lugares por faturamento
- **Exportação de relatórios em PDF**

---

## 🎨 Design e UX

- ✨ **Design moderno** estilo SaaS premium
- 🌓 **Tema escuro/claro** (toggle no header)
- 📱 **Totalmente responsivo** (desktop, tablet, mobile)
- 🎯 **Sidebar fixa** com navegação intuitiva
- 📊 **Gráficos interativos** com Recharts
- 🎨 **Cores vibrantes** e animações suaves

---

## 🔐 Segurança

- ✅ Acesso restrito apenas para usuários **ADMIN**
- ✅ Validação de token em todas as rotas
- ✅ Proteção de rotas no backend
- ✅ Logout seguro com limpeza de sessão

⚠️ **ATENÇÃO**: Este sistema usa autenticação básica. Para produção:
- Implemente bcrypt para hash de senhas
- Use JWT com expiração
- Adicione refresh tokens
- Configure HTTPS obrigatório

---

## 📦 Tecnologias Utilizadas

### Frontend
- **React** - Framework principal
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Recharts** - Gráficos interativos
- **Lucide React** - Ícones
- **jsPDF** - Exportação de PDFs

### Backend
- **Supabase** - Backend completo
- **PostgreSQL** - Banco de dados
- **Edge Functions** - Servidor Hono
- **Supabase Auth** - Autenticação

---

## 📂 Estrutura do Projeto

```
src/
├── app/
│   ├── components/
│   │   ├── Sidebar.tsx              # Menu lateral
│   │   ├── LoginPage.tsx            # Tela de login
│   │   ├── MetricCard.tsx           # Card de métricas
│   │   └── pages/
│   │       ├── DashboardPage.tsx    # Dashboard principal
│   │       ├── UsersPage.tsx        # Gestão de usuários
│   │       ├── PlacesPage.tsx       # Gestão de lugares
│   │       ├── ReservationsPage.tsx # Gestão de reservas
│   │       ├── OrdersPage.tsx       # Gestão de pedidos
│   │       ├── ReviewsPage.tsx      # Avaliações
│   │       ├── FavoritesPage.tsx    # Favoritos
│   │       └── FinancePage.tsx      # Análise financeira
│   └── App.tsx                      # App principal
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx            # Servidor Hono
│           └── kv_store.tsx         # Cliente Supabase
└── utils/
    └── supabase/
        └── info.tsx                 # Credenciais do Supabase
```

---

## 🛠️ Comandos Úteis

```bash
# Instalar dependências
pnpm install

# Executar em desenvolvimento
pnpm dev

# Build para produção
pnpm build
```

---

## 📊 Endpoints da API

Todos os endpoints estão prefixados com `/make-server-b2f35964`:

### Dashboard
- `GET /dashboard/stats` - Estatísticas gerais
- `GET /dashboard/user-growth` - Crescimento de usuários
- `GET /dashboard/monthly-revenue` - Receita mensal
- `GET /dashboard/user-distribution` - Distribuição de usuários
- `GET /dashboard/popular-places` - Lugares populares

### Usuários
- `GET /users` - Listar usuários
- `GET /users/:id` - Detalhes do usuário
- `PUT /users/:id` - Atualizar usuário

### Lugares
- `GET /places` - Listar lugares
- `GET /places/:id` - Detalhes do lugar
- `PUT /places/:id` - Atualizar lugar

### Reservas
- `GET /reservations` - Listar reservas
- `PUT /reservations/:id` - Atualizar status

### Pedidos
- `GET /orders` - Listar pedidos
- `PUT /orders/:id` - Atualizar status

### Avaliações e Favoritos
- `GET /reviews` - Listar avaliações
- `GET /favorites` - Lugares favoritos

### Autenticação
- `POST /auth/login` - Login de admin

---

## 🚨 Problemas Comuns

### Erro ao fazer login
- Verifique se o usuário admin foi criado no banco
- Confirme que o papel é 'ADMIN'
- Verifique se a senha está correta

### Dados não carregam
- Confirme que o Edge Function foi deployado
- Verifique as variáveis de ambiente no Supabase
- Confira se o token de autenticação é válido

### Gráficos não aparecem
- Verifique se há dados no banco de dados
- Confirme que as datas estão no formato correto

---

## 📝 Próximos Passos (Melhorias Futuras)

- [ ] Implementar paginação nas tabelas
- [ ] Adicionar filtros avançados
- [ ] Criar sistema de notificações em tempo real
- [ ] Implementar upload de imagens para lugares
- [ ] Adicionar mais tipos de gráficos
- [ ] Criar dashboard para agentes
- [ ] Implementar chat de suporte
- [ ] Adicionar logs de auditoria

---

## 📞 Suporte

Para dúvidas ou problemas:
- Email: admin@caopb.com
- Sistema: Caop-B - Lazer ao alcance do seu bolso

---

## 📄 Licença

© 2026 Caop-B. Todos os direitos reservados.

---

**Desenvolvido com ❤️ para a plataforma Caop-B em Angola** 🇦🇴
