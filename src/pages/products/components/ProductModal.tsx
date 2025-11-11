import { useState, useEffect } from 'react';
import Button from '../../../components/base/Button';
// --- 1. IMPORTAR API DE CATEGORÍAS ---
// import { Category, getCategories, Subcategory } from '@/services/category.api'; // <-- DESACTIVADO POR AHORA

// --- INTERFAZ SIMULADA ---
interface Category {
  id: number;
  name: string;
  subcategories?: Subcategory[];
}
interface Subcategory {
  id: number;
  category_id: number;
  name: string;
}
// --- FIN INTERFAZ SIMULADA ---


// --- 2. ACTUALIZAR INTERFAZ ---
interface ProductData {
  sku: string;
  name: string;
  categoryId: number; 
  categoryName?: string; // <-- AÑADIMOS ESTO PARA EL MOCK
  subcategoryId?: number;
  price: number;
  cost: number;
  stock: number; 
  status: 'ACTIVE' | 'INACTIVE';
  margin: number;
  image?: string;
  description?: string;
  barcode?: string;
  supplier?: string;
  minStock?: number;
  maxStock?: number;
  location?: string;
  taxRate?: number;
}

interface ProductModalProps {
  product?: ProductData | null; 
  onClose: () => void;
  onSave: (product: ProductData) => Promise<void>; 
}

// ... (Variant y mockMovements no cambian)
interface Variant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: { [key: string]: string };
}
const mockMovements = [
  { date: '2024-01-15', type: 'Venta', quantity: -2, reference: 'V-0001', balance: 23 },
  { date: '2024-01-10', type: 'Compra', quantity: 10, reference: 'C-0045', balance: 25 },
];

// --- 3. AÑADIR MOCK DE CATEGORÍAS ---
const mockCategories: Category[] = [
  { id: 1, name: 'Camisas', subcategories: [] },
  { id: 2, name: 'Pantalones', subcategories: [] },
  { id: 3, name: 'Calzado', subcategories: [{id: 10, category_id: 3, name: "Zapatillas"}] },
  { id: 4, name: 'Buzos', subcategories: [] },
  { id: 5, name: 'Accesorios', subcategories: [] },
  { id: 6, name: 'Test', subcategories: [] },
  { id: 7, name: 'Ropa', subcategories: [] },
];


export default function ProductModal({ product, onClose, onSave }: ProductModalProps) {
  const [activeTab, setActiveTab] = useState('datos');
  
  const [formData, setFormData] = useState<ProductData>({
    sku: '',
    name: '',
    categoryId: 0, 
    subcategoryId: 0,
    price: 0,
    cost: 0,
    stock: 0,
    status: 'ACTIVE', 
    margin: 0,
    description: '',
    barcode: '',
    supplier: '',
    minStock: 0,
    maxStock: 100,
    location: '',
    taxRate: 21
  });
  
  const [variants, setVariants] = useState<Variant[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false); 

  // --- 4. USAR MOCK DE CATEGORÍAS ---
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false); // Ya no cargamos

  // --- 5. ELIMINAR USEEFFECT DE CARGA ---
  // useEffect(() => { ... getCategories() ... }, []); // <-- BORRADO

  useEffect(() => {
    if (product) {
      // Si estamos editando, mapeamos el category_name a categoryId
      const foundCategory = mockCategories.find(c => c.name === product.categoryName);
      setFormData({
        ...product,
        categoryId: product.categoryId || foundCategory?.id || 0,
      });
    } else {
      // Si es nuevo, asignamos la primera categoría por defecto
      if (categories.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: categories[0].id }));
      }
    }
  }, [product]);

  useEffect(() => {
    // Calcular margen automáticamente
    if (formData.price > 0 && formData.cost > 0) {
      const margin = ((formData.price - formData.cost) / (formData.cost || 1)) * 100;
      setFormData(prev => ({ ...prev, margin: Math.round(margin * 10) / 10 }));
    } else {
      setFormData(prev => ({ ...prev, margin: 0 }));
    }
  }, [formData.price, formData.cost]);

  const handleInputChange = (field: keyof ProductData, value: any) => {
    let finalValue = value;
    if (field === 'categoryId' || field === 'subcategoryId') {
      finalValue = Number(value) || 0;
    }
    if (['price', 'cost', 'stock', 'taxRate', 'minStock', 'maxStock'].includes(field)) {
      finalValue = parseFloat(value) || 0;
    }

    setFormData(prev => ({ ...prev, [field]: finalValue }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.sku.trim()) newErrors.sku = 'SKU es requerido';
    if (!formData.name.trim()) newErrors.name = 'Nombre es requerido';
    if (!formData.categoryId || formData.categoryId === 0) {
      newErrors.category = 'Categoría es requerida';
    }
    if (formData.price <= 0) newErrors.price = 'Precio debe ser mayor a 0';
    if (formData.cost < 0) newErrors.cost = 'Costo no puede ser negativo';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error en handleSave del modal", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addVariant = () => { /* ... */ };
  const removeVariant = (variantId: string) => { /* ... */ };
  const tabs = [
    { id: 'datos', label: 'Datos', icon: 'ri-file-text-line' },
    { id: 'variantes', label: 'Variantes', icon: 'ri-palette-line' },
    { id: 'stock', label: 'Stock', icon: 'ri-store-line' },
    { id: 'proveedor', label: 'Proveedor', icon: 'ri-truck-line' },
    { id: 'imagenes', label: 'Imágenes', icon: 'ri-image-line' }
  ];

  const getSubcategories = (): Subcategory[] => {
    if (!formData.categoryId) return [];
    const selectedCat = categories.find(c => c.id === formData.categoryId);
    return selectedCat?.subcategories || [];
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex h-[80vh]">
          {/* Panel principal */}
          <div className="flex-1 flex flex-col">
            {/* ... (Header y Tabs no cambian) ... */}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'datos' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ... (SKU, Barcode, Name) ... */}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      SKU *
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white ${
                        errors.sku ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Código único del producto"
                    />
                    {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Código de barras
                    </label>
                    <input
                      type="text"
                      value={formData.barcode || ''}
                      onChange={(e) => handleInputChange('barcode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                      placeholder="EAN13, UPC, etc."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Nombre del producto *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white ${
                        errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Nombre descriptivo del producto"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Categoría *
                    </label>
                    {/* --- 6. USAR EL MOCK DE CATEGORÍAS --- */}
                    <select
                      value={formData.categoryId || 0}
                      onChange={(e) => {
                        handleInputChange('categoryId', e.target.value);
                        handleInputChange('subcategoryId', 0); 
                      }}
                      disabled={isLoadingCategories}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white pr-8 ${
                        errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value={0} disabled>
                        {isLoadingCategories ? 'Cargando...' : 'Seleccionar categoría'}
                      </option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Subcategoría
                    </label>
                    <select
                      value={formData.subcategoryId || 0}
                      onChange={(e) => handleInputChange('subcategoryId', e.target.value)}
                      disabled={!formData.categoryId || getSubcategories().length === 0}
                      className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white pr-8 border-gray-300 dark:border-gray-600"
                    >
                      <option value={0}>Seleccionar subcategoría (Opcional)</option>
                      {getSubcategories().map((subcat) => (
                        <option key={subcat.id} value={subcat.id}>{subcat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* ... (IVA, Precio, Costo, Margen) ... */}
                   <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      IVA (%)
                    </label>
                    <select
                      value={formData.taxRate || 21}
                      onChange={(e) => handleInputChange('taxRate', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white pr-8"
                    >
                      <option value={0}>0% (Exento)</option>
                      <option value={10.5}>10.5% (Reducido)</option>
                      <option value={21}>21% (General)</option>
                      <option value={27}>27% (Incrementado)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Precio de venta *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                        className={`w-full pl-8 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white ${
                          errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Costo
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.cost}
                        onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                        className={`w-full pl-8 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white ${
                          errors.cost ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    {errors.cost && <p className="text-red-500 text-xs mt-1">{errors.cost}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Margen de ganancia
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.margin}
                        onChange={(e) => {
                          const margin = parseFloat(e.target.value) || 0;
                          const newPrice = (formData.cost || 0) * (1 + margin / 100);
                          handleInputChange('margin', margin);
                          handleInputChange('price', Math.round(newPrice * 100) / 100);
                        }}
                        className="w-full pr-8 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                        step="0.1"
                      />
                      <span className="absolute right-3 top-2 text-gray-500">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Estado
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white pr-8"
                    >
                      <option value="ACTIVE">Activo</option>
                      <option value="INACTIVE">Inactivo</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Descripción
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                      placeholder="Descripción detallada del producto"
                    />
                  </div>
                </div>
              )}
              {/* ... (Otras pestañas) ... */}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <div className="flex gap-3">
                  <Button variant="secondary" disabled={isSubmitting}>
                    Guardar y duplicar
                  </Button>
                  <Button variant="primary" onClick={handleSave} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <i className="ri-loader-4-line mr-2 animate-spin"></i>
                        Guardando...
                      </>
                    ) : (
                      product ? 'Actualizar producto' : 'Crear producto'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Panel lateral */}
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 overflow-y-auto">
             {/* ... (Contenido del panel lateral) ... */}
          </div>
        </div>
      </div>
    </div>
  );
}