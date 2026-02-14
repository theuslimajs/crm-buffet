"use client";

import { useState, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { createFesta } from "../../actions";
import { CalendarPlus, User, Calendar, DollarSign, Users, Package } from "lucide-react";

function FormularioNovaFesta() {
  const searchParams = useSearchParams();

  // Evita recalcular a cada render
  const nomeInicial = useMemo(() => searchParams.get("nomeCliente") || "", [searchParams]);

  const [nomeAniversariante, setNomeAniversariante] = useState(nomeInicial);
  const [dataFesta, setDataFesta] = useState("");
  const [qtdPessoas, setQtdPessoas] = useState("");
  const [valorTotal, setValorTotal] = useState("");

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-800 uppercase italic flex items-center gap-3">
          <CalendarPlus className="text-emerald-600" size={32} /> Agendar Nova Festa
        </h1>
        <p className="text-slate-500 font-medium">
          Preencha os dados abaixo. Se necessário, edite manualmente.
        </p>
      </header>

      <form
        action={createFesta}
        className="bg-white p-8 rounded-[2.5rem] border shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* CLIENTE ID */}
        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
            ID do Cliente (Do Banco de Dados)
          </label>
          <input
            name="clienteId"
            required
            placeholder="Cole o ID do cliente aqui..."
            className="w-full bg-slate-50 p-4 rounded-2xl border-none font-bold text-sm outline-emerald-500"
          />
          <p className="text-[9px] text-slate-400 ml-2">
            Dica: Futuramente podemos automatizar a criação do cliente aqui.
          </p>
        </div>

        {/* ANIVERSARIANTE */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Aniversariante</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <User size={16} />
            </div>
            <input
              name="nomeAniversariante"
              required
              value={nomeAniversariante}
              onChange={(e) => setNomeAniversariante(e.target.value)}
              className="w-full bg-slate-50 p-4 pl-12 rounded-2xl border-none font-bold text-sm outline-emerald-500"
            />
          </div>
        </div>

        {/* DATA/HORA */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Data e Hora</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Calendar size={16} />
            </div>
            <input
              name="dataFesta"
              type="datetime-local"
              required
              value={dataFesta}
              onChange={(e) => setDataFesta(e.target.value)}
              className="w-full bg-slate-50 p-4 pl-12 rounded-2xl border-none font-bold text-sm outline-emerald-500"
            />
          </div>
          <p className="text-[9px] text-slate-400 ml-2">
            Obs: na action, converta essa string para Date antes de salvar no Prisma.
          </p>
        </div>

        {/* QTD PESSOAS */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Qtd. Convidados</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Users size={16} />
            </div>
            <input
              name="qtdPessoas"
              type="number"
              required
              min={1}
              value={qtdPessoas}
              onChange={(e) => setQtdPessoas(e.target.value)}
              className="w-full bg-slate-50 p-4 pl-12 rounded-2xl border-none font-bold text-sm outline-emerald-500"
            />
          </div>
        </div>

        {/* VALOR */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Valor Contrato (R$)</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <DollarSign size={16} />
            </div>
            <input
              name="valorTotal"
              type="number"
              required
              min={0}
              step="0.01"
              value={valorTotal}
              onChange={(e) => setValorTotal(e.target.value)}
              className="w-full bg-slate-50 p-4 pl-12 rounded-2xl border-none font-bold text-sm outline-emerald-500"
            />
          </div>
        </div>

        {/* PACOTE ID */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-2">ID do Pacote</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Package size={16} />
            </div>
            <input
              name="pacoteId"
              required
              placeholder="Cole o ID do pacote..."
              className="w-full bg-slate-50 p-4 pl-12 rounded-2xl border-none font-bold text-sm outline-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="md:col-span-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 uppercase text-xs tracking-widest transition shadow-lg mt-4"
        >
          <CalendarPlus size={18} /> Confirmar Festa
        </button>
      </form>
    </div>
  );
}

export default function NovaFestaPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-black animate-pulse">Carregando formulário...</div>}>
      <FormularioNovaFesta />
    </Suspense>
  );
}
