'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton() {
  // O hook useFormStatus nos diz se o formulário pai está "pendente" (enviando)
  const { pending } = useFormStatus()

  return (
    <button 
      type="submit" 
      disabled={pending} // Desabilita o botão para evitar cliques duplos
      className={`
        font-bold py-2 px-4 rounded transition w-full sm:w-auto
        ${pending 
          ? 'bg-gray-400 cursor-not-allowed' // Estilo quando está carregando
          : 'bg-blue-600 hover:bg-blue-700 text-white'} // Estilo normal
      `}
    >
      {/* Texto muda dinamicamente */}
      {pending ? 'Salvando...' : 'Cadastrar Cliente'}
    </button>
  )
}