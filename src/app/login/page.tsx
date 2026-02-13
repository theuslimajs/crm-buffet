import { login } from '../actions'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        
        {/* --- ÁREA DO LOGO --- */}
        <div className="text-center flex flex-col items-center">
          <div className="bg-slate-900 p-4 rounded-full border-4 border-emerald-900/30 shadow-2xl shadow-emerald-900/20 mb-6 w-40 h-40 flex items-center justify-center overflow-hidden">
            <img 
              src="/images/logo-gm.jpg" 
              alt="Logo GM Buffet" 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">
            Buffet<span className="text-emerald-500">Pro</span> GM
          </h1>
          <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-[0.3em]">Sistema Integrado de Gestão</p>
        </div>

        {/* --- FORMULÁRIO --- */}
        <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl">
          <form action={login} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest">E-mail</label>
              <input name="email" type="email" placeholder="admin@buffetgm.com" required className="w-full bg-slate-800 border-none p-4 pl-6 rounded-2xl text-white font-bold outline-emerald-500 focus:ring-2 focus:ring-emerald-900 transition" />
            </div>
            
             <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest">Senha</label>
              <input name="senha" type="password" placeholder="••••••••" required className="w-full bg-slate-800 border-none p-4 pl-6 rounded-2xl text-white font-bold outline-emerald-500 focus:ring-2 focus:ring-emerald-900 transition" />
            </div>

            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl uppercase text-xs tracking-[0.2em] transition shadow-lg shadow-emerald-900/50 mt-4">
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}