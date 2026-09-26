import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma';
import * as readline from 'node:readline/promises';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('\n⚠️  NETTOYAGE DES DONNÉES ECM MANAGER\n');
  console.log('Ce script va SUPPRIMER DÉFINITIVEMENT :');
  console.log('  • Tous les clients');
  console.log('  • Tous les devis et leurs lignes');
  console.log('  • Tous les chantiers');
  console.log('  • Tous les paiements');
  console.log('  • Toutes les dépenses\n');
  console.log('Ce script VA CONSERVER :');
  console.log('  • Les utilisateurs (comptes de connexion)');
  console.log('  • Les catégories et produits du catalogue');
  console.log('  • Les paramètres (taux, infos entreprise)\n');

  const answer = await rl.question(
    'Tape "SUPPRIMER" pour confirmer, ou autre chose pour annuler : '
  );
  rl.close();

  if (answer.trim() !== 'SUPPRIMER') {
    console.log('\n❌ Opération annulée.\n');
    return;
  }

  console.log('\n🗑️  Suppression en cours...\n');

  // Ordre important : à cause des relations
  const payments = await prisma.payment.deleteMany();
  console.log(`  ✅ ${payments.count} paiement(s) supprimé(s)`);

  const expenses = await prisma.expense.deleteMany();
  console.log(`  ✅ ${expenses.count} dépense(s) supprimée(s)`);

  const projects = await prisma.project.deleteMany();
  console.log(`  ✅ ${projects.count} chantier(s) supprimé(s)`);

  const quoteItems = await prisma.quoteItem.deleteMany();
  console.log(`  ✅ ${quoteItems.count} ligne(s) de devis supprimée(s)`);

  const quotes = await prisma.quote.deleteMany();
  console.log(`  ✅ ${quotes.count} devis supprimé(s)`);

  const clients = await prisma.client.deleteMany();
  console.log(`  ✅ ${clients.count} client(s) supprimé(s)`);

  // Reset des compteurs (numérotation)
  const counters = await prisma.counter.deleteMany();
  console.log(`  ✅ ${counters.count} compteur(s) réinitialisé(s)`);

  console.log('\n🎉 Nettoyage terminé !\n');
  console.log('Base prête pour les utilisateurs finaux.\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Erreur :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });