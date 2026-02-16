export const dynamic = "force-dynamic";

// src/app/tarefas/page.tsx
import { prisma } from "@/lib/prisma";
import { createTarefa, deleteTarefa, toggleTarefaStatus } from "../actions";

export default async function TarefasPage() {
  const tarefas = await prisma.tarefa.findMany({ orderBy: { dataLimite: "asc" } });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black">Tarefas</h1>
        <p className="text-slate-500">Organize a operação e prazos</p>
      </header>

      {/* Nova tarefa */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h2 className="font-black mb-4">Nova Tarefa</h2>

        <form action={createTarefa} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input name="descricao" placeholder="Descrição" className="border border-slate-200 rounded-xl px-4 py-3" required />
          <input name="equipe" placeholder="Equipe" className="border border-slate-200 rounded-xl px-4 py-3" />
          <input name="dataLimite" type="date" className="border border-slate-200 rounded-xl px-4 py-3" required />
          <button className="bg-emerald-600 text-white font-black rounded-xl px-4 py-3 uppercase text-xs tracking-widest hover:bg-emerald-700 transition">
            Salvar
          </button>
        </form>
      </div>

      {/* Lista */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h2 className="font-black mb-4">Lista de Tarefas</h2>

        {tarefas.length === 0 ? (
          <p className="text-slate-500">Nenhuma tarefa cadastrada.</p>
        ) : (
          <div className="space-y-3">
            {tarefas.map((t) => (
              <div key={t.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="min-w-0">
                  <p className={`font-bold ${t.status === "CONCLUIDA" ? "line-through text-slate-400" : ""}`}>
                    {t.descricao}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t.equipe} • Até {new Date(t.dataLimite).toLocaleDateString("pt-BR")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <form action={toggleTarefaStatus}>
                    <input type="hidden" name="id" value={t.id} />
                    <button className="bg-slate-900 text-white font-black px-4 py-2 rounded-xl uppercase text-xs tracking-widest hover:bg-slate-800 transition">
                      {t.status === "PENDENTE" ? "Concluir" : "Reabrir"}
                    </button>
                  </form>

                  <form action={deleteTarefa}>
                    <input type="hidden" name="id" value={t.id} />
                    <button className="bg-red-600 text-white font-black px-4 py-2 rounded-xl uppercase text-xs tracking-widest hover:bg-red-700 transition">
                      Excluir
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
