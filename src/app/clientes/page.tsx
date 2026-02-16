import { createCliente } from '../../actions'
import { User, Phone, Mail, Save, MapPin } from 'lucide-react'

export default function NovoClientePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-800 uppercase italic">Novo Cliente</h1>
        <p className="text-slate-500">Cadastro completo para CRM.</p>
      </header>

      <form action={createCliente} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
        <div className="space-y-4">
            <div>
                <label className="text-xs font-black uppercase text-slate-400 ml-2">Nome Completo</label>
                <div className="flex items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <User size={18} className="text-slate-400 mr-3" />
                    <input name="nome" required className="bg-transparent w-full outline-none font-bold text-slate-700" placeholder="Ex: Ana Clara" />
                </div>
            </div>
            <div>
                <label className="text-xs font-black uppercase text-slate-400 ml-2">WhatsApp</label>
                <div className="flex items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <Phone size={18} className="text-slate-400 mr-3" />
                    <input name="telefone" required className="bg-transparent w-full outline-none font-bold text-slate-700" placeholder="(11) 99999-9999" />
                </div>
            </div>
            <div>
                <label className="text-xs font-black uppercase text-slate-400 ml-2">Email</label>
                <div className="flex items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <Mail size={18} className="text-slate-400 mr-3" />
                    <input name="email" type="email" className="bg-transparent w-full outline-none font-bold text-slate-700" placeholder="ana@email.com" />
                </div>
            </div>
        </div>
        <button className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl uppercase tracking-widest hover:bg-slate-800 transition flex justify-center gap-2">
          <Save size={18} /> Salvar e Ir para Festa
        </button>
      </form>
    </div>
  )
}