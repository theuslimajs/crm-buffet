'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * AJUDANTE: Garante datas válidas para não quebrar o banco
 */
function safeDate(dateStr: any): Date {
  if (!dateStr) return new Date()
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? new Date() : d
}

/** * ==========================================
 * 1. AUTENTICAÇÃO E USUÁRIOS (PERMISSÕES)
 * ========================================== */

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const senha = formData.get('senha') as string
  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } })
    if (!usuario || usuario.senha !== senha) return { error: "Credenciais inválidas" }
    
    const cookieStore = await cookies()
    cookieStore.set('session_user_id', usuario.id, { 
      maxAge: 60 * 60 * 24, path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production' 
    })
  } catch (e) { return { error: "Erro de conexão com o banco" } }
  redirect('/')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('session_user_id')
  redirect('/login')
}

export async function createUsuario(formData: FormData) {
  try {
    await prisma.usuario.create({
      data: { 
        nome: formData.get('nome') as string, 
        email: formData.get('email') as string, 
        senha: formData.get('senha') as string, 
        cargo: formData.get('cargo') as string,
        podeVerLeads: true, podeVerCalendario: true, podeVerFestas: true, 
        podeVerTarefas: true, podeVerEstoque: true,
        podeVerFinanceiro: formData.get('cargo') === "DONO",
        podeVerRelatorios: formData.get('cargo') === "DONO",
      }
    })
    revalidatePath('/configuracoes')
  } catch (e) { console.error(e) }
}

export async function updatePermissoes(formData: FormData) {
  try {
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
  } catch (e) { console.error(e) }
}

/** * ==========================================
 * 2. COMERCIAL (LEADS & CLIENTES)
 * ========================================== */

export async function createLead(formData: FormData) {
  try {
    await prisma.lead.create({
      data: { 
        nome: formData.get('nome') as string, 
        telefone: formData.get('telefone') as string,
        origem: formData.get('origem') as string || "Direto",
        status: 'NOVO' 
      }
    })
    revalidatePath('/leads'); revalidatePath('/')
  } catch (e) { console.error(e) }
}

export async function updateLeadStatus(formData: FormData) {
  try {
    const id = formData.get('id') as string
    const dataVisitaRaw = formData.get('dataVisita')
    await prisma.lead.update({
      where: { id },
      data: { 
        status: formData.get('status') as string,
        dataVisita: dataVisitaRaw ? safeDate(dataVisitaRaw) : null
      }
    })
    revalidatePath('/leads')
  } catch (e) { console.error(e) }
}

export async function deleteLead(formData: FormData) {
  try {
    await prisma.lead.delete({ where: { id: formData.get('id') as string } })
    revalidatePath('/leads'); revalidatePath('/')
  } catch (e) { console.error(e) }
}

export async function createCliente(formData: FormData) {
  try {
    await prisma.cliente.create({ 
      data: { 
        nome: formData.get('nome') as string, 
        telefone: formData.get('telefone') as string, 
        email: formData.get('email') as string || "" 
      } 
    })
    revalidatePath('/festas/nova')
  } catch (e) { console.error(e) }
}

/** * ==========================================
 * 3. OPERACIONAL (FESTAS, AGENDA & PACOTES)
 * ========================================== */

export async function createFesta(formData: FormData) {
  const clienteId = formData.get('clienteId') as string
  const pacoteId = formData.get('pacoteId') as string
  const valorTotal = parseFloat(formData.get('valorTotal') as string) || 0
  const dataFesta = safeDate(formData.get('dataFesta'))

  if (!clienteId || !pacoteId) return

  try {
    const festa = await prisma.festa.create({
      data: {
        nomeAniversariante: formData.get('nomeAniversariante') as string,
        dataFesta: dataFesta,
        valorTotal: valorTotal,
        qtdPessoas: parseInt(formData.get('qtdPessoas') as string) || 0,
        status: 'AGENDADO',
        cliente: { connect: { id: clienteId } },
        pacote: { connect: { id: pacoteId } }
      }
    })

    if (valorTotal > 0) {
      await prisma.pagamento.create({
        data: { 
          festaId: festa.id, 
          valor: valorTotal, 
          status: "PENDENTE", 
          dataVencimento: dataFesta, 
          parcela: 1, 
          metodo: "A DEFINIR" 
        }
      })
    }
    revalidatePath('/festas'); revalidatePath('/calendario'); revalidatePath('/'); revalidatePath('/financeiro')
  } catch (e) { console.error(e) }
}

export async function deleteFesta(formData: FormData) {
  try {
    const id = formData.get('id') as string
    await prisma.pagamento.deleteMany({ where: { festaId: id } })
    await prisma.festa.delete({ where: { id } })
    revalidatePath('/festas'); revalidatePath('/calendario'); revalidatePath('/'); revalidatePath('/financeiro')
  } catch (e) { console.error(e) }
}

export async function createPacote(formData: FormData) {
  try {
    await prisma.pacote.create({ 
      data: { 
        nome: formData.get('nome') as string, 
        precoBase: parseFloat(formData.get('precoBase') as string) || 0,
        descricao: ""
      } 
    })
    revalidatePath('/festas')
  } catch (e) { console.error(e) }
}

/** * ==========================================
 * 4. TAREFAS
 * ========================================== */

export async function createTarefa(formData: FormData) {
  try {
    await prisma.tarefa.create({
      data: { 
        descricao: formData.get('descricao') as string, 
        equipe: formData.get('equipe') as string, 
        dataLimite: safeDate(formData.get('dataLimite')), 
        status: "PENDENTE" 
      }
    })
    revalidatePath('/tarefas'); revalidatePath('/calendario')
  } catch (e) { console.error(e) }
}

export async function deleteTarefa(formData: FormData) {
  try {
    await prisma.tarefa.delete({ where: { id: formData.get('id') as string } })
    revalidatePath('/tarefas')
  } catch (e) { console.error(e) }
}

export async function toggleTarefaStatus(formData: FormData) {
  try {
    const id = formData.get('id') as string
    const tarefa = await prisma.tarefa.findUnique({ where: { id } })
    if (tarefa) {
      await prisma.tarefa.update({ 
        where: { id }, data: { status: tarefa.status === "PENDENTE" ? "CONCLUIDA" : "PENDENTE" } 
      })
    }
    revalidatePath('/tarefas')
  } catch (e) { console.error(e) }
}

/** * ==========================================
 * 5. ESTOQUE (COM MOVIMENTAÇÃO COMPLETA)
 * ========================================== */

export async function createItemEstoque(formData: FormData) {
  try {
    await prisma.itemEstoque.create({
      data: { 
        nome: formData.get('nome') as string, 
        categoria: formData.get('categoria') as string || "Geral", 
        quantidade: parseInt(formData.get('quantidade') as string) || 0, 
        estoqueMinimo: parseInt(formData.get('estoqueMinimo') as string) || 5, 
        unidade: "UN" 
      }
    })
    revalidatePath('/estoque')
  } catch (e) { console.error(e) }
}

export async function deleteItemEstoque(formData: FormData) {
  try {
    await prisma.itemEstoque.delete({ where: { id: formData.get('id') as string } })
    revalidatePath('/estoque')
  } catch (e) { console.error(e) }
}

export async function movimentarEstoque(formData: FormData) {
  try {
    const id = formData.get('id') as string
    const tipo = formData.get('tipo') as string
    const valor = parseInt(formData.get('valor') as string) || 1
    const item = await prisma.itemEstoque.findUnique({ where: { id } })
    if (item) {
      let novaQtd = item.quantidade
      if (tipo === 'ENTRADA') novaQtd += valor
      else if (tipo === 'SAIDA') novaQtd = Math.max(0, item.quantidade - valor)
      
      await prisma.itemEstoque.update({ where: { id }, data: { quantidade: novaQtd } })
    }
    revalidatePath('/estoque')
  } catch (e) { console.error(e) }
}

export async function ajustarQuantidade(formData: FormData) {
  try {
    const id = formData.get('id') as string
    const operacao = formData.get('operacao') as string
    const item = await prisma.itemEstoque.findUnique({ where: { id } })
    if (item) {
      const novaQtd = operacao === "SOMA" ? item.quantidade + 1 : Math.max(0, item.quantidade - 1)
      await prisma.itemEstoque.update({ where: { id }, data: { quantidade: novaQtd } })
    }
    revalidatePath('/estoque')
  } catch (e) { console.error(e) }
}

/** * ==========================================
 * 6. FINANCEIRO (HÍBRIDO, FLUXO DE CAIXA & DESPESAS)
 * ========================================== */

export async function gerarFinanceiroHibrido(formData: FormData) {
  try {
    const festaId = formData.get('festaId') as string
    const valorTotal = parseFloat(formData.get('valorTotal') as string) || 0
    const valorEntrada = parseFloat(formData.get('valorEntrada') as string) || 0
    
    await prisma.pagamento.deleteMany({ where: { festaId } })
    
    // Parcela 1: Entrada (PAGO)
    await prisma.pagamento.create({ 
        data: { festaId, valor: valorEntrada, status: "PAGO", parcela: 0, dataVencimento: new Date(), metodo: "PIX" } 
    })
    
    // Parcela 2: Restante (PENDENTE)
    if (valorTotal > valorEntrada) {
        await prisma.pagamento.create({
            data: { 
              festaId, valor: valorTotal - valorEntrada, status: "PENDENTE", 
              parcela: 1, dataVencimento: safeDate(formData.get('dataInicio')), metodo: "A RECEBER" 
            }
        })
    }
    revalidatePath('/'); revalidatePath('/financeiro'); revalidatePath('/festas')
  } catch (e) { console.error(e) }
}

export async function createDespesa(formData: FormData) {
  try {
    await prisma.despesa.create({
      data: { 
        descricao: formData.get('descricao') as string || "Despesa sem nome", 
        valor: parseFloat(formData.get('valor') as string) || 0, 
        categoria: formData.get('categoria') as string || "Geral", 
        dataVencimento: safeDate(formData.get('dataVencimento')), 
        status: 'PENDENTE' 
      }
    })
    revalidatePath('/'); revalidatePath('/financeiro')
  } catch (e) { console.error(e) }
}

export async function confirmarPagamento(formData: FormData) {
  try {
    await prisma.pagamento.update({ 
      where: { id: formData.get('id') as string }, data: { status: "PAGO" } 
    })
    revalidatePath('/'); revalidatePath('/financeiro'); revalidatePath('/festas')
  } catch (e) { console.error(e) }
}

export async function pagarDespesa(formData: FormData) {
  try {
    await prisma.despesa.update({ where: { id: formData.get('id') as string }, data: { status: 'PAGO' } })
    revalidatePath('/financeiro'); revalidatePath('/')
  } catch (e) { console.error(e) }
}

export async function deleteDespesa(formData: FormData) {
  try {
    await prisma.despesa.delete({ where: { id: formData.get('id') as string } })
    revalidatePath('/financeiro'); revalidatePath('/')
  } catch (e) { console.error(e) }
}

/** * ==========================================
 * 7. SIMULADOR & WHATSAPP
 * ========================================== */

export async function salvarSimulacao(formData: FormData) {
  try {
    const receita = parseFloat(formData.get('receita') as string) || 0
    const custo = parseFloat(formData.get('custo') as string) || 0
    const lucro = receita - custo
    await prisma.simulacao.create({
      data: { 
        receitaPrevista: receita, custoTotal: custo, lucroEstimado: lucro, 
        margem: receita > 0 ? (lucro / receita) * 100 : 0, detalhes: formData.get('detalhes') as string || "{}"
      }
    })
    revalidatePath('/relatorios')
  } catch (e) { console.error(e) }
}

export async function getFestaParaConvite(id: string) {
  try {
    return await prisma.festa.findUnique({ where: { id }, include: { cliente: true } })
  } catch (e) { return null }
}

export async function enviarConviteWpp(festaId: string, base64: string) {
  try {
    const festa = await prisma.festa.findUnique({ where: { id: festaId }, include: { cliente: true } })
    if (!festa?.cliente.telefone) return { error: "Telefone ausente" }
    
    await fetch(`${process.env.EVOLUTION_API_URL}/message/sendMedia/BuffetPro`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 'apikey': process.env.EVOLUTION_API_KEY! 
      },
      body: JSON.stringify({ 
        number: `55${festa.cliente.telefone.replace(/\D/g, '')}`, 
        mediaMessage: { 
          mediatype: "image", caption: `Convite de ${festa.nomeAniversariante}`, 
          media: base64.split(',')[1] 
        } 
      })
    })
    return { success: true }
  } catch { return { error: "Erro na API de WhatsApp" } }
}