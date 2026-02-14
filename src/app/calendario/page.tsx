import { prisma } from "@/lib/prisma";
import { CalendarDays, CheckCircle2, Clock, AlertCircle, Wallet } from "lucide-react";

// Evita prerender no build e garante Prisma em Node (não Edge)
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Funções Auxiliares
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

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Intervalo do mês (melhor usar [>= inicio, < inicioDoProximoMes] para evitar bugs de hora)
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const startOfNextMonth = new Date(currentYear, currentMonth + 1, 1);

  // 1. BUSCA FESTAS
  const festas = await prisma.festa.findMany({
    where: { dataFesta: { gte: startOfMonth, lt: startOfNextMonth } },
    include: { cliente: true },
    orderBy: { dataFesta: "asc" },
  });

  // 2. BUSCA TAREFAS
  const tarefas = await prisma.tarefa.findMany({
    where: { dataLimite: { gte: startOfMonth, lt: startOfNextMonth } },
    orderBy: { dataLimite: "asc" },
  });

  // 3. BUSCA PAGAMENTOS
  const pagamentos = await prisma.pagamento.findMany({
    where: { dataVencimento: { gte: startOfMonth, lt: startOfNextMonth } },
    include: { festa: { include: { cliente: true } } },
    orderBy: { dataVencimento: "asc" },
  });

  // Configuração do Grid
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
          <p className="text-slate-500 font-medium">Visão unificada de Festas, Tarefas e Financeiro.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border font-bold text-slate-600 shadow-sm flex items-center gap-2">
          <Clock size={16} className="text-purple-500" /> Hoje: {now.toLocaleDateString("pt-BR")}
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* === COLUNA 1: GRID VISUAL === */}
        <div className="xl:col-span-2 bg-white p-8 rounded-[2.5rem] border shadow-xl h-fit">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
              {monthNames[currentMonth]} <span className="text-purple-500">{currentYear}</span>
            </h2>

            <div className="flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-widest justify-end">
              <span className="flex items-center gap-1 bg-emerald-100 text-emerald-600 px-2 py-1 rounded-md">🎉 Festa</span>
              <span className="flex items-center gap-1 bg-blue-100 text-blue-600 px-2 py-1 rounded-md">💰 Pagto</span>
              <span className="flex items-center gap-1 bg-orange-100 text-orange-600 px-2 py-1 rounded-md">📌 Tarefa</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2 text-center">
            {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
              <div key={i} className="text-[10px] font-black text-slate-400 uppercase">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 lg:gap-3">
            {days.map((day, index) => {
              const temFesta = day != null && festas.some((f) => new Date(f.dataFesta).getDate() === day);
              const temTarefa = day != null && tarefas.some((t) => new Date(t.dataLimite).getDate() === day);
              const temPagto = day != null && pagamentos.some((p) => new Date(p.dataVencimento).getDate() === day);

              const ehHoje = day === now.getDate();

              return (
                <div
                  key={index}
                  className={`
                    min-h-[80px] md:min-h-[100px] rounded-2xl border p-2 flex flex-col justify-between transition relative
                    ${day == null ? "bg-transparent border-transparent" : "bg-slate-50 hover:bg-white hover:shadow-lg"}
                    ${ehHoje ? "ring-2 ring-purple-600 ring-offset-2" : ""}
                  `}
                >
                  {day != null && (
                    <>
                      <span className={`text-sm font-black ${ehHoje ? "text-purple-600" : "text-slate-400"}`}>
                        {day}
                      </span>

                      <div className="flex flex-col gap-1 mt-1">
                        {temFesta && <div className="h-1.5 w-full bg-emerald-400 rounded-full shadow-sm" title="Festa" />}
                        {temPagto && <div className="h-1.5 w-full bg-blue-400 rounded-full shadow-sm" title="Financeiro" />}
                        {temTarefa && <div className="h-1.5 w-full bg-orange-400 rounded-full shadow-sm" title="Tarefa" />}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* === COLUNA 2: LISTAS === */}
        <div className="space-y-6">
          {/* FESTAS */}
          <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
              <CheckCircle2 size={16} className="text-emerald-400" /> Próximas Festas
            </h3>
            <div className="space-y-3 relative z-10 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
              {festas.length === 0 ? (
                <p className="text-slate-500 text-xs italic">Sem festas este mês.</p>
              ) : (
                festas.map((festa) => (
                  <div
                    key={festa.id}
                    className="bg-slate-800 p-3 rounded-xl border border-slate-700/50 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold text-white text-sm">{festa.nomeAniversariante}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(festa.dataFesta).toLocaleDateString("pt-BR")} • {festa.horaInicio}
                      </p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* FINANCEIRO */}
          <div className="bg-white p-6 rounded-[2.5rem] border shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Wallet size={16} className="text-blue-500" /> Vencimentos (Receita)
            </h3>
            <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
              {pagamentos.length === 0 ? (
                <p className="text-slate-400 text-xs italic">Nenhum pagamento previsto.</p>
              ) : (
                pagamentos.map((pagto) => (
                  <div
                    key={pagto.id}
                    className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        Parcela {pagto.parcela === 0 ? "Única" : pagto.parcela}
                      </p>
                      <p className="text-[10px] text-blue-500 font-bold uppercase">
                        {pagto.festa ? `Festa: ${pagto.festa.nomeAniversariante}` : "Avulso"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-black ${pagto.status === "PAGO" ? "text-emerald-500" : "text-slate-800"}`}>
                        R$ {pagto.valor}
                      </p>
                      <p className="text-[9px] text-slate-400">
                        {new Date(pagto.dataVencimento).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* TAREFAS */}
          <div className="bg-white p-6 rounded-[2.5rem] border shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertCircle size={16} className="text-orange-500" /> Tarefas Pendentes
            </h3>
            <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
              {tarefas.length === 0 ? (
                <p className="text-slate-400 text-xs italic">Tudo feito!</p>
              ) : (
                tarefas.map((tarefa) => (
                  <div
                    key={tarefa.id}
                    className="flex items-center gap-3 p-3 bg-orange-50/50 rounded-xl border border-orange-100"
                  >
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        tarefa.status === "PENDENTE" ? "bg-orange-500" : "bg-emerald-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">{tarefa.descricao}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[9px] font-bold text-orange-400 uppercase">{tarefa.equipe}</span>
                        <span className="text-[9px] text-slate-400">
                          {new Date(tarefa.dataLimite).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
