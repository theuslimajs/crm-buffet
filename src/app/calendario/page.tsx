import { prisma } from "@/lib/prisma";
import { CalendarDays, Clock } from "lucide-react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default async function CalendarioPage() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const startOfNextMonth = new Date(currentYear, currentMonth + 1, 1);

  // 1. BUSCA TUDO (Festas, Tarefas, Pagamentos e DESPESAS)
  const festas = await prisma.festa.findMany({ where: { dataFesta: { gte: startOfMonth, lt: startOfNextMonth } } });
  const tarefas = await prisma.tarefa.findMany({ where: { dataLimite: { gte: startOfMonth, lt: startOfNextMonth } } });
  
  // Contas a Receber (Verde)
  const pagamentos = await prisma.pagamento.findMany({ 
      where: { dataVencimento: { gte: startOfMonth, lt: startOfNextMonth } },
      include: { festa: true }
  });
  
  // Contas a Pagar (Vermelho - ALIMENTA CALENDÁRIO)
  const despesas = await prisma.despesa.findMany({
      where: { dataVencimento: { gte: startOfMonth, lt: startOfNextMonth } }
  });

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const days: Array<number | null> = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase italic flex items-center gap-3">
            <CalendarDays className="text-purple-600" size={32} /> Calendário Master
          </h1>
          <p className="text-slate-500 font-medium">Festas, Tarefas e Contas (Pagar/Receber).</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border font-bold text-slate-600 shadow-sm flex items-center gap-2">
          <Clock size={16} className="text-purple-500" /> Hoje: {now.toLocaleDateString("pt-BR")}
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-3 bg-white p-8 rounded-[2.5rem] border shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
              {monthNames[currentMonth]} <span className="text-purple-500">{currentYear}</span>
            </h2>
            <div className="flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-widest justify-end">
              <span className="bg-emerald-100 text-emerald-600 px-2 py-1 rounded-md">Festa</span>
              <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-md">Receber</span>
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md">Pagar</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2 text-center">
            {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
              <div key={i} className="text-[10px] font-black text-slate-400 uppercase">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 lg:gap-3">
            {days.map((day, index) => {
              if (day == null) return <div key={index} className="bg-transparent" />;
              
              const dateKey = day;
              const festasDia = festas.filter(f => new Date(f.dataFesta).getDate() === dateKey);
              const pagtosDia = pagamentos.filter(p => new Date(p.dataVencimento).getDate() === dateKey);
              const despesasDia = despesas.filter(d => new Date(d.dataVencimento).getDate() === dateKey); // Filtra despesas do dia
              const tarefasDia = tarefas.filter(t => new Date(t.dataLimite).getDate() === dateKey);
              const ehHoje = day === now.getDate();

              return (
                <div key={index} className={`min-h-[100px] rounded-2xl border p-2 flex flex-col justify-between transition relative bg-slate-50 hover:bg-white hover:shadow-lg ${ehHoje ? "ring-2 ring-purple-600" : ""}`}>
                  <span className={`text-sm font-black ${ehHoje ? "text-purple-600" : "text-slate-400"}`}>{day}</span>
                  
                  <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                    {festasDia.map(f => (
                        <div key={f.id} className="text-[9px] bg-emerald-100 text-emerald-700 px-1 rounded truncate font-bold" title={f.nomeAniversariante}>🎉 {f.nomeAniversariante}</div>
                    ))}
                    {pagtosDia.map(p => (
                        <div key={p.id} className="text-[9px] bg-blue-100 text-blue-700 px-1 rounded truncate font-bold" title={`Receber: R$ ${p.valor}`}>💰 +{p.valor}</div>
                    ))}
                    {despesasDia.map(d => (
                        <div key={d.id} className="text-[9px] bg-red-100 text-red-700 px-1 rounded truncate font-bold" title={`Pagar: ${d.descricao}`}>💸 -{d.valor}</div>
                    ))}
                    {tarefasDia.length > 0 && (
                        <div className="text-[9px] bg-orange-100 text-orange-700 px-1 rounded truncate font-bold">📌 {tarefasDia.length} Tarefas</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}