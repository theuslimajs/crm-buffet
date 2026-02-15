// src/app/simulador/simulador-client.tsx
"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { salvarSimulacao } from "../actions";

type FestaOption = { id: string; label: string; valorTotal: number };

type CustoItem = { nome: string; valor: string };

export default function SimuladorClient({ festas }: { festas: FestaOption[] }) {
  const [festaId, setFestaId] = useState<string>("");
  const [receita, setReceita] = useState<string>("");
  const [custos, setCustos] = useState<CustoItem[]>([
    { nome: "Alimentação", valor: "" },
    { nome: "Decoração", valor: "" },
  ]);

  const [msg, setMsg] = useState<string>("");
  const [pending, startTransition] = useTransition();

  const festaSelecionada = useMemo(() => festas.find((f) => f.id === festaId) ?? null, [festas, festaId]);

  useEffect(() => {
    // Ao escolher uma festa, sugere receita = valorTotal
    if (festaSelecionada) setReceita(String(festaSelecionada.valorTotal ?? ""));
  }, [festaSelecionada]);

  const custoTotal = useMemo(() => {
    return custos.reduce((acc, c) => acc + (parseFloat(c.valor) || 0), 0);
  }, [custos]);

  const receitaNum = parseFloat(receita) || 0;
  const lucro = receitaNum - custoTotal;
  const margem = receitaNum > 0 ? (lucro / receitaNum) * 100 : 0;

  function addCusto() {
    setCustos((prev) => [...prev, { nome: "", valor: "" }]);
  }

  function updateCusto(idx: number, key: keyof CustoItem, value: string) {
    setCustos((prev) => prev.map((c, i) => (i === idx ? { ...c, [key]: value } : c)));
  }

  function removeCusto(idx: number) {
    setCustos((prev) => prev.filter((_, i) => i !== idx));
  }

  function save() {
    setMsg("");

    startTransition(async () => {
      const fd = new FormData();
      fd.set("festaId", festaId);
      fd.set("receita", String(receitaNum));
      fd.set("custo", String(custoTotal));
      fd.set(
        "detalhes",
        JSON.stringify({
          festa: festaSelecionada?.label ?? null,
          receita: receitaNum,
          custos: custos.map((c) => ({ nome: c.nome, valor: parseFloat(c.valor) || 0 })),
          lucro,
          margem,
        })
      );

      await salvarSimulacao(fd);
      setMsg("Simulação salva ✅ (veja em Relatórios)");
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-black uppercase tracking-widest text-slate-600">Vincular a uma festa (opcional)</label>
          <select
            value={festaId}
            onChange={(e) => setFestaId(e.target.value)}
            className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-3"
          >
            <option value="">— Sem festa —</option>
            {festas.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-black uppercase tracking-widest text-slate-600">Receita prevista (R$)</label>
          <input
            value={receita}
            onChange={(e) => setReceita(e.target.value)}
            className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-3"
            placeholder="Ex.: 2500"
          />
          <p className="text-[11px] text-slate-500 mt-2">
            Dica: ao selecionar uma festa, preenche com o valor total cadastrado.
          </p>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black">Custos</h2>
          <button
            type="button"
            onClick={addCusto}
            className="bg-slate-900 text-white font-black px-4 py-2 rounded-xl uppercase text-xs tracking-widest hover:bg-slate-800 transition"
          >
            + adicionar
          </button>
        </div>

        <div className="space-y-2">
          {custos.map((c, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
              <input
                value={c.nome}
                onChange={(e) => updateCusto(idx, "nome", e.target.value)}
                placeholder="Item"
                className="md:col-span-4 border border-slate-200 rounded-xl px-4 py-3 bg-white"
              />
              <input
                value={c.valor}
                onChange={(e) => updateCusto(idx, "valor", e.target.value)}
                placeholder="Valor"
                className="md:col-span-1 border border-slate-200 rounded-xl px-4 py-3 bg-white"
              />
              <button
                type="button"
                onClick={() => removeCusto(idx)}
                className="md:col-span-1 bg-red-600 text-white font-black px-4 py-3 rounded-xl uppercase text-xs tracking-widest hover:bg-red-700 transition"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Kpi title="Custo total" value={custoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
        <Kpi title="Lucro estimado" value={lucro.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
        <Kpi title="Margem" value={`${margem.toFixed(1)}%`} />
      </div>

      <button
        type="button"
        onClick={save}
        disabled={pending}
        className="bg-emerald-600 text-white font-black rounded-xl px-6 py-3 uppercase text-xs tracking-widest hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? "Salvando..." : "Salvar simulação"}
      </button>

      {msg ? <div className="text-sm font-semibold p-3 rounded-xl border border-slate-200 bg-white">{msg}</div> : null}
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
