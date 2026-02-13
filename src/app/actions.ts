'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/** * ==========================================
 * 1. AUTENTICAÇÃO E USUÁRIOS
 * ========================================== */

// AJUSTE: Adicionado 'prevState' como primeiro parâmetro para funcionar com useActionState
export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const senha = formData.get('senha') as string
  
  const usuario = await prisma.usuario.findUnique({ where: { email } })

  if (!usuario || usuario.senha !== senha) {
    return { error: "Credenciais inválidas" }
  }

  const cookieStore = await cookies()
  cookieStore.set('session_user_id', usuario.id, { 
    maxAge: 60 * 60 * 24, 
    path: '/', 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production'
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
    data: { 
      status: formData.get('status') as string, 
      dataVisita: dataVisitaRaw ? new Date(dataVisitaRaw) : null 
    }
  })
  revalidatePath('/leads')
}

export async function deleteLead(formData: FormData) {
  await prisma.lead.delete({ where: { id: formData.get('id') as string } })
  revalidatePath('/leads'); revalidatePath('/')
}

export async function createCliente(formData: FormData) {
  await prisma.cliente.create({ 
    data: { 
      nome: formData.get('nome') as string, 
      telefone: formData.get('telefone') as string, 
      email: formData.get('email') as string || "" 
    } 
  })
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
  await prisma.pacote.create({ 
    data: { 
      nome: formData.get('nome') as string, 
      precoBase: parseFloat(formData.get('precoBase') as string) || 0, 
      descricao: "" 
    } 
  })
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
 * 5. ESTOQUE
 * ========================================== */

export async function createItemEstoque(formData: FormData) {
  await prisma.itemEstoque.create({
    data: { 
      nome: formData.get('nome') as string, 
      categoria: formData.get('categoria') as string, 
      quantidade: parseInt(formData.get('quantidade') as string) || 0, 
      estoqueMinimo: parseInt(formData.get('estoqueMinimo') as string) || 0, 
      unidade: "UN" 
    }
  })
  revalidatePath('/estoque')
}

export async function deleteItemEstoque(formData: FormData) {
  await prisma.itemEstoque.delete({ where: { id: formData.get('id') as string } })
  revalidatePath('/estoque')
}

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

/** * ==========================================
 * 6. FINANCEIRO
 * ========================================== */

export async function confirmarPagamento(formData: FormData) {
  await prisma.pagamento.update({ where: { id: formData.get('id') as string }, data: { status: "PAGO" } })
  revalidatePath('/festas'); revalidatePath('/financeiro'); revalidatePath('/')
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