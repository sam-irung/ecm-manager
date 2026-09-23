import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Démarrage du seed ECM Manager...\n');

  // ============================================
  // 1. UTILISATEUR ADMINISTRATEUR
  // ============================================
  const hashedPassword = await bcrypt.hash('EcmAdmin2026!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'samirung65@gmail.com' },
    update: {},
    create: {
      name: 'Administrateur ECM',
      email: 'samirung65@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin créé : ${admin.email}`);

  // ============================================
  // 2. CATÉGORIES
  // ============================================
  const categoriesData = [
    { name: 'Construction', icon: 'Hammer', order: 1 },
    { name: 'Électricité', icon: 'Zap', order: 2 },
    { name: 'Plomberie', icon: 'Droplet', order: 3 },
    { name: 'Peinture', icon: 'Paintbrush', order: 4 },
    { name: 'Carrelage', icon: 'Grid3x3', order: 5 },
    { name: 'Plafond', icon: 'Layers', order: 6 },
    { name: 'Décoration murale', icon: 'Frame', order: 7 },
    { name: 'Conception de plans', icon: 'Ruler', order: 8 },
  ];

  const categories: Record<string, string> = {};

  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { name: cat.name },
      update: { icon: cat.icon, order: cat.order },
      create: cat,
    });
    categories[cat.name] = created.id;
  }
  console.log(`✅ ${categoriesData.length} catégories créées`);

  // ============================================
  // 3. PRODUITS / MATÉRIAUX
  // ============================================
  const productsData = [
    { name: 'Gyproc', category: 'Plafond', unit: 'pièce', priceFc: 28000 },
    { name: 'Vis Gyproc', category: 'Plafond', unit: 'boîte', priceFc: 9000 },
    { name: 'Bois 5/5', category: 'Plafond', unit: 'pièce', priceFc: 12000 },
    { name: 'Gypsum', category: 'Plafond', unit: 'sac', priceFc: 25000 },
    { name: 'Lumière cachée (LED)', category: 'Plafond', unit: 'mètre', priceFc: 8000 },
    { name: 'Spot LED', category: 'Électricité', unit: 'pièce', priceFc: 5500 },
    { name: 'Câble électrique 2.5mm', category: 'Électricité', unit: 'mètre', priceFc: 1500 },
    { name: 'Interrupteur', category: 'Électricité', unit: 'pièce', priceFc: 3500 },
    { name: 'Prise électrique', category: 'Électricité', unit: 'pièce', priceFc: 4000 },
    { name: 'Disjoncteur', category: 'Électricité', unit: 'pièce', priceFc: 15000 },
    { name: 'Tuyau PVC 100mm', category: 'Plomberie', unit: 'mètre', priceFc: 6500 },
    { name: 'Tuyau PVC 50mm', category: 'Plomberie', unit: 'mètre', priceFc: 3500 },
    { name: 'Coude PVC', category: 'Plomberie', unit: 'pièce', priceFc: 2500 },
    { name: 'Robinet', category: 'Plomberie', unit: 'pièce', priceFc: 18000 },
    { name: 'Colle PVC', category: 'Plomberie', unit: 'pot', priceFc: 12000 },
    { name: 'Peinture blanche 20L', category: 'Peinture', unit: 'bidon', priceFc: 85000 },
    { name: 'Peinture couleur 20L', category: 'Peinture', unit: 'bidon', priceFc: 95000 },
    { name: 'Enduit de lissage', category: 'Peinture', unit: 'sac', priceFc: 25000 },
    { name: 'Rouleau à peinture', category: 'Peinture', unit: 'pièce', priceFc: 8000 },
    { name: 'Pinceau', category: 'Peinture', unit: 'pièce', priceFc: 3500 },
    { name: 'Carrelage 60x60', category: 'Carrelage', unit: 'm²', priceFc: 25000 },
    { name: 'Carrelage 40x40', category: 'Carrelage', unit: 'm²', priceFc: 18000 },
    { name: 'Ciment colle', category: 'Carrelage', unit: 'sac', priceFc: 28000 },
    { name: 'Joint carrelage', category: 'Carrelage', unit: 'sac', priceFc: 15000 },
    { name: 'Tasseau décoratif', category: 'Décoration murale', unit: 'mètre', priceFc: 8000 },
    { name: 'Moulure décorative', category: 'Décoration murale', unit: 'mètre', priceFc: 12000 },
    { name: 'Papier peint', category: 'Décoration murale', unit: 'rouleau', priceFc: 45000 },
    { name: 'Panneau mural 3D', category: 'Décoration murale', unit: 'm²', priceFc: 35000 },
    { name: 'Ciment', category: 'Construction', unit: 'sac', priceFc: 30000 },
    { name: 'Sable', category: 'Construction', unit: 'm³', priceFc: 45000 },
    { name: 'Gravier', category: 'Construction', unit: 'm³', priceFc: 55000 },
    { name: 'Fer à béton 8mm', category: 'Construction', unit: 'barre', priceFc: 12000 },
    { name: 'Fer à béton 12mm', category: 'Construction', unit: 'barre', priceFc: 22000 },
    { name: 'Brique', category: 'Construction', unit: 'pièce', priceFc: 500 },
  ];

  let productCount = 0;
  for (const prod of productsData) {
    const categoryId = categories[prod.category];
    if (!categoryId) continue;

    const existing = await prisma.product.findFirst({
      where: { name: prod.name, categoryId },
    });

    await prisma.product.upsert({
      where: { id: existing?.id ?? 'new' },
      update: { unit: prod.unit, priceFc: prod.priceFc },
      create: {
        name: prod.name,
        unit: prod.unit,
        priceFc: prod.priceFc,
        categoryId,
        active: true,
      },
    });
    productCount++;
  }
  console.log(`✅ ${productCount} produits créés`);

  console.log('\n🎉 Seed terminé avec succès !\n');
  console.log('📧 Email admin : samirung65@gmail.com');
  console.log('🔑 Mot de passe : EcmAdmin2026!\n');
}

main()
  .catch((e) => {
    console.error('❌ Erreur pendant le seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });