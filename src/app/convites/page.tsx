// src/app/convites/page.tsx
import { prisma } from "@/lib/prisma";
import ConviteSender from "./convite-sender";

export default async function ConvitesPage() {
  const festas = await prisma.festa.findMany({
    orderBy: { dataFesta: "desc" },
    take: 100,
    include: { cliente: true },
  });

  const options = festas.map((f) => ({
    id: f.id,
    label: `${f.nomeAniversariante} • ${f.cliente.nome} • ${new Date(f.dataFesta).toLocaleDateString("pt-BR")}`,
  }));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black">Convites (WhatsApp)</h1>
        <p className="text-slate-500">Envie um convite em imagem para o cliente via Evolution API</p>
      </header>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h2 className="font-black mb-2">Enviar convite</h2>
        <p className="text-xs text-slate-500 mb-4">
          Pré-requisito: configurar <code className="font-mono">EVOLUTION_API_URL</code> e <code className="font-mono">EVOLUTION_API_KEY</code> no ambiente.
        </p>

        <ConviteSender festas={options} />
      </div>
    </div>
  );
}
