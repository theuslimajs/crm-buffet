'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Helper de Data
function safeDate(dateStr: any): Date {
  if (!dateStr) return new Date()
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? new Date() : d
}

/** 1. AUTENTICAÇÃO E USUÁRIOS */
export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const senha = formData.get('senha') as string
  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } })
    if (!usuario || usuario.senha !== senha) return { error: "Credenciais inválidas" }
    const cookieStore = await cookies()
    cookieStore.set('session_user_id', usuario.id, { maxAge: 86400, path: '/', httpOnly: true })
  } catch (e) { return { error: "Erro de conexão" } }
  redirect('/')
}

export async function logout() {
  (await cookies()).delete('session_user_id')
  redirect('/login')
}

export async function createUsuario(formData: FormData) {
  await prisma.usuario.create({
    data: { 
      nome: formData.get('nome') as string, email: formData.get('email') as string, 
      senha: formData.get('senha') as string, cargo: formData.get('cargo') as string,
      podeVerLeads: true, podeVerCalendario: true, podeVerFestas: true, 
      podeVerTarefas: true, podeVerEstoque: true,
      podeVerFinanceiro: formData.get('cargo') === "DONO",
      podeVerRelatorios: formData.get('cargo') === "DONO",
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

/** 2. ESTOQUE (CORRIGIDO: LÊ QUANTIDADE DO INPUT) */
export async function createItemEstoque(formData: FormData) {
  await prisma.itemEstoque.create({
    data: { 
      nome: formData.get('nome') as string, 
      categoria: formData.get('categoria') as string, 
      quantidade: parseInt(formData.get('quantidade') as string) || 0, 
      estoqueMinimo: parseInt(formData.get('estoqueMinimo') as string) || 5,
      unidade: "UN" 
    }
  })
  revalidatePath('/estoque')
}

export async function movimentarEstoque(formData: FormData) {
  const id = formData.get('id') as string
  const tipo = formData.get('tipo') as string 
  // Lê o valor digitado. Se vazio, assume 1.
  const valor = parseInt(formData.get('valor') as string) || 1

  const item = await prisma.itemEstoque.findUnique({ where: { id } })
  
  if (item) {
    let novaQtd = item.quantidade
    if (tipo === 'ENTRADA') {
        novaQtd = item.quantidade + valor
    } else {
        novaQtd = Math.max(0, item.quantidade - valor)
    }
    await prisma.itemEstoque.update({ where: { id }, data: { quantidade: novaQtd } })
  }
  revalidatePath('/estoque')
}

export async function deleteItemEstoque(formData: FormData) {
  await prisma.itemEstoque.delete({ where: { id: formData.get('id') as string } })
  revalidatePath('/estoque')
}

// Funções para manter compatibilidade com botões antigos se houver
export async function registrarEntrada(formData: FormData) { return movimentarEstoque(formData) }
export async function registrarSaida(formData: FormData) { return movimentarEstoque(formData) }

/** 3. FINANCEIRO (INTEGRADO TOTAL) */
export async function createDespesa(formData: FormData) {
  await prisma.despesa.create({
    data: {
      descricao: formData.get('descricao') as string,
      valor: parseFloat(formData.get('valor') as string) || 0,
      categoria: formData.get('categoria') as string,
      dataVencimento: safeDate(formData.get('dataVencimento')),
      status: 'PENDENTE'
    }
  })
  revalidatePath('/financeiro'); revalidatePath('/'); revalidatePath('/calendario')
}

export async function pagarDespesa(formData: FormData) {
  await prisma.despesa.update({ where: { id: formData.get('id') as string }, data: { status: 'PAGO' } })
  revalidatePath('/financeiro'); revalidatePath('/'); revalidatePath('/calendario')
}

export async function deleteDespesa(formData: FormData) {
  await prisma.despesa.delete({ where: { id: formData.get('id') as string } })
  revalidatePath('/financeiro'); revalidatePath('/'); revalidatePath('/calendario')
}

export async function gerarFinanceiroHibrido(formData: FormData) {
  const festaId = formData.get('festaId') as string
  const valorTotal = parseFloat(formData.get('valorTotal') as string) || 0
  const valorEntrada = parseFloat(formData.get('valorEntrada') as string) || 0
  
  await prisma.pagamento.deleteMany({ where: { festaId } })
  await prisma.pagamento.create({ data: { festaId, valor: valorEntrada, status: "PAGO", parcela: 0, dataVencimento: new Date(), metodo: "PIX" } })
  
  if (valorTotal > valorEntrada) {
      await prisma.pagamento.create({ data: { festaId, valor: valorTotal - valorEntrada, status: "PENDENTE", parcela: 1, dataVencimento: safeDate(formData.get('dataInicio')), metodo: "A RECEBER" } })
  }
  revalidatePath('/financeiro'); revalidatePath('/'); revalidatePath('/festas')
}

export async function updatePagamento(formData: FormData) {
  await prisma.pagamento.update({
    where: { id: formData.get('id') as string },
    data: { valor: parseFloat(formData.get('valor') as string) || 0, dataVencimento: safeDate(formData.get('dataVencimento')) }
  })
  revalidatePath('/financeiro'); revalidatePath('/festas')
}

export async function confirmarPagamento(formData: FormData) {
  await prisma.pagamento.update({ where: { id: formData.get('id') as string }, data: { status: "PAGO" } })
  revalidatePath('/financeiro'); revalidatePath('/'); revalidatePath('/festas')
}

/** 4. CLIENTES E CRM */
export async function createCliente(formData: FormData) {
  await prisma.cliente.create({ 
    data: { 
      nome: formData.get('nome') as string, 
      telefone: formData.get('telefone') as string, 
      email: formData.get('email') as string || "",
    } 
  })
  revalidatePath('/clientes'); revalidatePath('/festas/nova')
  redirect('/clientes') 
}

export async function createLead(formData: FormData) {
  await prisma.lead.create({ 
    data: { nome: formData.get('nome') as string, telefone: formData.get('telefone') as string, origem: "Direto", status: 'NOVO' } 
  })
  revalidatePath('/leads'); revalidatePath('/')
}

export async function updateLeadStatus(formData: FormData) {
  const id = formData.get('id') as string
  const dataVisitaRaw = formData.get('dataVisita')
  await prisma.lead.update({ 
    where: { id }, 
    data: { status: formData.get('status') as string, dataVisita: dataVisitaRaw ? safeDate(dataVisitaRaw) : null } 
  })
  revalidatePath('/leads')
}

export async function deleteLead(formData: FormData) {
  await prisma.lead.delete({ where: { id: formData.get('id') as string } })
  revalidatePath('/leads')
}

/** 5. FESTAS E PACOTES */
export async function createFesta(formData: FormData) {
  const clienteId = formData.get('clienteId') as string
  const pacoteId = formData.get('pacoteId') as string
  const valorTotal = parseFloat(formData.get('valorTotal') as string) || 0
  const dataFesta = safeDate(formData.get('dataFesta'))

  if (!clienteId || !pacoteId) return

  const festa = await prisma.festa.create({
    data: {
      nomeAniversariante: formData.get('nomeAniversariante') as string,
      dataFesta, valorTotal, qtdPessoas: parseInt(formData.get('qtdPessoas') as string) || 0,
      status: 'AGENDADO', cliente: { connect: { id: clienteId } }, pacote: { connect: { id: pacoteId } }
    }
  })

  // Integração Financeira Automática
  await prisma.pagamento.create({
    data: { festaId: festa.id, valor: valorTotal, status: "PENDENTE", dataVencimento: dataFesta, parcela: 1, metodo: "A DEFINIR" }
  })
  revalidatePath('/festas'); revalidatePath('/calendario'); revalidatePath('/'); revalidatePath('/financeiro')
}

export async function deleteFesta(formData: FormData) {
  const id = formData.get('id') as string
  await prisma.pagamento.deleteMany({ where: { festaId: id } })
  await prisma.festa.delete({ where: { id } })
  revalidatePath('/festas'); revalidatePath('/calendario'); revalidatePath('/'); revalidatePath('/financeiro')
}

export async function createPacote(formData: FormData) {
  await prisma.pacote.create({ 
    data: { nome: formData.get('nome') as string, precoBase: parseFloat(formData.get('precoBase') as string) || 0, descricao: "" } 
  })
  revalidatePath('/festas')
}

/** 6. TAREFAS, SIMULADOR E WHATSAPP */
export async function createTarefa(formData: FormData) {
  await prisma.tarefa.create({ 
    data: { descricao: formData.get('descricao') as string, equipe: formData.get('equipe') as string, dataLimite: safeDate(formData.get('dataLimite')), status: "PENDENTE" } 
  })
  revalidatePath('/tarefas'); revalidatePath('/calendario')
}

export async function deleteTarefa(formData: FormData) {
  await prisma.tarefa.delete({ where: { id: formData.get('id') as string } })
  revalidatePath('/tarefas')
}

export async function toggleTarefaStatus(formData: FormData) {
  const id = formData.get('id') as string
  const t = await prisma.tarefa.findUnique({ where: { id } })
  if (t) await prisma.tarefa.update({ where: { id }, data: { status: t.status === "PENDENTE" ? "CONCLUIDA" : "PENDENTE" } })
  revalidatePath('/tarefas')
}

export async function salvarSimulacao(formData: FormData) {
  const r = parseFloat(formData.get('receita') as string) || 0; const c = parseFloat(formData.get('custo') as string) || 0
  await prisma.simulacao.create({ 
    data: { receitaPrevista: r, custoTotal: c, lucroEstimado: r-c, margem: r > 0 ? ((r-c)/r)*100 : 0, detalhes: "{}" } 
  })
  revalidatePath('/relatorios')
}

export async function getFestaParaConvite(id: string) {
  return await prisma.festa.findUnique({ where: { id }, include: { cliente: true } })
}

export async function enviarConviteWpp(festaId: string, base64: string) {
  try {
    const f = await prisma.festa.findUnique({ where: { id: festaId }, include: { cliente: true } })
    if (!f?.cliente.telefone) return { error: "Sem telefone" }
    
    await fetch(`${process.env.EVOLUTION_API_URL}/message/sendMedia/BuffetPro`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': process.env.EVOLUTION_API_KEY! },
      body: JSON.stringify({ number: `55${f.cliente.telefone.replace(/\D/g, '')}`, mediaMessage: { mediatype: "image", caption: `Convite: ${f.nomeAniversariante}`, media: base64.split(',')[1] } })
    })
    return { success: true }
  } catch { return { error: "Erro API" } }
}