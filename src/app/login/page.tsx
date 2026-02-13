'use client' // Importante: hooks só funcionam em Client Components

import { useActionState } from 'react'
import { login } from './actions'

export default function LoginPage() {
  // O useActionState gere o estado do formulário (erros, carregamento, etc.)
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl">
          {/* Agora usamos formAction em vez de login diretamente */}
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest">E-mail</label>
              <input 
                name="email" 
                type="email" 
                placeholder="matheus.manaira@hotmail.com" 
                required 
                className="w-full bg-slate-800 border-none p-4 pl-6 rounded-2xl text-white font-bold outline-emerald-500 focus:ring-2 focus:ring-emerald-900 transition" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest">Palavra-passe</label>
              <input 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                className="w-full bg-slate-800 border-none p-4 pl-6 rounded-2xl text-white font-bold outline-emerald-500 focus:ring-2 focus:ring-emerald-900 transition" 
              />
            </div>

            {/* Exibe o erro se as credenciais estiverem erradas */}
            {state?.error && (
              <p className="text-red-400 text-xs font-bold text-center bg-red-950/30 p-3 rounded-xl border border-red-900/50">
                {state.error}
              </p>
            )}

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-slate-950 font-black p-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              {isPending ? 'A ENTRAR...' : 'ACEDER AO SISTEMA'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}