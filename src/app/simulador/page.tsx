// src/app/simulador/page.tsx
import { prisma } from "@/lib/prisma";
import SimuladorClient from "./simulador-client";

export default async function SimuladorPage() {
  const festas = await prisma.festa.findMany({
    orderBy: { dataFesta: "desc" },
    take: 100,
    include: { cliente: true },
  });

  const options = festas.map((f) => ({
    id: f.id,
    label: `${f.nomeAniversariante} • ${f.cliente.nome} • ${new Date(f.dataFesta).toLocaleDateString("pt-BR")}`,
    valorTotal: f.valorTotal,
  }));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black">Simulador de Lucro</h1>
        <p className="text-slate-500">Monte um cenário e salve para comparar depois</p>
      </header>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <SimuladorClient festas={options} />
      </div>
    </div>
  );
}
