import { prisma } from "@/lib/prisma"
import { DollarSign, TrendingUp, Users, Calendar } from "lucide-react"

export default async function RelatoriosPage() {
  // 1. Buscando dados financeiros reais
  const pagamentos = await prisma.pagamento.findMany({ where: { status: 'PAGO' } })
  const despesas = await prisma.despesa.findMany() // Busca todas as despesas (PAGO ou PENDENTE, para previsão)

  // 2. Calculando totais
  const receitaTotal = pagamentos.reduce((acc, curr) => acc + curr.valor, 0)
  
  // Consideramos despesas PAGAS para o fluxo de caixa real
  const despesasPagas = despesas.filter(d => d.status === 'PAGO').reduce((acc, curr) => acc + curr.valor, 0)
  const lucroReal = receitaTotal - despesasPagas

  // 3. Buscando métricas operacionais
  const totalLeads = await prisma.lead.count()
  const festasRealizadas = await prisma.festa.count({ where: { status: 'REALIZADO' } })
  const festasAgendadas = await prisma.festa.count({ where: { status: 'AGENDADO' } })

  // 4. Buscando Simulações (CORREÇÃO DO ERRO AQUI)
  // O TypeScript reclamava que a lista era vazia sem tipo definido.
  // Adicionamos ': any[]' para ele aceitar os dados do banco.
  let simulacoes: any[] = [] 

  try {
    // Tenta buscar as simulações se a tabela existir
    simulacoes = await prisma.simulacao.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  } catch (error) {
    console.log("Tabela de simulação vazia ou ainda não criada no banco")
  }

  return (
    <main className="p-8 space-y-8 bg-slate-950 min-h-screen text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white">RELATÓRIOS & INSIGHTS</h1>
          <p className="text-slate-400">Visão geral da saúde financeira do Buffet GM</p>
        </div>
      </div>

      {/* --- KPI CARDS (Indicadores) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Receita Total */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest">Receita Bruta</h3>
            <div className="bg-emerald-500/10 p-2 rounded-xl">
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">
            R$ {receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-emerald-500 mt-2 font-bold">+ Entradas confirmadas</p>
        </div>

        {/* Lucro Líquido */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest">Lucro Real</h3>
            <div className="bg-blue-500/10 p-2 rounded-xl">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <p className={`text-3xl font-black ${lucroReal >= 0 ? 'text-white' : 'text-red-400'}`}>
            R$ {lucroReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-2">Receitas - Despesas Pagas</p>
        </div>

        {/* Total de Leads */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest">Pipeline de Vendas</h3>
            <div className="bg-purple-500/10 p-2 rounded-xl">
              <Users className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{totalLeads}</p>
          <p className="text-xs text-slate-500 mt-2">Clientes potenciais cadastrados</p>
        </div>

        {/* Festas Agendadas */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest">Agenda Futura</h3>
            <div className="bg-orange-500/10 p-2 rounded-xl">
              <Calendar className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{festasAgendadas}</p>
          <p className="text-xs text-slate-500 mt-2">Eventos confirmados para realizar</p>
        </div>
      </div>

      {/* --- SEÇÃO DE SIMULAÇÕES RECENTES --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">Últimas Simulações de Orçamento</h2>
          
          {simulacoes.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <p>Nenhuma simulação registrada recentemente.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {simulacoes.map((sim: any) => (
                <div key={sim.id} className="flex items-center justify-between bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 hover:bg-slate-800 transition">
                  <div>
                    <p className="text-sm font-bold text-slate-300">
                      Margem Prevista: <span className="text-white">{sim.margem?.toFixed(1)}%</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(sim.createdAt).toLocaleDateString('pt-BR')} às {new Date(sim.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-black text-lg">
                      + R$ {sim.lucroEstimado?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Lucro Estimado</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumo Rápido */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          
          <h2 className="text-2xl font-black text-white mb-2 relative z-10">Meta Mensal</h2>
          <p className="text-emerald-100 mb-8 relative z-10">Baseado no seu histórico de 30 dias</p>
          
          <div className="space-y-4 relative z-10">
            <div>
              <div className="flex justify-between text-sm font-bold text-white mb-1">
                <span>Progresso</span>
                <span>{festasRealizadas} eventos</span>
              </div>
              <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                <div className="bg-white h-full rounded-full" style={{ width: `${Math.min((festasRealizadas / 10) * 100, 100)}%` }}></div>
              </div>
              <p className="text-xs text-emerald-200 mt-2">Meta sugerida: 10 eventos/mês</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}