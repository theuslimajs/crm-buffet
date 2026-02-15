// src/app/convites/convite-sender.tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import { enviarConviteWpp } from "../actions";

type FestaOption = { id: string; label: string };

export default function ConviteSender({ festas }: { festas: FestaOption[] }) {
  const [festaId, setFestaId] = useState(festas[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [msg, setMsg] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const canSend = useMemo(() => !!festaId && !!preview, [festaId, preview]);

  function onPick(f: File | null) {
    setFile(f);
    setMsg("");
    setPreview("");

    if (!f) return;

    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result ?? ""));
    reader.readAsDataURL(f);
  }

  function send() {
    if (!canSend) return;

    setMsg("");
    startTransition(async () => {
      const res = await enviarConviteWpp(festaId, preview);
      if ((res as any)?.error) setMsg(`Erro: ${(res as any).error}`);
      else setMsg("Convite enviado com sucesso ✅");
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-black uppercase tracking-widest text-slate-600">Festa</label>
          <select
            value={festaId}
            onChange={(e) => setFestaId(e.target.value)}
            className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-3"
          >
            {festas.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-black uppercase tracking-widest text-slate-600">Imagem do convite</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onPick(e.target.files?.[0] ?? null)}
            className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-3 bg-white"
          />
          <p className="text-[11px] text-slate-500 mt-2">
            Formatos comuns: JPG/PNG. Tamanho recomendado até ~1–2MB para enviar rápido.
          </p>
        </div>
      </div>

      {preview ? (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Prévia</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Prévia do convite" className="max-h-[320px] rounded-xl border border-slate-200" />
          <p className="text-[11px] text-slate-500 mt-2">{file?.name}</p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={send}
        disabled={!canSend || isPending}
        className="bg-emerald-600 text-white font-black rounded-xl px-6 py-3 uppercase text-xs tracking-widest hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? "Enviando..." : "Enviar no WhatsApp"}
      </button>

      {msg ? (
        <div className="text-sm font-semibold p-3 rounded-xl border border-slate-200 bg-white">{msg}</div>
      ) : null}
    </div>
  );
}
