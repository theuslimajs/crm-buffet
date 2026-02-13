import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Criar o teu utilizador de Administrador
  const admin = await prisma.usuario.upsert({
    where: { email: 'matheus.manaira@hotmail.com' },
    update: {},
    create: {
      nome: 'Matheus Henrique de Lima',
      email: 'matheus.manaira@hotmail.com',
      senha: 'admin123', // Podes mudar esta senha depois
      cargo: 'DONO',
      podeVerLeads: true,
      podeVerCalendario: true,
      podeVerFestas: true,
      podeVerTarefas: true,
      podeVerEstoque: true,
      podeVerFinanceiro: true,
      podeVerRelatorios: true,
    },
  })

  console.log({ admin })
  console.log('Utilizador administrador criado com sucesso!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })