'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/** * ==========================================
 * 1. AUTENTICAÇÃO E USUÁRIOS
 * ========================================== */

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const senha = formData.get('senha') as string
  const usuario = await prisma.usuario.findUnique({ where: { email } })

  if (!usuario || usuario.senha !== senha) return { error: "Credenciais inválidas" }

  const cookieStore = await cookies()
  cookieStore.set('session_user_id', usuario.id, { 
    maxAge: 60 * 60 * 24, path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production'
  })
  redirect('/')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('session_user_id')
  redirect('/login')
}

export async function createUsuario(formData: FormData) {
  const nome = formData.get('nome') as string
  const email = formData.get('email') as string
  const senha = formData.get('senha') as string
  const cargo = formData.get('cargo') as string

  await prisma.usuario.create({
    data: { 
      nome, email, senha, cargo,
      podeVerLeads: true, podeVerCalendario: true, podeVerFestas: true, 
      podeVerTarefas: true, podeVerEstoque: true,
      podeVerFinanceiro: cargo === "DONO",
      podeVerRelatorios: cargo === "DONO",
    }
  })
  revalidatePath('/configuracoes')
}

export async function updatePermissoes(formData: FormData) {
  const id = formData.get('id') as string
  await prisma.usuario.update({
    where: { id },
    data: {
      podeVerLeads: formData.get('leads') === 'on',
      podeVerCalendario: formData.get('calendario') === 'on',
      podeVerFestas: formData.get('festas') === 'on',
      podeVerTarefas: formData.get('tarefas') === 'on',
      podeVerEstoque: formData.get('estoque') === 'on',
      podeVerFinanceiro: formData.get('financeiro') === 'on',
      podeVerRelatorios: formData.get('relatorios') === 'on',
    }
  })
  revalidatePath('/configuracoes')
}

/** * ==========================================
 * 2. COMERCIAL (LEADS & CLIENTES)
 * ========================================== */

export async function createLead(formData: FormData) {
  await prisma.lead.create({
    data: { 
      nome: formData.get('nome') as string, 
      telefone: formData.get('telefone') as string,
      origem: formData.get('origem') as string || "Direto",
      status: 'NOVO' 
    }
  })
  revalidatePath('/leads'); revalidatePath('/')
}

export async function updateLeadStatus(formData: FormData) {
  const id = formData.get('id') as string
  const dataVisitaRaw = formData.get('dataVisita') as string
  await prisma.lead.update({
    where: { id },
    data: { status: formData.get('status') as string, dataVisita: dataVisitaRaw ? new Date(dataVisitaRaw) : null }
  })
  revalidatePath('/leads')
}

export async function deleteLead(formData: FormData) {
  await prisma.lead.delete({ where: { id: formData.get('id') as string } })
  revalidatePath('/leads'); revalidatePath('/')
}

export async function createCliente(formData: FormData) {
  await prisma.cliente.create({ data: { nome: formData.get('nome') as string, telefone: formData.get('telefone') as string, email: formData.get('email') as string || "" } })
  revalidatePath('/festas/nova')
}

/** * ==========================================
 * 3. OPERACIONAL (FESTAS & PACOTES)
 * ========================================== */

export async function createFesta(formData: FormData) {
  await prisma.festa.create({
    data: {
      nomeAniversariante: formData.get('nomeAniversariante') as string,
      dataFesta: new Date(formData.get('dataFesta') as string),
      valorTotal: parseFloat(formData.get('valorTotal') as string) || 0,
      qtdPessoas: parseInt(formData.get('qtdPessoas') as string) || 0,
      status: 'AGENDADO',
      cliente: { connect: { id: formData.get('clienteId') as string } },
      pacote: { connect: { id: formData.get('pacoteId') as string } }
    }
  })
  revalidatePath('/festas'); revalidatePath('/calendario'); revalidatePath('/')
}

export async function deleteFesta(formData: FormData) {
  await prisma.festa.delete({ where: { id: formData.get('id') as string } })
  revalidatePath('/festas'); revalidatePath('/calendario')
}

export async function createPacote(formData: FormData) {
  await prisma.pacote.create({ data: { nome: formData.get('nome') as string, precoBase: parseFloat(formData.get('precoBase') as string) || 0, descricao: "" } })
  revalidatePath('/festas')
}

/** * ==========================================
 * 4. TAREFAS
 * ========================================== */

export async function createTarefa(formData: FormData) {
  await prisma.tarefa.create({
    data: { 
      descricao: formData.get('descricao') as string, 
      equipe: formData.get('equipe') as string, 
      dataLimite: new Date(formData.get('dataLimite') as string), 
      status: "PENDENTE" 
    }
  })
  revalidatePath('/tarefas'); revalidatePath('/calendario')
}

export async function deleteTarefa(formData: FormData) {
  await prisma.tarefa.delete({ where: { id: formData.get('id') as string } })
  revalidatePath('/tarefas')
}

export async function toggleTarefaStatus(formData: FormData) {
  const id = formData.get('id') as string
  const tarefa = await prisma.tarefa.findUnique({ where: { id } })
  if (tarefa) {
    await prisma.tarefa.update({ 
      where: { id }, data: { status: tarefa.status === "PENDENTE" ? "CONCLUIDA" : "PENDENTE" } 
    })
  }
  revalidatePath('/tarefas')
}

/** * ==========================================
 * 5. ESTOQUE (ENTRADA, SAÍDA E EXCLUSÃO)
 * ========================================== */

export async function createItemEstoque(formData: FormData) {
  await prisma.itemEstoque.create({
    data: { 
      nome: formData.get('nome') as string, categoria: formData.get('categoria') as string, 
      quantidade: parseInt(formData.get('quantidade') as string) || 0, 
      estoqueMinimo: parseInt(formData.get('estoqueMinimo') as string) || 0, unidade: "UN" 
    }
  })
  revalidatePath('/estoque')
}

export async function deleteItemEstoque(formData: FormData) {
  await prisma.itemEstoque.delete({ where: { id: formData.get('id') as string } })
  revalidatePath('/estoque')
}

// Funções Específicas para os Botões Separados
export async function registrarEntrada(formData: FormData) {
  const id = formData.get('id') as string
  const valorInput = formData.get('valor')
  const valor = valorInput ? parseInt(valorInput as string) : 1
  const item = await prisma.itemEstoque.findUnique({ where: { id } })
  if (item && valor > 0) {
    await prisma.itemEstoque.update({ where: { id }, data: { quantidade: item.quantidade + valor } })
  }
  revalidatePath('/estoque')
}

export async function registrarSaida(formData: FormData) {
  const id = formData.get('id') as string
  const valorInput = formData.get('valor')
  const valor = valorInput ? parseInt(valorInput as string) : 1
  const item = await prisma.itemEstoque.findUnique({ where: { id } })
  if (item && valor > 0) {
    await prisma.itemEstoque.update({ where: { id }, data: { quantidade: Math.max(0, item.quantidade - valor) } })
  }
  revalidatePath('/estoque')
}

// Mantida para compatibilidade (caso algum código antigo chame)
export async function movimentarEstoque(formData: FormData) {
  const id = formData.get('id') as string
  const tipo = formData.get('tipo') as string
  const valor = parseInt(formData.get('valor') as string) || 0
  const item = await prisma.itemEstoque.findUnique({ where: { id } })
  if (item) {
    let novaQtd = item.quantidade
    if (tipo === 'ENTRADA') novaQtd = item.quantidade + valor
    else if (tipo === 'SAIDA') novaQtd = Math.max(0, item.quantidade - valor)
    await prisma.itemEstoque.update({ where: { id }, data: { quantidade: novaQtd } })
  }
  revalidatePath('/estoque')
}

// Mantida para compatibilidade
export async function ajustarQuantidade(formData: FormData) {
  const id = formData.get('id') as string
  const operacao = formData.get('operacao') as string
  const item = await prisma.itemEstoque.findUnique({ where: { id } })
  if (item) {
    const novaQtd = operacao === "SOMA" ? item.quantidade + 1 : Math.max(0, item.quantidade - 1)
    await prisma.itemEstoque.update({ where: { id }, data: { quantidade: novaQtd } })
  }
  revalidatePath('/estoque')
}

/** * ==========================================
 * 6. FINANCEIRO (RECEITAS & DESPESAS)
 * ========================================== */

export async function confirmarPagamento(formData: FormData) {
  await prisma.pagamento.update({ where: { id: formData.get('id') as string }, data: { status: "PAGO" } })
  revalidatePath('/festas'); revalidatePath('/financeiro'); revalidatePath('/')
}

export async function updatePagamento(formData: FormData) {
  await prisma.pagamento.update({ 
    where: { id: formData.get('id') as string }, 
    data: { valor: parseFloat(formData.get('valor') as string), dataVencimento: new Date(formData.get('dataVencimento') as string) } 
  })
  revalidatePath('/festas')
}

export async function gerarFinanceiroHibrido(formData: FormData) {
  const festaId = formData.get('festaId') as string
  const valorTotal = parseFloat(formData.get('valorTotal') as string) || 0
  const valorEntrada = parseFloat(formData.get('valorEntrada') as string) || 0
  await prisma.pagamento.deleteMany({ where: { festaId } })
  await prisma.pagamento.create({ data: { festaId, valor: valorEntrada, status: "PAGO", parcela: 0, dataVencimento: new Date(), metodo: "PIX" } })
  if (valorTotal > valorEntrada) {
      await prisma.pagamento.create({
          data: { festaId, valor: valorTotal - valorEntrada, status: "PENDENTE", parcela: 1, dataVencimento: new Date(formData.get('dataInicio') as string || new Date()), metodo: "PIX" }
      })
  }
  revalidatePath('/festas')
}

export async function createDespesa(formData: FormData) {
  await prisma.despesa.create({
    data: {
      descricao: formData.get('descricao') as string,
      valor: parseFloat(formData.get('valor') as string) || 0,
      categoria: formData.get('categoria') as string,
      dataVencimento: new Date(formData.get('dataVencimento') as string),
      status: 'PENDENTE'
    }
  })
  revalidatePath('/financeiro'); revalidatePath('/')
}

export async function pagarDespesa(formData: FormData) {
  await prisma.despesa.update({ where: { id: formData.get('id') as string }, data: { status: 'PAGO' } })
  revalidatePath('/financeiro'); revalidatePath('/')
}

export async function deleteDespesa(formData: FormData) {
  await prisma.despesa.delete({ where: { id: formData.get('id') as string } })
  revalidatePath('/financeiro'); revalidatePath('/')
}

/** * ==========================================
 * 7. SIMULADOR & CONVITES
 * ========================================== */

export async function salvarSimulacao(festaId: string, dados: any) {
  await prisma.simulacao.create({
    data: {
      festaId, receitaPrevista: dados.receita, custoTotal: dados.custos, lucroEstimado: dados.lucro, margem: dados.margem, detalhes: JSON.stringify(dados.detalhes)
    }
  })
  revalidatePath('/relatorios')
}

export async function getFestaParaConvite(id: string) {
  return await prisma.festa.findUnique({ where: { id }, include: { cliente: true } })
}

export async function enviarConviteWpp(festaId: string, base64: string) {
  const festa = await prisma.festa.findUnique({ where: { id: festaId }, include: { cliente: true } })
  if (!festa?.cliente.telefone) return { error: "Telefone ausente" }
  try {
    const res = await fetch(`${process.env.EVOLUTION_API_URL}/message/sendMedia/BuffetPro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': process.env.EVOLUTION_API_KEY! },
      body: JSON.stringify({ number: `55${festa.cliente.telefone.replace(/\D/g, '')}`, mediaMessage: { mediatype: "image", caption: `Convite de ${festa.nomeAniversariante}`, media: base64.split(',')[1] } })
    })
    return await res.json()
  } catch { return { error: "Erro na API" } }
}