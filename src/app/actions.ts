// src/app/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Helpers
 */
function safeDateRequired(dateStr: any): Date {
  const d = new Date(String(dateStr ?? ""));
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function safeDateOptional(dateStr: any): Date | null {
  if (!dateStr) return null;
  const d = new Date(String(dateStr));
  return Number.isNaN(d.getTime()) ? null : d;
}

function toNumber(v: any, fallback = 0) {
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function toInt(v: any, fallback = 0) {
  const n = typeof v === "string" ? parseInt(v, 10) : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);

  // Ajuste simples para meses com menos dias (ex.: 31 -> 30/28)
  if (d.getDate() < day) d.setDate(0);
  return d;
}

/** ==========================================
 * 1) AUTENTICAÇÃO
 * ========================================== */

export async function login(prevState: any, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const senha = String(formData.get("senha") ?? "");

  if (!email || !senha) return { error: "Informe email e senha" };

  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario || usuario.senha !== senha) return { error: "Credenciais inválidas" };

    const cookieStore = cookies();
    cookieStore.set("session_user_id", usuario.id, {
      maxAge: 60 * 60 * 24,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  } catch (e) {
    console.error(e);
    return { error: "Erro de conexão com o banco" };
  }

  const next = String(formData.get("next") ?? "");
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    redirect(next);
  }
  redirect("/");
}

export async function logout() {
  const cookieStore = cookies();
  cookieStore.delete("session_user_id");
  redirect("/login");
}

/** ==========================================
 * 1.1) USUÁRIOS / PERMISSÕES
 * ========================================== */

export async function createUsuario(formData: FormData) {
  try {
    const cargo = String(formData.get("cargo") ?? "VENDEDOR");

    await prisma.usuario.create({
      data: {
        nome: String(formData.get("nome") ?? ""),
        email: String(formData.get("email") ?? "").trim().toLowerCase(),
        senha: String(formData.get("senha") ?? ""),
        cargo: cargo as any,

        // Base: todos podem ver o básico
        podeVerLeads: true,
        podeVerCalendario: true,
        podeVerFestas: true,
        podeVerTarefas: true,
        podeVerEstoque: true,

        // Dono vê tudo
        podeVerFinanceiro: cargo === "DONO",
        podeVerRelatorios: cargo === "DONO",
      },
    });

    revalidatePath("/configuracoes");
  } catch (e) {
    console.error(e);
  }
}

export async function updatePermissoes(formData: FormData) {
  try {
    const id = String(formData.get("id") ?? "");
    if (!id) return;

    await prisma.usuario.update({
      where: { id },
      data: {
        podeVerLeads: formData.get("leads") === "on",
        podeVerCalendario: formData.get("calendario") === "on",
        podeVerFestas: formData.get("festas") === "on",
        podeVerTarefas: formData.get("tarefas") === "on",
        podeVerEstoque: formData.get("estoque") === "on",
        podeVerFinanceiro: formData.get("financeiro") === "on",
        podeVerRelatorios: formData.get("relatorios") === "on",
      },
    });

    revalidatePath("/configuracoes");
  } catch (e) {
    console.error(e);
  }
}

/** ==========================================
 * 2) CRM / LEADS / CLIENTES
 * ========================================== */

export async function createLead(formData: FormData) {
  try {
    await prisma.lead.create({
      data: {
        nome: String(formData.get("nome") ?? ""),
        telefone: String(formData.get("telefone") ?? ""),
        origem: String(formData.get("origem") ?? "Direto"),
        status: "NOVO",
      },
    });

    revalidatePath("/leads");
    revalidatePath("/");
  } catch (e) {
    console.error(e);
  }
}

export async function updateLeadStatus(formData: FormData) {
  try {
    const id = String(formData.get("id") ?? "");
    const status = String(formData.get("status") ?? "");
    if (!id || !status) return;

    const dataVisita = safeDateOptional(formData.get("dataVisita"));

    await prisma.lead.update({
      where: { id },
      data: { status: status as any, dataVisita },
    });

    revalidatePath("/leads");
  } catch (e) {
    console.error(e);
  }
}

export async function deleteLead(formData: FormData) {
  try {
    const id = String(formData.get("id") ?? "");
    if (!id) return;

    await prisma.lead.delete({ where: { id } });

    revalidatePath("/leads");
    revalidatePath("/");
  } catch (e) {
    console.error(e);
  }
}

export async function createCliente(formData: FormData) {
  try {
    await prisma.cliente.create({
      data: {
        nome: String(formData.get("nome") ?? ""),
        telefone: String(formData.get("telefone") ?? ""),
        email: String(formData.get("email") ?? ""),
      },
    });

    revalidatePath("/clientes");
    revalidatePath("/festas/nova");
    revalidatePath("/festas");
  } catch (e) {
    console.error(e);
  }
}

/** ==========================================
 * 3) FESTAS / PACOTES
 * ========================================== */

export async function createFesta(formData: FormData) {
  const clienteId = String(formData.get("clienteId") ?? "");
  const pacoteId = String(formData.get("pacoteId") ?? "");
  const valorTotal = toNumber(formData.get("valorTotal"), 0);
  const dataFesta = safeDateRequired(formData.get("dataFesta"));

  if (!clienteId || !pacoteId || valorTotal <= 0) return;

  try {
    const festa = await prisma.festa.create({
      data: {
        nomeAniversariante: String(formData.get("nomeAniversariante") ?? ""),
        dataFesta,
        horaInicio: String(formData.get("horaInicio") ?? "19:00"),
        horaFim: String(formData.get("horaFim") ?? "23:00"),
        valorTotal,
        qtdPessoas: toInt(formData.get("qtdPessoas"), 0),
        status: "AGENDADO",
        cliente: { connect: { id: clienteId } },
        pacote: { connect: { id: pacoteId } },
      },
    });

    // Pagamento base (pendente) para o Dashboard/Financeiro
    await prisma.pagamento.create({
      data: {
        festaId: festa.id,
        valor: valorTotal,
        status: "PENDENTE",
        dataVencimento: dataFesta,
        parcela: 1,
        metodo: "A_DEFINIR",
      },
    });

    revalidatePath("/festas");
    revalidatePath("/calendario");
    revalidatePath("/financeiro");
    revalidatePath("/");
  } catch (e) {
    console.error(e);
  }
}

export async function deleteFesta(formData: FormData) {
  try {
    const id = String(formData.get("id") ?? "");
    if (!id) return;

    await prisma.pagamento.deleteMany({ where: { festaId: id } });
    await prisma.festa.delete({ where: { id } });

    revalidatePath("/festas");
    revalidatePath("/calendario");
    revalidatePath("/financeiro");
    revalidatePath("/");
  } catch (e) {
    console.error(e);
  }
}

export async function createPacote(formData: FormData) {
  try {
    await prisma.pacote.create({
      data: {
        nome: String(formData.get("nome") ?? ""),
        precoBase: toNumber(formData.get("precoBase"), 0),
        descricao: String(formData.get("descricao") ?? ""),
      },
    });

    revalidatePath("/festas");
  } catch (e) {
    console.error(e);
  }
}

/** ==========================================
 * 4) TAREFAS
 * ========================================== */

export async function createTarefa(formData: FormData) {
  try {
    await prisma.tarefa.create({
      data: {
        descricao: String(formData.get("descricao") ?? ""),
        equipe: String(formData.get("equipe") ?? "Geral"),
        dataLimite: safeDateRequired(formData.get("dataLimite")),
        status: "PENDENTE",
      },
    });

    revalidatePath("/tarefas");
    revalidatePath("/calendario");
  } catch (e) {
    console.error(e);
  }
}

export async function deleteTarefa(formData: FormData) {
  try {
    const id = String(formData.get("id") ?? "");
    if (!id) return;

    await prisma.tarefa.delete({ where: { id } });
    revalidatePath("/tarefas");
    revalidatePath("/calendario");
  } catch (e) {
    console.error(e);
  }
}

export async function toggleTarefaStatus(formData: FormData) {
  try {
    const id = String(formData.get("id") ?? "");
    if (!id) return;

    const tarefa = await prisma.tarefa.findUnique({ where: { id } });
    if (!tarefa) return;

    await prisma.tarefa.update({
      where: { id },
      data: { status: tarefa.status === "PENDENTE" ? "CONCLUIDA" : "PENDENTE" },
    });

    revalidatePath("/tarefas");
    revalidatePath("/calendario");
  } catch (e) {
    console.error(e);
  }
}

/** ==========================================
 * 5) ESTOQUE
 * ========================================== */

export async function createItemEstoque(formData: FormData) {
  try {
    await prisma.itemEstoque.create({
      data: {
        nome: String(formData.get("nome") ?? ""),
        categoria: String(formData.get("categoria") ?? "Geral"),
        quantidade: toInt(formData.get("quantidade"), 0),
        estoqueMinimo: toInt(formData.get("estoqueMinimo"), 5),
        unidade: String(formData.get("unidade") ?? "UN"),
      },
    });

    revalidatePath("/estoque");
  } catch (e) {
    console.error(e);
  }
}

export async function deleteItemEstoque(formData: FormData) {
  try {
    const id = String(formData.get("id") ?? "");
    if (!id) return;

    await prisma.itemEstoque.delete({ where: { id } });
    revalidatePath("/estoque");
  } catch (e) {
    console.error(e);
  }
}

export async function movimentarEstoque(formData: FormData) {
  try {
    const id = String(formData.get("id") ?? "");
    const tipo = String(formData.get("tipo") ?? "ENTRADA");
    const valor = Math.max(1, toInt(formData.get("valor"), 1));
    if (!id) return;

    const item = await prisma.itemEstoque.findUnique({ where: { id } });
    if (!item) return;

    const novaQtd = tipo === "ENTRADA" ? item.quantidade + valor : Math.max(0, item.quantidade - valor);

    await prisma.itemEstoque.update({
      where: { id },
      data: { quantidade: novaQtd },
    });

    revalidatePath("/estoque");
  } catch (e) {
    console.error(e);
  }
}

/** ==========================================
 * 6) FINANCEIRO
 * - Gera "Entrada PAGA" + Parcelas PENDENTES
 * ========================================== */

export async function gerarFinanceiroHibrido(formData: FormData) {
  try {
    const festaId = String(formData.get("festaId") ?? "");
    if (!festaId) return;

    const valorTotal = toNumber(formData.get("valorTotal"), 0);
    const valorEntrada = toNumber(formData.get("valorEntrada"), 0);
    const qtdParcelas = Math.max(0, toInt(formData.get("qtdParcelas"), 1));
    const dataInicio = safeDateRequired(formData.get("dataInicio"));

    // Segurança
    const total = Math.max(0, valorTotal);
    const entrada = Math.max(0, Math.min(valorEntrada, total));
    const restante = Math.max(0, total - entrada);

    await prisma.$transaction(async (tx) => {
      await tx.pagamento.deleteMany({ where: { festaId } });

      // Entrada (se > 0) como paga
      if (entrada > 0) {
        await tx.pagamento.create({
          data: {
            festaId,
            valor: entrada,
            status: "PAGO",
            parcela: 0,
            dataVencimento: new Date(),
            metodo: "PIX",
          },
        });
      }

      if (restante <= 0) return;

      // Parcelas
      const parcelas = qtdParcelas <= 1 ? 1 : qtdParcelas;
      const valorParcelaBase = Math.floor((restante / parcelas) * 100) / 100; // 2 casas
      let acumulado = 0;

      for (let i = 1; i <= parcelas; i++) {
        const isLast = i === parcelas;
        const valor = isLast ? Math.round((restante - acumulado) * 100) / 100 : valorParcelaBase;

        await tx.pagamento.create({
          data: {
            festaId,
            valor,
            status: "PENDENTE",
            parcela: i,
            dataVencimento: addMonths(dataInicio, i - 1),
            metodo: "A_RECEBER",
          },
        });

        acumulado += valor;
      }
    });

    revalidatePath("/");
    revalidatePath("/financeiro");
    revalidatePath("/festas");
  } catch (e) {
    console.error(e);
  }
}

export async function updatePagamento(formData: FormData) {
  try {
    const id = String(formData.get("id") ?? "");
    if (!id) return;

    await prisma.pagamento.update({
      where: { id },
      data: {
        valor: toNumber(formData.get("valor"), 0),
        dataVencimento: safeDateRequired(formData.get("dataVencimento")),
        metodo: String(formData.get("metodo") ?? "A_DEFINIR") as any,
      },
    });

    revalidatePath("/festas");
    revalidatePath("/financeiro");
  } catch (e) {
    console.error(e);
  }
}

export async function confirmarPagamento(formData: FormData) {
  try {
    const id = String(formData.get("id") ?? "");
    if (!id) return;

    const metodo = String(formData.get("metodo") ?? "PIX");

    await prisma.pagamento.update({
      where: { id },
      data: { status: "PAGO", metodo: metodo as any },
    });

    revalidatePath("/");
    revalidatePath("/financeiro");
    revalidatePath("/festas");
  } catch (e) {
    console.error(e);
  }
}

export async function createDespesa(formData: FormData) {
  try {
    await prisma.despesa.create({
      data: {
        descricao: String(formData.get("descricao") ?? ""),
        valor: toNumber(formData.get("valor"), 0),
        categoria: String(formData.get("categoria") ?? "Geral"),
        dataVencimento: safeDateRequired(formData.get("dataVencimento")),
        status: "PENDENTE",
      },
    });

    revalidatePath("/financeiro");
    revalidatePath("/");
  } catch (e) {
    console.error(e);
  }
}

export async function pagarDespesa(formData: FormData) {
  try {
    const id = String(formData.get("id") ?? "");
    if (!id) return;

    await prisma.despesa.update({ where: { id }, data: { status: "PAGO" } });

    revalidatePath("/financeiro");
    revalidatePath("/");
  } catch (e) {
    console.error(e);
  }
}

export async function deleteDespesa(formData: FormData) {
  try {
    const id = String(formData.get("id") ?? "");
    if (!id) return;

    await prisma.despesa.delete({ where: { id } });

    revalidatePath("/financeiro");
    revalidatePath("/");
  } catch (e) {
    console.error(e);
  }
}

/** ==========================================
 * 7) SIMULADOR / CONVITES
 * ========================================== */

export async function salvarSimulacao(formData: FormData) {
  try {
    const receita = toNumber(formData.get("receita"), 0);
    const custo = toNumber(formData.get("custo"), 0);
    const detalhes = String(formData.get("detalhes") ?? "{}");
    const festaId = String(formData.get("festaId") ?? "") || null;

    await prisma.simulacao.create({
      data: {
        festaId,
        receitaPrevista: receita,
        custoTotal: custo,
        lucroEstimado: receita - custo,
        margem: receita > 0 ? ((receita - custo) / receita) * 100 : 0,
        detalhes,
      },
    });

    revalidatePath("/relatorios");
    revalidatePath("/simulador");
  } catch (e) {
    console.error(e);
  }
}

export async function getFestaParaConvite(id: string) {
  try {
    return await prisma.festa.findUnique({ where: { id }, include: { cliente: true } });
  } catch {
    return null;
  }
}

export async function enviarConviteWpp(festaId: string, base64: string) {
  try {
    const festa = await prisma.festa.findUnique({
      where: { id: festaId },
      include: { cliente: true },
    });

    if (!festa?.cliente?.telefone) return { error: "Sem telefone do cliente" };

    const apiUrl = process.env.EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;
    if (!apiUrl || !apiKey) return { error: "API WhatsApp não configurada" };

    const number = `55${festa.cliente.telefone.replace(/\D/g, "")}`;
    const media = base64.includes(",") ? base64.split(",")[1] : base64;

    const resp = await fetch(`${apiUrl}/message/sendMedia/BuffetPro`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: apiKey },
      body: JSON.stringify({
        number,
        mediaMessage: {
          mediatype: "image",
          caption: `Convite GM: ${festa.nomeAniversariante}`,
          media,
        },
      }),
    });

    if (!resp.ok) return { error: "Falha ao enviar WhatsApp" };
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Erro ao enviar WhatsApp" };
  }
}
