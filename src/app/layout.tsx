import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { 
  LayoutDashboard, Users, PartyPopper, DollarSign, 
  Package, CalendarCheck, Calculator, Settings, LogOut,
  ChevronRight, ClipboardList, Target, Truck
} from "lucide-react"; 
import { logout } from "./actions";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Buffet GM - Gestão",
  description: "Sistema de Gestão CRM/ERP para Buffet",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen flex`}>
        
        {/* SIDEBAR FIXA */}
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50">
          <div className="p-6 border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center font-black text-white italic">GM</div>
              <span className="font-bold text-white tracking-tight">BUFFET GM</span>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar text-slate-400">
             <MenuLink href="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
             <MenuLink href="/leads" icon={<Target size={18} />} label="Leads (CRM)" />
             <MenuLink href="/festas" icon={<PartyPopper size={18} />} label="Festas & Agenda" />
             <MenuLink href="/financeiro" icon={<DollarSign size={18} />} label="Financeiro" />
             <MenuLink href="/estoque" icon={<Package size={18} />} label="Estoque" />
             <MenuLink href="/tarefas" icon={<CalendarCheck size={18} />} label="Tarefas" />
             <MenuLink href="/simulador" icon={<Calculator size={18} />} label="Simulador" />
             <MenuLink href="/relatorios" icon={<ClipboardList size={18} />} label="Relatórios" />
             <MenuLink href="/configuracoes" icon={<Settings size={18} />} label="Configurações" />
          </nav>

          <div className="p-4 border-t border-slate-800">
            <form action={logout}>
              <button className="w-full flex items-center justify-center gap-2 text-red-400 p-3 rounded-xl font-bold text-xs hover:bg-red-500/10 transition-all">
                <LogOut size={16} /> SAIR DO SISTEMA
              </button>
            </form>
          </div>
        </aside>

        {/* CONTEÚDO (Sem modo escuro forçado) */}
        <main className="flex-1 ml-64 p-8 bg-slate-50 min-h-screen">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}

function MenuLink({ href, icon, label }: any) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-2.5 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
      {icon} <span className="font-semibold text-sm">{label}</span>
    </Link>
  )
}