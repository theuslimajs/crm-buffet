export const dynamic = "force-dynamic";

// src/app/calendario/page.tsx
import { prisma } from "@/lib/prisma";

export default async function CalendarioPage() {
  const hoje = new Date();
  const fim = new Date();
  fim.setDate(fim.getDate() + 30);

  const [festas, tarefas, pagamentos] = await Promise.all([
    prisma.festa.findMany({
      where: { dataFesta: { gte: hoje, lte: fim } },
      orderBy: { dataFesta: "asc" },
      include: { cliente: true },
    }),
    prisma.tarefa.findMany({
      where: { dataLimite: { gte: hoje, lte: fim } },
      orderBy: { dataLimite: "asc" },
    }),
    prisma.pagamento.findMany({
      where: { status: "PENDENTE", dataVencimento: { gte: hoje, lte: fim } },
      orderBy: { dataVencimento: "asc" },
      include: { festa: { include: { cliente: true } } },
    }),
  ]);

  const fmtDate = (d: Date) => new Date(d).toLocaleDateString("pt-BR");

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black">Calendário</h1>
        <p className="text-slate-500">Próximos 30 dias: eventos, tarefas e vencimentos</p>
      </header>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card title="Festas">
          {festas.length === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-3">
              {festas.map((f) => (
                <div key={f.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="font-black">{fmtDate(f.dataFesta)} • {f.horaInicio}</p>
                  <p className="text-sm font-semibold">{f.nomeAniversariante}</p>
                  <p className="text-xs text-slate-500">{f.cliente.nome}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Tarefas">
          {tarefas.length === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-3">
              {tarefas.map((t) => (
                <div key={t.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="font-black">{fmtDate(t.dataLimite)}</p>
                  <p className="text-sm font-semibold">{t.descricao}</p>
                  <p className="text-xs text-slate-500">{t.equipe}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Vencimentos (a receber)">
          {pagamentos.length === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-3">
              {pagamentos.map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-black">{fmtDate(p.dataVencimento)}</p>
                    <p className="text-sm font-semibold truncate">{p.festa?.cliente?.nome ?? "-"}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {p.festa?.nomeAniversariante ?? "-"} • Parcela {p.parcela}
                    </p>
                  </div>
                  <div className="font-black whitespace-nowrap">
                    {p.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      <h2 className="font-black text-lg mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Empty() {
  return <p className="text-slate-500 text-sm">Nada por aqui nos próximos 30 dias.</p>;
}
