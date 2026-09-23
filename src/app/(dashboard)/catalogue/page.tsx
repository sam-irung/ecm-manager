import { Package, Plus } from 'lucide-react';
import { getCategories } from './actions';
import { getAllSettings } from '@/lib/settings';
import CategoryBlock from './CategoryBlock';
import CategoryModal from './CategoryModal';
import ProductModal from './ProductModal';
import CatalogHeader from './CatalogHeader';

export const dynamic = 'force-dynamic';

export default async function CataloguePage() {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getAllSettings(),
  ]);

  const totalProducts = categories.reduce(
    (sum, c) => sum + c._count.products,
    0
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-ecm-blue flex items-center gap-3">
          <Package size={28} />
          Catalogue
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          {categories.length} catégorie{categories.length > 1 ? 's' : ''} ·{' '}
          {totalProducts} produit{totalProducts > 1 ? 's' : ''}
        </p>
      </div>

      {/* Actions */}
      <CatalogHeader />

      {/* Liste */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ecm-orange/10 mb-4">
            <Package size={28} className="text-ecm-orange" />
          </div>
          <h3 className="text-lg font-semibold text-ecm-blue mb-2">
            Aucune catégorie
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Commencez par créer une catégorie (Plafond, Électricité,
            Plomberie...). Ensuite, ajoutez-y des produits.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat, i) => (
            <CategoryBlock
              key={cat.id}
              category={cat}
              defaultOpen={i === 0}
            />
          ))}
        </div>
      )}

      {/* Modales */}
      <CategoryModal />
      <ProductModal
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        defaultUnit={settings.default_unit}
      />
    </div>
  );
}