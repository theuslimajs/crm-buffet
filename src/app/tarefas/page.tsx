import { prisma } from "@/lib/prisma";
import { createTarefa, deleteTarefa, toggleTarefaStatus } from "../actions";
import { ListTodo, Plus, Trash2, CheckCircle, Circle, Calendar, Users } from "lucide-react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function TarefasPage() {
  const tarefas = await prisma.tarefa.findMany({
    orderBy: [{ status: "asc" }, { dataLimite: "asc" }],
  });

  const pendentes = tarefas.filter((t) => t.status === "PENDENTE");
  const concluidas = tarefas.filter((t) => t.status === "CONCLUIDA");

  const formatDate = (d: any) => {
    if (!d) return "--/--/----";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "--/--/----";
    return dt.toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase italic flex items-center gap-3">
            <ListTodo className="text-orange-500" size={32} /> Central de Tarefas
          </h1>
          <p className="text-slate-500 font-medium">Organize o trabalho da equipe do Buffet.</p>
        </div>

        <div className="flex gap-3">
          <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-xl font-bold text-xs uppercase">
            {pendentes.length} Pendentes
          </div>
          <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl font-bold text-xs uppercase">
            {concluidas.length} Feitas
          </div>
        </div>
      </header>

      {/* FORM NOVA TAREFA */}
      <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Adicionar Tarefa</h2>

        <form action={createTarefa} className="flex flex-col md:flex-row gap-3 items-end">
          <div className="w-full space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
              O que precisa ser feito?
            </label>
            <input
              name="descricao"
              placeholder="Ex: Comprar bebidas para festa do João"
              required
              className="w-full bg-slate-50 p-3 rounded-xl border-none font-bold text-sm text-slate-700"
            />
          </div>

          <div className="w-full md:w-48 space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Quem?</label>
            <select
              name="equipe"
              defaultValue="Geral"
              className="w-full bg-slate-50 p-3 rounded-xl border-none font-bold text-sm text-slate-600"
            >
              <option>Geral</option>
              <option>Cozinha</option>
              <option>Garçons</option>
              <option>Limpeza</option>
              <option>Administrativo</option>
            </select>
          </div>

          <div className="w-full md:w-40 space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Prazo</label>
            <input
              name="dataLimite"
              type="date"
              required
              className="w-full bg-slate-50 p-3 rounded-xl border-none font-bold text-sm text-slate-500"
            />
          </div>

          <button
            type="submit"
            className="bg-slate-900 text-white font-black px-6 py-3 rounded-xl uppercase text-xs tracking-widest hover:bg-slate-800 transition shadow-lg flex gap-2 items-center justify-center w-full md:w-auto"
          >
            <Plus size={16} /> Criar
          </button>
        </form>
      </div>

      {/* LISTAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* A FAZER */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-orange-500 uppercase tracking-widest flex items-center gap-2 mb-4">
            <Circle size={12} className="fill-orange-500" /> A Fazer
          </h3>

          {pendentes.length === 0 && (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-sm">Tudo limpo por aqui! 😎</p>
            </div>
          )}

          {pendentes.map((tarefa) => (
            <div
              key={tarefa.id}
              className="bg-white p-4 rounded-2xl border border-slate-100 hover:shadow-md transition flex items-center justify-between group"
            >
              <div className="flex items-start gap-3">
                <form action={toggleTarefaStatus}>
                  <input type="hidden" name="id" value={tarefa.id} />
                  <button type="submit" className="mt-1 text-slate-300 hover:text-emerald-500 transition">
                    <Circle size={20} />
                  </button>
                </form>

                <div>
                  <p className="font-bold text-slate-700">{tarefa.descricao}</p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-[10px] font-bold bg-orange-50 text-orange-500 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                      <Users size={10} /> {tarefa.equipe}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Calendar size={10} /> {formatDate(tarefa.dataLimite)}
                    </span>
                  </div>
                </div>
              </div>

              <form action={deleteTarefa}>
                <input type="hidden" name="id" value={tarefa.id} />
                <button type="submit" className="text-slate-200 hover:text-red-400 transition p-2">
                  <Trash2 size={16} />
                </button>
              </form>
            </div>
          ))}
        </div>

        {/* CONCLUÍDAS */}
        <div className="space-y-4 opacity-70 hover:opacity-100 transition duration-500">
          <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 mb-4">
            <CheckCircle size={12} className="text-emerald-600" /> Concluídas
          </h3>

          {concluidas.length === 0 && (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-sm">Nenhuma tarefa concluída ainda.</p>
            </div>
          )}

          {concluidas.map((tarefa) => (
            <div
              key={tarefa.id}
              className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <form action={toggleTarefaStatus}>
                  <input type="hidden" name="id" value={tarefa.id} />
                  <button type="submit" className="text-emerald-500">
                    <CheckCircle size={20} />
                  </button>
                </form>

                <p className="font-bold text-slate-400 line-through text-sm">{tarefa.descricao}</p>
              </div>

              <form action={deleteTarefa}>
                <input type="hidden" name="id" value={tarefa.id} />
                <button type="submit" className="text-slate-200 hover:text-red-400 transition p-2">
                  <Trash2 size={14} />
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
