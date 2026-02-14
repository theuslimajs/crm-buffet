import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.usuario.upsert({
    where: { email: 'matheus.manaira@hotmail.com' },
    update: {
      // se quiser atualizar permissões caso já exista, descomente:
      // podeVerLeads: true,
      // podeVerCalendario: true,
      // podeVerFestas: true,
      // podeVerTarefas: true,
      // podeVerEstoque: true,
      // podeVerFinanceiro: true,
      // podeVerRelatorios: true,
    },
    create: {
      nome: 'Matheus Henrique de Lima',
      email: 'matheus.manaira@hotmail.com',
      senha: 'admin123',
      cargo: 'DONO', // se cargo for enum e der erro TS, use CargoUsuario.DONO
      podeVerLeads: true,
      podeVerCalendario: true,
      podeVerFestas: true,
      podeVerTarefas: true,
      podeVerEstoque: true,
      podeVerFinanceiro: true,
      podeVerRelatorios: true,
    },
  })

  console.log('✅ Admin pronto:', admin.email)
}

main()
  .catch((e) => {
    console.error('❌ Seed falhou:', e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
