// src/app/relatorios/page.tsx
import { prisma } from "@/lib/prisma";
import PrintButton from "@/components/PrintButton";

export default async function RelatoriosPage() {
  const agora = new Date();
  const inicio30 = new Date();
  inicio30.setDate(inicio30.getDate() - 30);

  const [pagos30, despesas30, simulacoes] = await Promise.all([
    prisma.pagamento.findMany({ where: { status: "PAGO", createdAt: { gte: inicio30 } } }),
    prisma.despesa.findMany({ where: { status: "PAGO", createdAt: { gte: inicio30 } } }),
    prisma.simulacao.findMany({ orderBy: { createdAt: "desc" }, take: 20, include: { festa: { include: { cliente: true } } } }),
  ]);

  const receita30 = pagos30.reduce((acc, p) => acc + p.valor, 0);
  const custo30 = despesas30.reduce((acc, d) => acc + d.valor, 0);
  const lucro30 = receita30 - custo30;

  const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black">Relatórios</h1>
          <p className="text-slate-500">Resumo financeiro e simulador</p>
        </div>
        <PrintButton />
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Kpi title="Receita paga (30 dias)" value={fmt(receita30)} />
        <Kpi title="Despesas pagas (30 dias)" value={fmt(custo30)} />
        <Kpi title="Resultado (30 dias)" value={fmt(lucro30)} />
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h2 className="font-black text-lg mb-2">Simulações recentes</h2>
        <p className="text-xs text-slate-500 mb-4">
          Salvas em {agora.toLocaleDateString("pt-BR")} • Use para comparar cenários de lucro
        </p>

        {simulacoes.length === 0 ? (
          <p className="text-slate-500">Nenhuma simulação salva.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-2">Data</th>
                  <th>Cliente</th>
                  <th>Festa</th>
                  <th>Receita</th>
                  <th>Custo</th>
                  <th>Lucro</th>
                  <th>Margem</th>
                </tr>
              </thead>
              <tbody>
                {simulacoes.map((s) => (
                  <tr key={s.id} className="border-b last:border-b-0">
                    <td className="py-3">{new Date(s.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td className="font-semibold">{s.festa?.cliente?.nome ?? "-"}</td>
                    <td>{s.festa?.nomeAniversariante ?? "-"}</td>
                    <td className="font-black">{fmt(s.receitaPrevista)}</td>
                    <td className="font-black">{fmt(s.custoTotal)}</td>
                    <td className="font-black">{fmt(s.lucroEstimado)}</td>
                    <td className="font-black">{s.margem.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="no-print text-xs text-slate-500">
        Observação: estes números são baseados em <b>pagamentos marcados como PAGO</b> e <b>despesas PAGO</b>. Para
        relatórios mais completos (por período, por festa, por categoria), posso expandir esta tela também.
      </div>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      <p className="text-xs font-black uppercase tracking-widest text-slate-500">{title}</p>
      <p className="mt-3 text-2xl font-black">{value}</p>
    </div>
  );
}
