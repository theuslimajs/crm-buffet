import { prisma } from '@/lib/prisma'
import { DollarSign, TrendingUp, TrendingDown, Wallet, AlertCircle, Clock } from 'lucide-react'

// Força a atualização dos dados sempre que você entra na página
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // 1. BUSCAR DADOS DO BANCO
  const pagamentos = await prisma.pagamento.findMany() // Entradas (Festas)
  const despesas = await prisma.despesa.findMany()     // Saídas (Contas)
  
  // 2. CÁLCULOS FINANCEIROS
  // Receita Real (Dinheiro no Bolso)
  const receitaRecebida = pagamentos
    .filter(p => p.status === 'PAGO')
    .reduce((acc, p) => acc + p.valor, 0)
    
  // A Receber (Dinheiro Futuro)
  const aReceber = pagamentos
    .filter(p => p.status === 'PENDENTE')
    .reduce((acc, p) => acc + p.valor, 0)

  // Despesa Real (Dinheiro que Saiu)
  const despesaPaga = despesas
    .filter(d => d.status === 'PAGO')
    .reduce((acc, d) => acc + d.valor, 0)
    
  // Contas a Pagar (Dívida Futura)
  const contasAPagar = despesas
    .filter(d => d.status === 'PENDENTE')
    .reduce((acc, d) => acc + d.valor, 0)

  // Resultados
  const lucroReal = receitaRecebida - despesaPaga
  const previsaoCaixa = (receitaRecebida + aReceber) - (despesaPaga + contasAPagar)

  // Formatador de Moeda
  const money = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-slate-800 uppercase italic">Visão Geral</h1>
        <p className="text-slate-500 font-medium">Acompanhe a saúde financeira do seu Buffet em tempo real.</p>
      </header>

      {/* GRID DE INDICADORES (6 Cards para visão total) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* 1. CAIXA REAL (O que tem no bolso) */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-start mb-2">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600"><TrendingUp size={24} /></div>
            <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Entrada</span>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Receita Recebida</p>
            <h3 className="text-3xl font-black text-slate-800">R$ {money(receitaRecebida)}</h3>
          </div>
        </div>

        {/* 2. SAÍDAS REAIS (O que já pagou) */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-start mb-2">
            <div className="p-3 rounded-xl bg-red-100 text-red-600"><TrendingDown size={24} /></div>
            <span className="text-[10px] font-black uppercase text-red-600 bg-red-50 px-2 py-1 rounded-lg">Saída</span>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Despesas Pagas</p>
            <h3 className="text-3xl font-black text-slate-800">R$ {money(despesaPaga)}</h3>
          </div>
        </div>

        {/* 3. LUCRO REAL (Saldo Atual) */}
        <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl flex flex-col justify-between text-white hover:scale-[1.02] transition transform">
          <div className="flex justify-between items-start mb-2">
            <div className="p-3 rounded-xl bg-white/10 text-white"><Wallet size={24} /></div>
            <span className="text-[10px] font-black uppercase text-white/80 bg-white/10 px-2 py-1 rounded-lg">Saldo</span>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Lucro Líquido</p>
            <h3 className={`text-3xl font-black ${lucroReal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              R$ {money(lucroReal)}
            </h3>
          </div>
        </div>

        {/* 4. A RECEBER (Futuro) */}
        <div className="bg-white p-6 rounded-[2rem] border border-blue-100 shadow-sm ring-1 ring-blue-50/50 flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-start mb-2">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600"><Clock size={24} /></div>
            <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Pendente</span>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">A Receber (Festas)</p>
            <h3 className="text-3xl font-black text-blue-600">R$ {money(aReceber)}</h3>
          </div>
        </div>

        {/* 5. A PAGAR (Dívidas) */}
        <div className="bg-white p-6 rounded-[2rem] border border-orange-100 shadow-sm ring-1 ring-orange-50/50 flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-start mb-2">
            <div className="p-3 rounded-xl bg-orange-100 text-orange-600"><AlertCircle size={24} /></div>
            <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">Atenção</span>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Contas a Pagar</p>
            <h3 className="text-3xl font-black text-orange-600">R$ {money(contasAPagar)}</h3>
          </div>
        </div>

        {/* 6. PREVISÃO (Card Informativo) */}
        <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-6 rounded-[2rem] border border-slate-200 flex flex-col justify-center items-center text-center">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Previsão de Fechamento</p>
          <p className="text-sm text-slate-400 mb-2 px-4 leading-tight">Se receber tudo e pagar as contas pendentes, seu saldo será:</p>
          <h3 className={`text-2xl font-black ${previsaoCaixa >= 0 ? 'text-slate-700' : 'text-red-500'}`}>
            R$ {money(previsaoCaixa)}
          </h3>
        </div>

      </div>
    </div>
  )
}