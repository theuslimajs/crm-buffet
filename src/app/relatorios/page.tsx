import { prisma } from '@/lib/prisma'
import PrintButton from '@/components/PrintButton'
import { TrendingUp, Users, Calendar, DollarSign, Target, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default async function RelatoriosPage() {
  const festas = await prisma.festa.findMany({ include: { cliente: true } })
  const leads = await prisma.lead.findMany()
  const pagamentos = await prisma.pagamento.findMany({ where: { status: 'PAGO' } })
  
  let simulacoes = []
  try {
    // @ts-ignore
    simulacoes = await prisma.simulacao.findMany({ orderBy: { createdAt: 'desc' }, take: 5 })
  } catch (e) {}

  const totalFaturamento = pagamentos.reduce((acc, curr) => acc + curr.valor, 0)
  const ticketMedio = festas.length > 0 ? totalFaturamento / festas.length : 0
  const taxaConversao = leads.length > 0 ? (festas.length / leads.length) * 100 : 0
  
  const leadsNovos = leads.filter(l => l.status === 'NOVO').length
  const leadsGanhos = leads.filter(l => l.status === 'FECHADO' || l.status === 'GANHO').length
  const leadsPerdidos = leads.filter(l => l.status === 'PERDIDO').length

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase italic flex items-center gap-3">
            <TrendingUp className="text-emerald-600" size={32} /> Central de Desempenho
          </h1>
          <p className="text-slate-500 font-medium">Análise estratégica dos números do Buffet GM.</p>
        </div>
        <PrintButton />
      </header>

      {/* KPI CARDS (Com Tendência de volta) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          titulo="Faturamento" 
          valor={`R$ ${totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={<DollarSign size={24}/>} 
          trend="+15%" 
          positive={true} 
        />
        <KpiCard 
          titulo="Total de Festas" 
          valor={festas.length.toString()} 
          icon={<Calendar size={24}/>} 
          trend="+4" 
          positive={true} 
        />
        <KpiCard 
          titulo="Taxa de Conversão" 
          valor={`${taxaConversao.toFixed(1)}%`} 
          icon={<Target size={24}/>} 
          trend="-2%" 
          positive={false} 
        />
        <KpiCard 
          titulo="Ticket Médio" 
          valor={`R$ ${ticketMedio.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`} 
          icon={<Activity size={24}/>} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FUNIL DE VENDAS */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border shadow-xl">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-6 flex items-center gap-2">
            <Users size={20} className="text-blue-500"/> Funil de Vendas
          </h2>
          <div className="space-y-6">
            <ProgressBar label="Leads Novos (Entrada)" count={leadsNovos} total={leads.length} color="bg-blue-500" />
            <ProgressBar label="Em Negociação" count={leads.length - leadsNovos - leadsGanhos - leadsPerdidos} total={leads.length} color="bg-yellow-500" />
            <ProgressBar label="Vendas Fechadas (Sucesso)" count={leadsGanhos} total={leads.length} color="bg-emerald-500" />
            <ProgressBar label="Perdidos" count={leadsPerdidos} total={leads.length} color="bg-red-400" />
          </div>

          {/* RODAPÉ DO FUNIL (Restaurado) */}
          <div className="mt-8 p-4 bg-slate-50 rounded-2xl flex justify-between items-center text-xs font-bold text-slate-500 border border-slate-100">
            <span>Total de Leads: {leads.length}</span>
            <span>Meta Mensal: 50 Leads</span>
          </div>
        </div>

        {/* SIMULAÇÕES */}
        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
            <Activity size={20} className="text-purple-400"/> Simulações
          </h2>
          <div className="space-y-4">
            {simulacoes.length === 0 ? <p className="text-sm opacity-50">Sem dados.</p> : 
              // @ts-ignore
              simulacoes.map((sim: any) => (
                <div key={sim.id} className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                   <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase text-slate-400">Margem</span>
                      <span className={`text-xs font-black px-2 py-0.5 rounded ${sim.margem > 30 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {sim.margem.toFixed(1)}%
                      </span>
                   </div>
                   <div className="mt-2">
                      <p className="text-xl font-black">R$ {sim.lucroEstimado.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Custo: R$ {sim.custoTotal.toLocaleString('pt-BR')}</p>
                   </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ titulo, valor, icon, trend, positive }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <div className="text-emerald-500">{icon}</div>
        {trend && (
          <span className={`text-[10px] font-black px-2 py-1 rounded-full flex items-center ${positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
            {positive ? <ArrowUpRight size={12} className="mr-1"/> : <ArrowDownRight size={12} className="mr-1"/>}
            {trend}
          </span>
        )}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{titulo}</p>
      <h3 className="text-2xl font-black text-slate-800 mt-1">{valor}</h3>
    </div>
  )
}

function ProgressBar({ label, count, total, color }: any) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div>
      <div className="flex justify-between text-xs font-bold mb-1">
        <span className="text-slate-700">{label}</span>
        <span className="text-slate-400">{count} ({pct.toFixed(0)}%)</span>
      </div>
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  )
}