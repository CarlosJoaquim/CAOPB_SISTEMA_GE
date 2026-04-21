import { Hono } from "npm:hono@4";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono().basePath("/make-server-b2f35964");

// Middleware
app.use("*", cors());
app.use("*", logger(console.log));

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://ewyckxscedklztarigha.supabase.co";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseServiceKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for backend Supabase auth operations.");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DEFAULT_LEGAL_DOCUMENTS = [
  {
    id: "default-termos",
    tipo: "termos",
    titulo: "Termos de Uso",
    conteudo: "# Termos de Uso\n\n## 1. Aceitação dos Termos\nAo acessar e usar este aplicativo, você concorda em cumprir estes termos de uso.",
    versao: "1.2.0",
    ativo: true,
    criado_em: "2024-01-15T10:00:00Z",
    atualizado_em: "2024-01-15T10:00:00Z",
    readonly: true
  },
  {
    id: "default-privacidade",
    tipo: "privacidade",
    titulo: "Política de Privacidade",
    conteudo: "# Política de Privacidade\n\n## 1. Coleta de Dados\nColetamos apenas os dados necessários para o funcionamento do serviço.",
    versao: "1.1.0",
    ativo: true,
    criado_em: "2024-01-10T14:00:00Z",
    atualizado_em: "2024-01-10T14:00:00Z",
    readonly: true
  }
] as const;

function isMissingTableError(error: any) {
  return error?.code === "PGRST205" || String(error?.message || "").includes("schema cache");
}

async function findAuthUserIdByEmail(email: string) {
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000
  });

  if (error) {
    throw error;
  }

  return data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase())?.id ?? null;
}

// Helper function to verify admin access
async function verifyAdmin(request: Request) {
  const accessToken = request.headers.get("Authorization")?.split(" ")[1];
  if (!accessToken) {
    return { authorized: false, userId: null };
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return { authorized: false, userId: null };
  }

  // Check if user is admin
  const { data: userData } = await supabase
    .from("usuarios")
    .select("id, papel")
    .ilike("email", user.email ?? "")
    .single();

  return {
    authorized: userData?.papel === "ADMIN",
    userId: userData?.id ?? null
  };
}

// Dashboard - Estatísticas Gerais
app.get("/dashboard/stats", async (c) => {
  try {
    const { authorized } = await verifyAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error: "Não autorizado. Acesso apenas para ADMIN." }, 401);
    }

    // Contadores
    const [usuarios, agentes, admins, lugares, reservas, pedidos] = await Promise.all([
      supabase.from("usuarios").select("id", { count: "exact" }).eq("papel", "USUARIO"),
      supabase.from("usuarios").select("id", { count: "exact" }).eq("papel", "AGENTE"),
      supabase.from("usuarios").select("id", { count: "exact" }).eq("papel", "ADMIN"),
      supabase.from("lugares").select("id", { count: "exact" }),
      supabase.from("reservas").select("id", { count: "exact" }),
      supabase.from("pedidos").select("id", { count: "exact" }),
    ]);

    // Receita total
    const { data: receitaReservas } = await supabase
      .from("reservas")
      .select("preco_total");
    const { data: receitaPedidos } = await supabase
      .from("pedidos")
      .select("preco_total");

    const receitaTotal =
      (receitaReservas?.reduce((sum, r) => sum + (parseFloat(r.preco_total) || 0), 0) || 0) +
      (receitaPedidos?.reduce((sum, p) => sum + (parseFloat(p.preco_total) || 0), 0) || 0);

    // Ticket médio
    const totalTransacoes = (reservas.count || 0) + (pedidos.count || 0);
    const ticketMedio = totalTransacoes > 0 ? receitaTotal / totalTransacoes : 0;

    return c.json({
      totalUsuarios: usuarios.count || 0,
      totalAgentes: agentes.count || 0,
      totalAdmins: admins.count || 0,
      totalLugares: lugares.count || 0,
      totalReservas: reservas.count || 0,
      totalPedidos: pedidos.count || 0,
      receitaTotal: receitaTotal.toFixed(2),
      ticketMedio: ticketMedio.toFixed(2)
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas do dashboard:", error);
    return c.json({ error: "Erro ao buscar estatísticas", details: error.message }, 500);
  }
});

// Crescimento de usuários (últimos 30 dias)
app.get("/dashboard/user-growth", async (c) => {
  try {
    const { authorized } = await verifyAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const { data, error } = await supabase
      .from("usuarios")
      .select("criado_em")
      .gte("criado_em", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order("criado_em", { ascending: true });

    if (error) throw error;

    // Agrupar por dia
    const growthByDay = data.reduce((acc: any, user) => {
      const day = new Date(user.criado_em).toISOString().split("T")[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    return c.json(
      Object.entries(growthByDay).map(([date, count]) => ({ date, count }))
    );
  } catch (error) {
    console.error("Erro ao buscar crescimento de usuários:", error);
    return c.json({ error: "Erro ao buscar crescimento", details: error.message }, 500);
  }
});

// Receita mensal (últimos 12 meses)
app.get("/dashboard/monthly-revenue", async (c) => {
  try {
    const { authorized } = await verifyAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const { data: reservasData } = await supabase
      .from("reservas")
      .select("preco_total, criado_em")
      .gte("criado_em", new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

    const { data: pedidosData } = await supabase
      .from("pedidos")
      .select("preco_total, criado_em")
      .gte("criado_em", new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

    const revenueByMonth: any = {};

    reservasData?.forEach((r) => {
      const month = new Date(r.criado_em).toISOString().slice(0, 7);
      revenueByMonth[month] = (revenueByMonth[month] || 0) + (parseFloat(r.preco_total) || 0);
    });

    pedidosData?.forEach((p) => {
      const month = new Date(p.criado_em).toISOString().slice(0, 7);
      revenueByMonth[month] = (revenueByMonth[month] || 0) + (parseFloat(p.preco_total) || 0);
    });

    return c.json(
      Object.entries(revenueByMonth)
        .map(([month, revenue]) => ({ month, revenue: parseFloat(revenue as string).toFixed(2) }))
        .sort((a, b) => a.month.localeCompare(b.month))
    );
  } catch (error) {
    console.error("Erro ao buscar receita mensal:", error);
    return c.json({ error: "Erro ao buscar receita", details: error.message }, 500);
  }
});

// Distribuição de tipos de usuários
app.get("/dashboard/user-distribution", async (c) => {
  try {
    const { authorized } = await verifyAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const { data, error } = await supabase
      .from("usuarios")
      .select("papel");

    if (error) throw error;

    const distribution = data.reduce((acc: any, user) => {
      acc[user.papel] = (acc[user.papel] || 0) + 1;
      return acc;
    }, {});

    return c.json(
      Object.entries(distribution).map(([papel, count]) => ({ papel, count }))
    );
  } catch (error) {
    console.error("Erro ao buscar distribuição de usuários:", error);
    return c.json({ error: "Erro ao buscar distribuição", details: error.message }, 500);
  }
});

// Lugares mais populares
app.get("/dashboard/popular-places", async (c) => {
  try {
    const { authorized } = await verifyAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const { data, error } = await supabase
      .from("lugares")
      .select("id, nome, avaliacao")
      .order("avaliacao", { ascending: false })
      .limit(10);

    if (error) throw error;

    // Contar reservas e pedidos para cada lugar
    const placesWithCounts = await Promise.all(
      data.map(async (lugar) => {
        const [reservas, pedidos] = await Promise.all([
          supabase.from("reservas").select("id", { count: "exact" }).eq("lugar_id", lugar.id),
          supabase.from("pedidos").select("id", { count: "exact" }).eq("lugar_id", lugar.id),
        ]);

        return {
          ...lugar,
          totalReservas: reservas.count || 0,
          totalPedidos: pedidos.count || 0,
          totalInteracoes: (reservas.count || 0) + (pedidos.count || 0)
        };
      })
    );

    return c.json(placesWithCounts.sort((a, b) => b.totalInteracoes - a.totalInteracoes));
  } catch (error) {
    console.error("Erro ao buscar lugares populares:", error);
    return c.json({ error: "Erro ao buscar lugares", details: error.message }, 500);
  }
});

// Dashboard - Atividade Recente
app.get("/dashboard/recent-activity", async (c) => {
  try {
    const { authorized } = await verifyAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    // Buscar últimas reservas e pedidos
    const [reservas, pedidos] = await Promise.all([
      supabase.from("reservas").select("id, criado_em, status, lugar:nome").order("criado_em", { ascending: false }).limit(5),
      supabase.from("pedidos").select("id, criado_em, status, lugar:nome, produto:nome").order("criado_em", { ascending: false }).limit(5)
    ]);

    // Formatar atividade
    const atividades = [
      ...(reservas.data || []).map(r => ({ tipo: 'reserva', ...r })),
      ...(pedidos.data || []).map(p => ({ tipo: 'pedido', ...p }))
    ].sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()).slice(0, 10);

    return c.json(atividades);
  } catch (error) {
    console.error("Erro ao buscar atividade recente:", error);
    return c.json({ error: "Erro ao buscar atividade", details: error.message }, 500);
  }
});

// USUÁRIOS - Listar todos
app.get("/users", async (c) => {
  try {
    const { authorized } = await verifyAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const papel = c.req.query("papel");
    const busca = c.req.query("busca");

    let query = supabase.from("usuarios").select("*");

    if (papel) {
      query = query.eq("papel", papel);
    }

    if (busca) {
      query = query.or(`nome.ilike.%${busca}%,email.ilike.%${busca}%`);
    }

    const { data, error } = await query.order("criado_em", { ascending: false });

    if (error) throw error;

    // Remove senha do retorno
    const users = data.map(({ senha, ...user }) => user);

    return c.json(users);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return c.json({ error: "Erro ao listar usuários", details: error.message }, 500);
  }
});

// USUÁRIOS - Detalhes de um usuário
app.get("/users/:id", async (c) => {
  try {
    const { authorized } = await verifyAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const id = c.req.param("id");

    const { data: user, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    // Buscar atividades do usuário
    const [reservas, pedidos, avaliacoes, lugares, produtos] = await Promise.all([
      supabase.from("reservas").select("*").eq("usuario_id", id),
      supabase.from("pedidos").select("*").eq("usuario_id", id),
      supabase.from("avaliacoes").select("*").eq("usuario_id", id),
      // Buscar lugares e produtos se for agente
      user.papel === "AGENTE" 
        ? supabase.from("lugares").select("*").eq("usuario_id", id)
        : Promise.resolve({ data: [], error: null }),
    ]);

    // Se for agente, buscar produtos de todos os seus lugares
    let agentProducts: any[] = [];
    if (user.papel === "AGENTE" && lugares.data && lugares.data.length > 0) {
      const lugarIds = lugares.data.map((l: any) => l.id);
      const { data: produtos } = await supabase
        .from("produtos")
        .select("*")
        .in("lugar_id", lugarIds);
      agentProducts = produtos || [];
    }

    const { senha, ...userWithoutPassword } = user;

    return c.json({
      ...userWithoutPassword,
      atividades: {
        reservas: reservas.data || [],
        pedidos: pedidos.data || [],
        avaliacoes: avaliacoes.data || []
      },
      ...(user.papel === "AGENTE" && {
        lugares: lugares.data || [],
        produtos: agentProducts
      })
    });
  } catch (error) {
    console.error("Erro ao buscar detalhes do usuário:", error);
    return c.json({ error: "Erro ao buscar usuário", details: error.message }, 500);
  }
});

// USUÁRIOS - Atualizar
app.put("/users/:id", async (c) => {
  try {
    const { authorized } = await verifyAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const id = c.req.param("id");
    const body = await c.req.json();

    const { data, error } = await supabase
      .from("usuarios")
      .update({
        ...body,
        atualizado_em: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    const { senha, ...userWithoutPassword } = data;
    return c.json(userWithoutPassword);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return c.json({ error: "Erro ao atualizar usuário", details: error.message }, 500);
  }
});

// LUGARES - Listar todos
app.get("/places", async (c) => {
  try {
    const { authorized } = await verifyAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const categoria = c.req.query("categoria");
    const busca = c.req.query("busca");

    let query = supabase.from("lugares").select("*");

    if (categoria) {
      query = query.eq("categoria", categoria);
    }

    if (busca) {
      query = query.ilike("nome", `%${busca}%`);
    }

    const { data, error } = await query.order("criado_em", { ascending: false });

    if (error) throw error;

    // Adicionar contagem de reservas e pedidos para cada lugar
    const placesWithStats = await Promise.all(
      data.map(async (lugar) => {
        const [reservas, pedidos, avaliacoes] = await Promise.all([
          supabase.from("reservas").select("id, preco_total", { count: "exact" }).eq("lugar_id", lugar.id),
          supabase.from("pedidos").select("id, preco_total", { count: "exact" }).eq("lugar_id", lugar.id),
          supabase.from("avaliacoes").select("avaliacao").eq("lugar_id", lugar.id),
        ]);

        const receitaTotal =
          (reservas.data?.reduce((sum, r) => sum + (parseFloat(r.preco_total) || 0), 0) || 0) +
          (pedidos.data?.reduce((sum, p) => sum + (parseFloat(p.preco_total) || 0), 0) || 0);

        return {
          ...lugar,
          totalReservas: reservas.count || 0,
          totalPedidos: pedidos.count || 0,
          totalAvaliacoes: avaliacoes.data?.length || 0,
          receitaTotal: receitaTotal.toFixed(2)
        };
      })
    );

    return c.json(placesWithStats);
  } catch (error) {
    console.error("Erro ao listar lugares:", error);
    return c.json({ error: "Erro ao listar lugares", details: error.message }, 500);
  }
});

// LUGARES - Detalhes
app.get("/places/:id", async (c) => {
  try {
    const { authorized } = await verifyAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const id = c.req.param("id");

    const { data: lugar, error } = await supabase
      .from("lugares")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    const [reservas, pedidos, produtos, avaliacoes] = await Promise.all([
      supabase.from("reservas").select("*").eq("lugar_id", id),
      supabase.from("pedidos").select("*").eq("lugar_id", id),
      supabase.from("produtos").select("*").eq("lugar_id", id),
      supabase.from("avaliacoes").select("*").eq("lugar_id", id),
    ]);

    return c.json({
      ...lugar,
      reservas: reservas.data || [],
      pedidos: pedidos.data || [],
      produtos: produtos.data || [],
      avaliacoes: avaliacoes.data || []
    });
  } catch (error) {
    console.error("Erro ao buscar detalhes do lugar:", error);
    return c.json({ error: "Erro ao buscar lugar", details: error.message }, 500);
  }
});

// LUGARES - Atualizar
app.put("/places/:id", async (c) => {
  try {
    const { authorized } = await verifyAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const id = c.req.param("id");
    const body = await c.req.json();

    const { data, error } = await supabase
      .from("lugares")
      .update({
        ...body,
        atualizado_em: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error("Erro ao atualizar lugar:", error);
    return c.json({ error: "Erro ao atualizar lugar", details: error.message }, 500);
  }
});

// RESERVAS - Listar todas
app.get("/reservations", async (c) => {
  try {
    const { authorized } = await verifyAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const status = c.req.query("status");

    let query = supabase
      .from("reservas")
      .select(`
        *,
        usuario:usuarios(nome, sobrenome, email),
        lugar:lugares(nome, categoria)
      `);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query.order("criado_em", { ascending: false });

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error("Erro ao listar reservas:", error);
    return c.json({ error: "Erro ao listar reservas", details: error.message }, 500);
  }
});

// RESERVAS - Atualizar status
app.put("/reservations/:id", async (c) => {
  try {
    const { authorized } = await verifyAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const id = c.req.param("id");
    const { status } = await c.req.json();

    const { data, error } = await supabase
      .from("reservas")
      .update({
        status,
        atualizado_em: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error("Erro ao atualizar reserva:", error);
    return c.json({ error: "Erro ao atualizar reserva", details: error.message }, 500);
  }
});

// PEDIDOS - Listar todos
app.get("/orders", async (c) => {
  try {
    const { authorized } = await verifyAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const status = c.req.query("status");

    let query = supabase
      .from("pedidos")
      .select(`
        *,
        usuario:usuarios(nome, sobrenome, email),
        lugar:lugares(nome, categoria, url_imagem),
        produto:produtos(nome, preco, url_imagem)
      `);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query.order("criado_em", { ascending: false });

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error("Erro ao listar pedidos:", error);
    return c.json({ error: "Erro ao listar pedidos", details: error.message }, 500);
  }
});

// PEDIDOS - Atualizar status
app.put("/orders/:id", async (c) => {
  try {
    const { authorized } = await verifyAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const id = c.req.param("id");
    const { status } = await c.req.json();

    const { data, error } = await supabase
      .from("pedidos")
      .update({
        status,
        atualizado_em: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error);
    return c.json({ error: "Erro ao atualizar pedido", details: error.message }, 500);
  }
});

// AVALIAÇÕES - Listar todas
app.get("/reviews", async (c) => {
  try {
    const { authorized } = await verifyAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const { data, error } = await supabase
      .from("avaliacoes")
      .select(`
        *,
        usuario:usuarios(nome, sobrenome),
        lugar:lugares(nome)
      `)
      .order("criado_em", { ascending: false });

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error("Erro ao listar avaliações:", error);
    return c.json({ error: "Erro ao listar avaliações", details: error.message }, 500);
  }
});

// FAVORITOS - Lugares mais favoritados
app.get("/favorites", async (c) => {
  try {
    const { authorized } = await verifyAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const { data, error } = await supabase
      .from("favoritos")
      .select("lugar_id");

    if (error) throw error;

    // Contar favoritos por lugar
    const favoriteCounts = data.reduce((acc: any, fav) => {
      acc[fav.lugar_id] = (acc[fav.lugar_id] || 0) + 1;
      return acc;
    }, {});

    // Buscar informações dos lugares
    const lugaresIds = Object.keys(favoriteCounts);
    const { data: lugares } = await supabase
      .from("lugares")
      .select("id, nome, categoria")
      .in("id", lugaresIds);

    const favoritesWithDetails = lugares?.map((lugar) => ({
      ...lugar,
      totalFavoritos: favoriteCounts[lugar.id]
    })).sort((a, b) => b.totalFavoritos - a.totalFavoritos);

    return c.json(favoritesWithDetails || []);
  } catch (error) {
    console.error("Erro ao listar favoritos:", error);
    return c.json({ error: "Erro ao listar favoritos", details: error.message }, 500);
  }
});

// USUÁRIOS - Criar novo usuário
app.post("/users", async (c) => {
  try {
    const { authorized } = await verifyAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const body = await c.req.json();
    const nome = body.nome?.trim();
    const sobrenome = body.sobrenome?.trim() || "";
    const email = body.email?.trim().toLowerCase();
    const senha = body.senha;
    const telefone = body.telefone?.trim() || null;
    const papel = body.papel;

    if (!nome || !email || !senha || !papel) {
      return c.json({ error: "Nome, email, senha e papel são obrigatórios" }, 400);
    }

    if (!["USUARIO", "AGENTE", "ADMIN"].includes(papel)) {
      return c.json({ error: "Papel inválido. Deve ser USUARIO, AGENTE ou ADMIN" }, 400);
    }

    const { data: existingUser } = await supabase
      .from("usuarios")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    if (existingUser) {
      return c.json({ error: "Já existe um usuário com este email" }, 409);
    }

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: {
        nome,
        sobrenome,
        papel
      }
    });

    if (authError || !authUser.user) {
      return c.json({ error: "Erro ao criar usuário", details: authError?.message || "Usuário Auth não criado" }, 500);
    }

    const { data: userData, error: dbError } = await supabase
      .from("usuarios")
      .insert({
        id: authUser.user.id,
        nome,
        sobrenome,
        email,
        senha,
        telefone,
        papel,
        ativo: true
      })
      .select()
      .single();

    if (dbError) {
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return c.json({ error: "Erro ao salvar usuário", details: dbError.message }, 500);
    }

    const { senha: _, ...userWithoutPassword } = userData;
    return c.json(userWithoutPassword, 201);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return c.json({ error: "Erro ao criar usuário", details: error.message }, 500);
  }
});

// AUTH - Login (para admins)
app.post("/auth/login", async (c) => {
  try {
    const body = await c.req.json();
    const email = body.email?.trim().toLowerCase();
    const senha = body.senha;

    if (!email || !senha) {
      return c.json({ error: "Email e senha são obrigatórios" }, 400);
    }

    // Buscar usuário por email para validar permissões no painel admin
    const { data: user, error } = await supabase
      .from("usuarios")
      .select("*")
      .ilike("email", email)
      .single();

    if (error || !user) {
      return c.json({ error: "Email ou senha inválidos" }, 401);
    }

    if (user.papel !== "ADMIN") {
      return c.json({ error: "Acesso negado. Apenas admins podem acessar." }, 403);
    }

    if (!user.ativo) {
      return c.json({ error: "Usuário inativo" }, 403);
    }

    // Criar sessão com Supabase Auth
    const { data: sessionData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    });

    if (authError || !sessionData?.session) {
      // Migração segura: só cria no Auth se a credencial antiga da tabela ainda coincidir.
      if (user.senha !== senha) {
        return c.json({ error: "Email ou senha inválidos" }, 401);
      }

      // Se o usuário não existe no Auth, criar e fazer login em seguida
      const { error: signUpError } = await supabase.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
        user_metadata: {
          nome: user.nome,
          papel: user.papel
        }
      });

      if (signUpError) {
        console.error("Erro ao criar usuário no Auth:", signUpError);
        if (signUpError.message.toLowerCase().includes("already")) {
          return c.json({ error: "Email ou senha inválidos" }, 401);
        }

        return c.json({ error: "Erro ao autenticar", details: signUpError.message }, 500);
      }

      const { data: secondSessionData, error: secondAuthError } = await supabase.auth.signInWithPassword({
        email,
        password: senha
      });

      if (secondAuthError || !secondSessionData?.session?.access_token) {
        console.error("Erro ao autenticar após criar usuário no Auth:", secondAuthError);
        return c.json({ error: "Erro ao autenticar", details: secondAuthError?.message || "Não foi possível criar sessão" }, 500);
      }

      return c.json({
        user: {
          id: user.id,
          nome: user.nome,
          sobrenome: user.sobrenome,
          email: user.email,
          papel: user.papel
        },
        accessToken: secondSessionData.session.access_token
      });
    }

    if (!sessionData.session.access_token) {
      return c.json({ error: "Erro ao gerar token de acesso" }, 500);
    }

    const { senha: _, ...userWithoutPassword } = user;

    return c.json({
      user: userWithoutPassword,
      accessToken: sessionData.session.access_token
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return c.json({ error: "Erro ao fazer login", details: error.message }, 500);
  }
});

// USUÁRIOS - Deletar usuário
app.delete("/users/:id", async (c) => {
  try {
    const { authorized, userId } = await verifyAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const id = c.req.param("id");
    if (userId === id) {
      return c.json({ error: "Não é possível deletar sua própria conta" }, 400);
    }

    const { data: user, error: userError } = await supabase
      .from("usuarios")
      .select("id, email")
      .eq("id", id)
      .single();

    if (userError || !user) {
      return c.json({ error: "Usuário não encontrado" }, 404);
    }

    const { error: dbError } = await supabase
      .from("usuarios")
      .delete()
      .eq("id", id);

    if (dbError) {
      return c.json({ error: "Erro ao deletar usuário", details: dbError.message }, 500);
    }

    try {
      const authUserId = await findAuthUserIdByEmail(user.email);
      if (authUserId) {
        await supabase.auth.admin.deleteUser(authUserId);
      }
    } catch (authError) {
      console.error("Erro ao deletar usuário do Auth:", authError);
    }

    return c.json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return c.json({ error: "Erro ao deletar usuário", details: error.message }, 500);
  }
});

// Health check
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Debug - Verificar usuários admin
app.get("/debug/admin-users", async (c) => {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nome, email, papel, ativo")
      .eq("papel", "ADMIN")
      .eq("ativo", true);

    if (error) throw error;

    return c.json({
      adminUsers: data,
      count: data?.length || 0
    });
  } catch (error) {
    console.error("Erro ao buscar usuários admin:", error);
    return c.json({ error: "Erro ao buscar usuários admin", details: error.message }, 500);
  }
});

// NOTIFICAÇÕES - Listar todas as notificações enviadas pelo admin
app.get("/notifications", async (c) => {
  try {
    const { authorized } = await verifyAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const { data, error } = await supabase
      .from("notificacoes")
      .select("*")
      .order("criado_em", { ascending: false });

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error("Erro ao listar notificações:", error);
    return c.json({ error: "Erro ao listar notificações", details: error.message }, 500);
  }
});

// NOTIFICAÇÕES - Criar e enviar notificação
app.post("/notifications", async (c) => {
  try {
    console.log("Recebida requisição POST /notifications");

    const { authorized, userId } = await verifyAdmin(c.req.raw);
    console.log("Verificação de admin:", { authorized, userId });

    if (!authorized) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const { titulo, mensagem, tipo, pubblico_alvo } = await c.req.json();
    console.log("Dados recebidos:", { titulo, mensagem, tipo, pubblico_alvo });

    if (!titulo || !mensagem) {
      console.log("Erro: Título ou mensagem ausentes");
      return c.json({ error: "Título e mensagem são obrigatórios" }, 400);
    }

    const tiposValidos = ["INFO", "AVISO", "PROMOCAO", "MANUTENCAO"];
    if (!tiposValidos.includes(tipo)) {
      console.log("Erro: Tipo inválido:", tipo);
      return c.json({ error: "Tipo inválido. Deve ser INFO, AVISO, PROMOCAO ou MANUTENCAO" }, 400);
    }

    const publicosValidos = ["TODOS", "USUARIOS", "AGENTES", "ADMIN"];
    if (!publicosValidos.includes(pubblico_alvo)) {
      console.log("Erro: Público alvo inválido:", pubblico_alvo);
      return c.json({ error: "Público alvo inválido. Deve ser TODOS, USUARIOS, AGENTES ou ADMIN" }, 400);
    }

    console.log("Buscando usuários para público alvo:", pubblico_alvo);
    let query = supabase.from("usuarios").select("id");
    if (pubblico_alvo !== "TODOS") {
      const papelMap = {
        USUARIOS: "USUARIO",
        AGENTES: "AGENTE",
        ADMIN: "ADMIN"
      };
      query = query.eq("papel", papelMap[pubblico_alvo as keyof typeof papelMap]);
    }

    const { data: usuarios, error: usuariosError } = await query.eq("ativo", true);
    console.log("Resultado da busca de usuários:", { count: usuarios?.length, error: usuariosError });

    if (usuariosError) throw usuariosError;

    if (!usuarios || usuarios.length === 0) {
      console.log("Erro: Nenhum usuário encontrado");
      return c.json({ error: "Nenhum usuário encontrado para o público alvo especificado" }, 400);
    }

    const notificacoes = usuarios.map((usuario: any) => ({
      usuario_id: usuario.id,
      titulo,
      mensagem,
      tipo,
      dados: { pubblico_alvo, enviado_por_admin: true },
      lida: false
    }));

    const { data: notificacoesCriadas, error: notificacoesError } = await supabase
      .from("notificacoes")
      .insert(notificacoes)
      .select("*");

    if (notificacoesError) {
      console.error("Erro ao inserir notificações:", notificacoesError);
      if (isMissingTableError(notificacoesError)) {
        return c.json({ error: "Tabela de notificações não existe. Por favor, crie a tabela no Supabase." }, 500);
      }
      throw notificacoesError;
    }

// Buscar push tokens dos usuários para enviar notificações push
    const userIds = usuarios.map((u: any) => u.id);
    let pushTokensFound = 0;

    try {
      const { data: configuracoes, error: configError } = await supabase
        .from("configuracoes")
        .select("usuario_id, push_token")
        .in("usuario_id", userIds)
        .not("push_token", "is", null);

      // Enviar notificações push se houver tokens e não houver erro na tabela
      if (configuracoes && configuracoes.length > 0 && !configError) {
        pushTokensFound = configuracoes.length;
        
        const pushPromises = configuracoes.map(async (config: any) => {
          if (config.push_token) {
            await fetch("https://exp.host/--/api/v2/push/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to: config.push_token,
                title: titulo,
                body: mensagem,
                data: { type: "admin_notification", notification_type: tipo },
                sound: "default"
              })
            });
          }
        });

        Promise.all(pushPromises).catch(console.error);
      }
    } catch (configError) {
      // Silencioso se a tabela não existir
    }

    return c.json({
      message: `Notificação enviada com sucesso para ${usuarios.length} usuário(s)`,
      totalEnviadas: usuarios.length,
      pushTokensFound
    });
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
    return c.json({ error: "Erro ao enviar notificação", details: error.message }, 500);
  }
});

// DOCUMENTOS LEGAIS - Listar todos
app.get("/legal", async (c) => {
  try {
    const { authorized } = await verifyAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const { data, error } = await supabase
      .from("documentos_legais")
      .select("*")
      .order("tipo", { ascending: true })
      .order("versao", { ascending: false });

    if (error) {
      if (isMissingTableError(error)) {
        return c.json(DEFAULT_LEGAL_DOCUMENTS);
      }
      throw error;
    }

    return c.json(data);
  } catch (error) {
    console.error("Erro ao listar documentos legais:", error);
    return c.json({ error: "Erro ao listar documentos", details: error.message }, 500);
  }
});

// DOCUMENTOS LEGAIS - Buscar por tipo
app.get("/legal/:tipo", async (c) => {
  try {
    const tipo = c.req.param("tipo");

    const { data, error } = await supabase
      .from("documentos_legais")
      .select("*")
      .eq("tipo", tipo)
      .eq("ativo", true)
      .order("versao", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (isMissingTableError(error)) {
        const document = DEFAULT_LEGAL_DOCUMENTS.find((item) => item.tipo === tipo);
        if (!document) {
          return c.json({ error: "Documento não encontrado" }, 404);
        }
        return c.json(document);
      }
      throw error;
    }

    return c.json(data);
  } catch (error) {
    console.error("Erro ao buscar documento legal:", error);
    return c.json({ error: "Erro ao buscar documento", details: error.message }, 500);
  }
});

// DOCUMENTOS LEGAIS - Atualizar documento
app.put("/legal/:id", async (c) => {
  try {
    const { authorized } = await verifyAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const id = c.req.param("id");
    const { titulo, conteudo, versao, ativo } = await c.req.json();

    const { data, error } = await supabase
      .from("documentos_legais")
      .update({
        titulo,
        conteudo,
        versao,
        ativo,
        atualizado_em: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (isMissingTableError(error)) {
        return c.json({ error: "Os documentos legais estão em modo somente leitura até a tabela documentos_legais ser criada." }, 501);
      }
      throw error;
    }

    return c.json(data);
  } catch (error) {
    console.error("Erro ao atualizar documento legal:", error);
    return c.json({ error: "Erro ao atualizar documento", details: error.message }, 500);
  }
});

Deno.serve(app.fetch);
