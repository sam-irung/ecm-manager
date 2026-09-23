import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as readline from 'node:readline/promises';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('\n👤 Création d\'un utilisateur ECM Manager\n');

  const name = await rl.question('Nom complet : ');
  const email = await rl.question('Email : ');
  const password = await rl.question('Mot de passe : ');

  rl.close();

  if (!name || !email || !password) {
    console.error('❌ Tous les champs sont obligatoires.');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('❌ Le mot de passe doit faire au moins 6 caractères.');
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.error('❌ Un utilisateur avec cet email existe déjà.');
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  console.log(`\n✅ Utilisateur créé : ${user.name} (${user.email})\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });