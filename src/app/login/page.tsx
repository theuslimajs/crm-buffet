"use client";

import { useActionState } from "react";
import { login } from "../actions";

type LoginState = {
  error?: string;
};

const initialState: LoginState = {};

export default function LoginPage() {
  // login (server action) idealmente deve ter assinatura: (prevState, formData) => newState
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(login, initialState);

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-white tracking-tighter">BUFFET GM</h1>
          <p className="text-slate-500 font-medium">Aceda ao seu painel de gestão</p>
        </div>

        <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl">
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest">
                E-mail
              </label>
              <input
                name="email"
                type="email"
                placeholder="matheus.manaira@hotmail.com"
                required
                autoComplete="email"
                className="w-full bg-slate-800 border-none p-4 pl-6 rounded-2xl text-white font-bold outline-emerald-500 focus:ring-2 focus:ring-emerald-900 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest">
                Palavra-passe
              </label>
              <input
                name="senha"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full bg-slate-800 border-none p-4 pl-6 rounded-2xl text-white font-bold outline-emerald-500 focus:ring-2 focus:ring-emerald-900 transition"
              />
            </div>

            {state?.error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl">
                <p className="text-red-500 text-xs font-bold text-center">{state.error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-slate-950 font-black p-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              {isPending ? "A ENTRAR..." : "ACEDER AO SISTEMA"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
