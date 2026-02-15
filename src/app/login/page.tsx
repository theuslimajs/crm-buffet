// src/app/login/page.tsx
"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "../actions";
import SubmitButton from "../submit-button";

export default function LoginPage() {
  const [state, action] = useActionState(login as any, null);
  const params = useSearchParams();
  const next = params.get("next") ?? "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Buffet GM</h1>
          <p className="text-slate-500 text-sm">Acesse o painel de gestão</p>
        </div>

        <form action={action} className="space-y-4">
          <input type="hidden" name="next" value={next} />

          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-600">Email</label>
            <input
              name="email"
              type="email"
              className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/40"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-600">Senha</label>
            <input
              name="senha"
              type="password"
              className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/40"
              placeholder="••••••••"
              required
            />
          </div>

          {state?.error ? (
            <div className="text-sm text-red-600 font-semibold bg-red-50 border border-red-100 rounded-xl p-3">
              {state.error}
            </div>
          ) : null}

          <SubmitButton className="w-full bg-emerald-600 text-white font-black px-5 py-3 rounded-xl uppercase text-xs tracking-widest hover:bg-emerald-700 transition">
            Entrar
          </SubmitButton>
        </form>

        <p className="text-[11px] text-slate-400 mt-6">
          Dica: depois você pode trocar a senha do administrador em Configurações.
        </p>
      </div>
    </div>
  );
}
