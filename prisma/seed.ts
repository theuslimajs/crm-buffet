import { PrismaClient } from '@prisma/client'

// Na versão 5, isso funciona direto com o .env!
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Semeando banco (Versão Estável)...')
  
  // Limpa tudo
  await prisma.festa.deleteMany().catch(() => {})
  await prisma.cliente.deleteMany().catch(() => {})
  await prisma.pacote.deleteMany().catch(() => {})

  const cliente = await prisma.cliente.create({
    data: {
      nome: 'Matheus Henrique de Lima',
      telefone: '11999999999',
      email: 'matheus@estudante.com'
    }
  })

  console.log(`✅ SUCESSO! Cliente ${cliente.nome} criado com Prisma 5.`)
}

main()
  .finally(() => prisma.$disconnect())