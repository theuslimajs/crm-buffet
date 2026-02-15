// src/app/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PartyPopper, DollarSign, Target, Package, ClipboardList } from "lucide-react";

export default async function DashboardPage() {
  const [leads, festasProximas, pagamentosPendentes, tarefasPendentes, estoqueBaixo] = await Promise.all([
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.festa.findMany({
      where: { dataFesta: { gte: new Date() } },
      orderBy: { dataFesta: "asc" },
      take: 6,
      include: { cliente: true },
    }),
    prisma.pagamento.findMany({
      where: { status: "PENDENTE" },
      orderBy: { dataVencimento: "asc" },
      take: 8,
      include: { festa: { include: { cliente: true } } },
    }),
    prisma.tarefa.findMany({
      where: { status: "PENDENTE" },
      orderBy: { dataLimite: "asc" },
      take: 8,
    }),
    prisma.itemEstoque.findMany({
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
  ]);

  const itensBaixos = estoqueBaixo.filter((i) => i.quantidade <= i.estoqueMinimo);

  const dinheiroPendente = pagamentosPendentes.reduce((acc, p) => acc + p.valor, 0);

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
          <p className="text-slate-500">Visão rápida do dia</p>
        </div>

        <div className="flex items-center gap-3 no-print">
          <Link
            href="/festas"
            className="px-4 py-3 rounded-xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition"
          >
            Nova Festa
          </Link>
          <Link
            href="/leads"
            className="px-4 py-3 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition"
          >
            Novo Lead
          </Link>
        </div>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Pagamentos pendentes"
          value={dinheiroPendente.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          icon={<DollarSign size={18} />}
        />
        <KpiCard title="Leads recentes" value={String(leads.length)} icon={<Target size={18} />} />
        <KpiCard title="Festas próximas" value={String(festasProximas.length)} icon={<PartyPopper size={18} />} />
        <KpiCard title="Estoque baixo" value={String(itensBaixos.length)} icon={<Package size={18} />} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Festas */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-lg">Próximas festas</h2>
            <Link href="/festas" className="text-emerald-700 font-bold text-sm hover:underline">
              Ver todas
            </Link>
          </div>

          <div className="space-y-3">
            {festasProximas.length === 0 ? (
              <p className="text-slate-500 text-sm">Sem eventos agendados.</p>
            ) : (
              festasProximas.map((f) => (
                <div key={f.id} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50">
                  <div className="min-w-0">
                    <p className="font-bold truncate">{f.nomeAniversariante}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {f.cliente.nome} • {new Date(f.dataFesta).toLocaleDateString("pt-BR")} {f.horaInicio}
                    </p>
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-600">
                    {String(f.status).replaceAll("_", " ")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Financeiro */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-lg">Pagamentos a receber</h2>
            <Link href="/financeiro" className="text-emerald-700 font-bold text-sm hover:underline">
              Abrir financeiro
            </Link>
          </div>

          <div className="space-y-3">
            {pagamentosPendentes.length === 0 ? (
              <p className="text-slate-500 text-sm">Nenhum pagamento pendente.</p>
            ) : (
              pagamentosPendentes.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50">
                  <div className="min-w-0">
                    <p className="font-bold truncate">
                      {p.festa?.cliente?.nome ?? "Sem festa"} • Parcela {p.parcela}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      Venc.: {new Date(p.dataVencimento).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <span className="font-black">
                    {p.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tarefas */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-lg">Tarefas pendentes</h2>
            <Link href="/tarefas" className="text-emerald-700 font-bold text-sm hover:underline">
              Ver tarefas
            </Link>
          </div>

          <div className="space-y-3">
            {tarefasPendentes.length === 0 ? (
              <p className="text-slate-500 text-sm">Tudo em dia 🎉</p>
            ) : (
              tarefasPendentes.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50">
                  <div className="min-w-0">
                    <p className="font-bold truncate">{t.descricao}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {t.equipe} • Até {new Date(t.dataLimite).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <ClipboardList size={16} className="text-slate-400 shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h2 className="font-black text-lg mb-4">Estoque em atenção</h2>

        {itensBaixos.length === 0 ? (
          <p className="text-slate-500 text-sm">Nenhum item abaixo do mínimo.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {itensBaixos.map((i) => (
              <div key={i.id} className="p-4 rounded-xl bg-red-50 border border-red-100">
                <p className="font-bold">{i.nome}</p>
                <p className="text-xs text-slate-600">
                  {i.categoria} • {i.quantidade} / mín. {i.estoqueMinimo} ({i.unidade})
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function KpiCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">{title}</p>
        <span className="text-slate-400">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-black">{value}</p>
    </div>
  );
}
