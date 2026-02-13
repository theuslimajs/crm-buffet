'use client'

import { useState, useRef, useEffect } from 'react'
import { enviarConviteWpp } from '../actions'
import { Ticket, Download, Send, RefreshCw, Type, Image as ImageIcon, Palette } from 'lucide-react'

export default function ConvitesPage() {
  // Lista de temas baseada na sua pasta (pelos nomes que vi no print)
  const temas = [
    { nome: 'Padrão', arquivo: '/images/convites/tema-padrao1.jpg' },
    { nome: 'Cinema', arquivo: '/images/convites/tema-cinema.jpg' },
    { nome: 'Futebol', arquivo: '/images/convites/tema-fut1.jpg' },
    { nome: 'Patrulha', arquivo: '/images/convites/tema-patrulha.jpg' },
    { nome: 'Princesas', arquivo: '/images/convites/tema-princesas.jpg' },
  ]

  // Estado inicial
  const [temaSelecionado, setTemaSelecionado] = useState(temas[0].arquivo)
  const [loading, setLoading] = useState(false)
  const [festaSelecionada, setFestaSelecionada] = useState({
    nomeAniversariante: '',
    dataFesta: '',
    horaInicio: '',
    local: 'Buffet GM'
  })
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // --- LÓGICA DE DESENHO NO CANVAS ---
  const desenharConvite = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 1. Definições (Tamanho Stories)
    const width = 1080
    const height = 1920 
    canvas.width = width
    canvas.height = height

    // 2. Carregar Imagem de Fundo Dinâmica
    const img = new Image()
    img.src = temaSelecionado // <--- AQUI A MUDANÇA: Usa o tema escolhido
    
    // Função para escrever os textos
    const renderizarTexto = () => {
      // Título (Nome)
      ctx.fillStyle = '#1e293b' // Ajuste a cor conforme o fundo se necessário
      // Sombra branca para garantir leitura em qualquer fundo
      ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
      ctx.shadowBlur = 15;
      
      ctx.font = 'bold 80px sans-serif'
      ctx.textAlign = 'center'
      
      const nome = festaSelecionada.nomeAniversariante || 'Nome do Aniversariante'
      ctx.fillText(nome, width / 2, 600)

      // Subtítulo
      ctx.font = 'italic 50px sans-serif'
      ctx.fillStyle = '#334155'
      ctx.fillText('Convida você para essa festa!', width / 2, 700)

      // Box de Destaque (Data)
      ctx.shadowBlur = 0; // Remove sombra para o box
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.beginPath()
      ctx.roundRect(width / 2 - 300, 850, 600, 280, 40)
      ctx.fill()
      
      // Borda do box
      ctx.strokeStyle = '#cbd5e1'
      ctx.lineWidth = 4
      ctx.stroke()

      // Texto da Data
      const dataTexto = festaSelecionada.dataFesta 
        ? new Date(festaSelecionada.dataFesta + 'T12:00:00').toLocaleDateString('pt-BR') 
        : '00/00/0000'
        
      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 90px sans-serif'
      ctx.fillText(dataTexto, width / 2, 980)

      const horaTexto = festaSelecionada.horaInicio || '--:--'
      ctx.font = '50px sans-serif'
      ctx.fillStyle = '#475569'
      ctx.fillText(`${horaTexto}h`, width / 2, 1060)

      // Local (Fixo no rodapé visual)
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)"; // Sombra escura para texto branco no fundo
      ctx.shadowBlur = 10;
      ctx.font = 'bold 60px sans-serif'
      ctx.fillStyle = '#ffffff'
      ctx.fillText('LOCAL: BUFFET GM', width / 2, 1400)
      
      // Gera a URL
      setPreviewUrl(canvas.toDataURL('image/png'))
    }

    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height)
      renderizarTexto()
    }

    img.onerror = () => {
      // Fallback cinza se a imagem falhar
      ctx.fillStyle = '#e2e8f0'
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '40px sans-serif'
      ctx.fillText('Imagem não encontrada:', width / 2, height / 2 - 50)
      ctx.fillText(temaSelecionado, width / 2, height / 2 + 50)
      renderizarTexto()
    }
  }

  // Redesenha sempre que mudar o tema ou os dados
  useEffect(() => {
    // Pequeno delay para garantir que o estado atualizou
    const timer = setTimeout(desenharConvite, 100)
    return () => clearTimeout(timer)
  }, [temaSelecionado, festaSelecionada])

  const handleDownload = () => {
    if (!previewUrl) return
    const link = document.createElement('a')
    link.download = `convite-${festaSelecionada.nomeAniversariante || 'festa'}.png`
    link.href = previewUrl
    link.click()
  }

  const handleEnviarWpp = async () => {
    if (!previewUrl) return
    setLoading(true)
    // Aqui usamos um ID fixo 'simulacao' pois estamos no modo manual, 
    // em produção usaria o ID real da festa
    const res = await enviarConviteWpp('simulacao-manual', previewUrl)
    setLoading(false)
    alert("Função de envio simulada (requer API configurada). Imagem gerada com sucesso!")
  }

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-black text-slate-800 uppercase italic flex items-center gap-3">
          <Ticket className="text-pink-500" size={32} /> Criador de Convites
        </h1>
        <p className="text-slate-500 font-medium">Personalize e envie convites temáticos.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: CONTROLES */}
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm h-fit space-y-6">
          
          {/* 1. Escolha do Tema */}
          <div>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Palette size={16} /> Escolha o Tema
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {temas.map((tema) => (
                <button
                  key={tema.arquivo}
                  onClick={() => setTemaSelecionado(tema.arquivo)}
                  className={`p-2 rounded-xl text-[10px] font-bold border-2 transition ${
                    temaSelecionado === tema.arquivo 
                      ? 'border-pink-500 bg-pink-50 text-pink-700' 
                      : 'border-slate-100 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {tema.nome}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Dados da Festa */}
          <div>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Type size={16} /> Dados do Convite
            </h2>
            <div className="space-y-3">
               <input 
                 placeholder="Nome do Aniversariante" 
                 className="w-full p-3 rounded-xl bg-slate-50 border-none font-bold text-sm"
                 value={festaSelecionada.nomeAniversariante}
                 onChange={(e) => setFestaSelecionada({...festaSelecionada, nomeAniversariante: e.target.value})}
               />
               <div className="flex gap-2">
                 <input 
                   type="date" 
                   className="w-full p-3 rounded-xl bg-slate-50 border-none font-bold text-sm text-slate-600"
                   onChange={(e) => setFestaSelecionada({...festaSelecionada, dataFesta: e.target.value})}
                 />
                 <input 
                   type="time" 
                   className="w-full p-3 rounded-xl bg-slate-50 border-none font-bold text-sm text-slate-600"
                   onChange={(e) => setFestaSelecionada({...festaSelecionada, horaInicio: e.target.value})}
                 />
               </div>
               
               <button 
                onClick={desenharConvite}
                className="w-full bg-slate-900 text-white font-black py-3 rounded-xl text-xs uppercase hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-lg"
               >
                 <RefreshCw size={14}/> Atualizar Preview
               </button>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: PREVIEW */}
        <div className="lg:col-span-2 flex flex-col items-center gap-6">
          <div className="relative shadow-2xl rounded-3xl overflow-hidden border-4 border-slate-900 bg-slate-800">
            {/* Canvas oculto, usamos a imagem gerada para exibir */}
            <canvas ref={canvasRef} className="hidden" />
            
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="max-h-[600px] w-auto object-contain" />
            ) : (
              <div className="h-[600px] w-[340px] flex flex-col items-center justify-center text-slate-500">
                <ImageIcon size={48} className="opacity-20 mb-2"/>
                <span className="text-xs font-bold opacity-50">Carregando tema...</span>
              </div>
            )}
          </div>

          {previewUrl && (
            <div className="flex gap-4">
              <button 
                onClick={handleDownload}
                className="bg-white text-slate-900 border border-slate-200 font-black px-6 py-4 rounded-2xl uppercase text-xs tracking-widest hover:bg-slate-50 transition shadow-sm flex items-center gap-2"
              >
                <Download size={18} /> Baixar
              </button>
              
              <button 
                onClick={handleEnviarWpp}
                disabled={loading}
                className="bg-emerald-500 text-white font-black px-6 py-4 rounded-2xl uppercase text-xs tracking-widest hover:bg-emerald-600 transition shadow-lg shadow-emerald-200 flex items-center gap-2 disabled:opacity-50"
              >
                <Send size={18} /> {loading ? 'Enviando...' : 'Enviar WhatsApp'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}