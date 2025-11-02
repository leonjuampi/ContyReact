
import { useState, useEffect } from 'react';
import Button from '../../../components/base/Button';

interface ProductData {
  sku: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  status: 'active' | 'inactive' | 'archived';
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
  onSave: (product: ProductData) => void;
}

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
  { date: '2024-01-05', type: 'Ajuste', quantity: -1, reference: 'AJ-001', balance: 15 },
  { date: '2024-01-01', type: 'Stock inicial', quantity: 16, reference: 'INI-001', balance: 16 }
];

export default function ProductModal({ product, onClose, onSave }: ProductModalProps) {
  const [activeTab, setActiveTab] = useState('datos');
  const [formData, setFormData] = useState<ProductData>({
    sku: '',
    name: '',
    category: '',
    price: 0,
    cost: 0,
    stock: 0,
    status: 'active',
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

  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  useEffect(() => {
    // Calcular margen automáticamente
    if (formData.price > 0 && formData.cost > 0) {
      const margin = ((formData.price - formData.cost) / formData.cost) * 100;
      setFormData(prev => ({ ...prev, margin: Math.round(margin * 10) / 10 }));
    }
  }, [formData.price, formData.cost]);

  const handleInputChange = (field: keyof ProductData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.sku.trim()) newErrors.sku = 'SKU es requerido';
    if (!formData.name.trim()) newErrors.name = 'Nombre es requerido';
    if (!formData.category.trim()) newErrors.category = 'Categoría es requerida';
    if (formData.price <= 0) newErrors.price = 'Precio debe ser mayor a 0';
    if (formData.cost < 0) newErrors.cost = 'Costo no puede ser negativo';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const addVariant = () => {
    const newVariant: Variant = {
      id: Date.now().toString(),
      name: 'Nueva variante',
      sku: formData.sku + '-V' + (variants.length + 1),
      price: formData.price,
      stock: 0,
      attributes: {}
    };
    setVariants([...variants, newVariant]);
  };

  const removeVariant = (variantId: string) => {
    setVariants(variants.filter(v => v.id !== variantId));
  };

  const tabs = [
    { id: 'datos', label: 'Datos', icon: 'ri-file-text-line' },
    { id: 'variantes', label: 'Variantes', icon: 'ri-palette-line' },
    { id: 'stock', label: 'Stock', icon: 'ri-store-line' },
    { id: 'proveedor', label: 'Proveedor', icon: 'ri-truck-line' },
    { id: 'imagenes', label: 'Imágenes', icon: 'ri-image-line' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex h-[80vh]">
          {/* Panel principal */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-black dark:text-white">
                  {product ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {product ? `Editando: ${product.name}` : 'Crear un nuevo producto en el catálogo'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex px-6">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                      activeTab === tab.id
                        ? 'border-black dark:border-white text-black dark:text-white'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    <i className={tab.icon}></i>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'datos' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white pr-8 ${
                        errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="">Seleccionar categoría</option>
                      <option value="Camisas">Camisas</option>
                      <option value="Pantalones">Pantalones</option>
                      <option value="Calzado">Calzado</option>
                      <option value="Buzos">Buzos</option>
                      <option value="Accesorios">Accesorios</option>
                    </select>
                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                  </div>

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
                          const newPrice = formData.cost * (1 + margin / 100);
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
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                      <option value="archived">Archivado</option>
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

              {activeTab === 'variantes' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-medium text-black dark:text-white">Variantes del producto</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Gestiona talles, colores y otras variaciones</p>
                    </div>
                    <Button onClick={addVariant}>
                      <i className="ri-add-line mr-2"></i>
                      Agregar variante
                    </Button>
                  </div>

                  {variants.length === 0 ? (
                    <div className="text-center py-8">
                      <i className="ri-palette-line text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
                      <p className="text-gray-500 dark:text-gray-400">No hay variantes configuradas</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        Las variantes te permiten manejar diferentes versiones del mismo producto
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {variants.map((variant) => (
                        <div key={variant.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-black dark:text-white">{variant.name}</h4>
                            <button
                              onClick={() => removeVariant(variant.id)}
                              className="text-red-600 hover:text-red-700 cursor-pointer"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">SKU</label>
                              <input
                                type="text"
                                value={variant.sku}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-black dark:text-white text-sm"
                                readOnly
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Precio</label>
                              <input
                                type="number"
                                value={variant.price}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-black dark:text-white text-sm"
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Stock</label>
                              <input
                                type="number"
                                value={variant.stock}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-black dark:text-white text-sm"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Atributos</label>
                              <input
                                type="text"
                                placeholder="Ej: Talle L, Color Azul"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-black dark:text-white text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'stock' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Stock actual
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Ubicación en depósito
                    </label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                      placeholder="Ej: Estante A-3, Pasillo 2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Stock mínimo
                    </label>
                    <input
                      type="number"
                      value={formData.minStock || 0}
                      onChange={(e) => handleInputChange('minStock', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                      min="0"
                      placeholder="Alerta cuando el stock sea menor"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Stock máximo
                    </label>
                    <input
                      type="number"
                      value={formData.maxStock || 100}
                      onChange={(e) => handleInputChange('maxStock', parseInt(e.target.value) || 100)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                      min="0"
                      placeholder="Máximo stock recomendado"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'proveedor' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Proveedor principal
                    </label>
                    <select
                      value={formData.supplier || ''}
                      onChange={(e) => handleInputChange('supplier', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white pr-8"
                    >
                      <option value="">Seleccionar proveedor</option>
                      <option value="proveedor1">Textiles Del Norte SA</option>
                      <option value="proveedor2">Confecciones Premium SRL</option>
                      <option value="proveedor3">Moda Integral LTDA</option>
                      <option value="proveedor4">Distribuidora Fashion</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Código del proveedor
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                      placeholder="Código interno del proveedor"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Precio de compra
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Tiempo de entrega (días)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                      min="0"
                      placeholder="Días hábiles"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'imagenes' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-black dark:text-white mb-2">Imágenes del producto</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Sube imágenes para mostrar el producto</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {/* Imagen principal */}
                    <div className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className="text-center">
                        <i className="ri-image-add-line text-2xl text-gray-400 mb-2"></i>
                        <p className="text-xs text-gray-500">Imagen principal</p>
                      </div>
                    </div>

                    {/* Imágenes adicionales */}
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <div className="text-center">
                          <i className="ri-add-line text-xl text-gray-400 mb-1"></i>
                          <p className="text-xs text-gray-500">Agregar</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-black dark:text-white mb-2">Recomendaciones</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Usa imágenes de alta calidad (mínimo 800x800px)</li>
                      <li>• Formato JPG o PNG, máximo 5MB por imagen</li>
                      <li>• Fondo blanco o transparente recomendado</li>
                      <li>• Muestra el producto desde diferentes ángulos</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <div className="flex gap-3">
                  <Button variant="secondary">
                    Guardar y duplicar
                  </Button>
                  <Button variant="primary" onClick={handleSave}>
                    {product ? 'Actualizar producto' : 'Crear producto'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Panel lateral */}
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="p-6">
              <h3 className="font-medium text-black dark:text-white mb-4">Vista previa</h3>
              
              {/* Vista previa del producto */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                  <i className="ri-image-line text-2xl text-gray-400"></i>
                </div>
                <h4 className="font-medium text-black dark:text-white text-sm">
                  {formData.name || 'Nombre del producto'}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  SKU: {formData.sku || 'Sin asignar'}
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-black dark:text-white">
                    ${formData.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-green-600 dark:text-green-400">
                    +{formData.margin.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Historial de movimientos */}
              {product && (
                <div>
                  <h3 className="font-medium text-black dark:text-white mb-4">Historial de movimientos</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {mockMovements.map((movement, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium text-black dark:text-white">
                            {movement.type}
                          </span>
                          <span className={`text-sm font-medium ${
                            movement.quantity > 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                          <span>{movement.reference}</span>
                          <span>Stock: {movement.balance}</span>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {movement.date}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
