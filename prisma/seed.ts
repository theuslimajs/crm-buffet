// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Admin padrão
  const adminEmail = "admin@buffetgm.com";
  await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      nome: "Administrador",
      email: adminEmail,
      senha: "admin123",
      cargo: "DONO",

      podeVerLeads: true,
      podeVerCalendario: true,
      podeVerFestas: true,
      podeVerTarefas: true,
      podeVerEstoque: true,
      podeVerFinanceiro: true,
      podeVerRelatorios: true,
    },
  });

  // Pacotes padrão
  const pacoteBasico = await prisma.pacote.upsert({
    where: { nome: "Básico" },
    update: { precoBase: 1999, descricao: "Pacote básico" },
    create: { nome: "Básico", precoBase: 1999, descricao: "Pacote básico" },
  });

  await prisma.pacote.upsert({
    where: { nome: "Premium" },
    update: { precoBase: 2999, descricao: "Pacote premium" },
    create: { nome: "Premium", precoBase: 2999, descricao: "Pacote premium" },
  });

  // Cliente demo
  const cliente = await prisma.cliente.upsert({
    where: { telefone: "11999999999" },
    update: {},
    create: {
      nome: "Cliente Demo",
      telefone: "11999999999",
      email: "cliente@demo.com",
    },
  });

  // Festa demo (somente se não existir festa demo)
  const exists = await prisma.festa.findFirst({ where: { nomeAniversariante: "Festa Demo" } });
  if (!exists) {
    const dataFesta = new Date();
    dataFesta.setDate(dataFesta.getDate() + 20);

    await prisma.festa.create({
      data: {
        nomeAniversariante: "Festa Demo",
        dataFesta,
        horaInicio: "19:00",
        horaFim: "23:00",
        valorTotal: 2500,
        qtdPessoas: 50,
        status: "AGENDADO",
        clienteId: cliente.id,
        pacoteId: pacoteBasico.id,
      },
    });
  }

  console.log("Seed concluído ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
