import { useState, useEffect } from 'react';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import ProductModal from './components/ProductModal';
import BulkActions from './components/BulkActions';
import ImportCSVModal from './components/ImportCSVModal';
import LabelPrintModal from './components/LabelPrintModal';

// --- 1. IMPORTAR APIS Y TIPOS ---
import {
  Product,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  downloadProductTemplate,
  importProductsCSV,
  ProductCreatePayload,
  ProductUpdatePayload,
  ProductListResponse,
  getProductById // <-- ¡AÑADIDO!
} from '@/services/product.api'; // Usamos el alias @
import { Category, getCategories } from '@/services/category.api'; // <-- ¡AÑADIDO!

// --- 2. INTERFAZ INTERNA DEL FORMULARIO ---
// (Esta es la data que esperamos del modal)
interface ProductData {
  sku: string;
  name: string;
  categoryId: number; 
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

// Mapeo de Estatus
const statusApiMap: Record<string, string> = {
  'Todos': '',
  'Activo': 'ACTIVE',
  'Inactivo': 'INACTIVE',
};

// --- MODIFICADO: Estado para categorías reales ---
const initialCategoryMap: { [key: number]: string } = {};
const initialCategoryFilter = [{ id: 0, name: 'Todas' }];

export default function ProductsPage() {
  
  // --- 3. ACTUALIZAR ESTADOS ---
  const [products, setProducts] = useState<Product[]>([]); // Inicia vacío
  const [isLoading, setIsLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- Estados de Categoría Modificados ---
  const [categories, setCategories] = useState(initialCategoryFilter);
  const [categoryMap, setCategoryMap] = useState(initialCategoryMap);
  const [selectedCategoryId, setSelectedCategoryId] = useState(0); // <-- MODIFICADO
  
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [showLowStock, setShowLowStock] = useState(false);
  
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  // --- NUEVO: Cargar Categorías para el filtro ---
  useEffect(() => {
    getCategories()
      .then(data => {
        const categoryItems = Array.isArray(data) ? data : (data as any).items || [];
        const newMap: { [key: number]: string } = {};
        categoryItems.forEach((cat: Category) => { newMap[cat.id] = cat.name; });
        
        setCategories([...initialCategoryFilter, ...categoryItems]);
        setCategoryMap(newMap);
      })
      .catch(error => {
        showToast('Error al cargar filtros de categoría', 'error');
      });
  }, []); // Carga solo una vez

  // --- 4. FUNCIÓN PARA CARGAR PRODUCTOS (Modificada) ---
  const fetchProducts = () => {
    setIsLoading(true);

    const filters = {
      search: searchTerm || undefined,
      status: statusApiMap[selectedStatus] as 'ACTIVE' | 'INACTIVE' || undefined,
      categoryId: selectedCategoryId !== 0 ? selectedCategoryId : undefined, // <-- MODIFICADO
      stockLow: showLowStock || undefined,
      page: currentPage,
      pageSize: pageSize
    };

    getProducts(filters)
      .then((data: ProductListResponse) => {
        // Mapear datos de la API a la interfaz del frontend
        const frontendProducts = data.items.map(p => ({
          ...p,
          // El stock en la lista (GET /api/products) no viene por defecto.
          // El backend debería calcularlo o lo simulamos.
          // Tu backend NO lo incluye en la lista, así que lo simulamos.
          // La llamada a getProductById (al editar) SÍ traerá el stock real.
          stock: p.stock ?? 0, // Mantenemos la simulación
          lowStock: p.stock ? p.stock < 10 : false, // Mantenemos la simulación
          image: `https://readdy.ai/api/search-image?query=${encodeURIComponent(p.name)}&width=80&height=80&seq=${p.id}&orientation=squarish`
        }));
        setProducts(frontendProducts);
        setTotalProducts(data.total);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        showToast(`Error al cargar productos: ${error.message}`, 'error');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // --- 5. ACTUALIZAR USEEFFECTS (Modificado) ---
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchProducts();
      }
    }, 300); // Debounce

    return () => clearTimeout(timerId);
  }, [searchTerm, selectedCategoryId, selectedStatus, showLowStock]); // <-- MODIFICADO

  useEffect(() => {
    // Paginación
    fetchProducts();
  }, [currentPage]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        document.getElementById('product-search')?.focus();
      } else if (e.key === 'n' || e.key === 'N') {
        if (!e.ctrlKey && !e.altKey) {
          e.preventDefault();
          setEditingProduct(null);
          setShowProductModal(true);
        }
      } else if (e.key === 'Delete') {
        if (selectedProducts.length > 0) {
          handleBulkArchive();
        }
      } else if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        handleImport();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedProducts]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map(p => String(p.id)));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };

  // --- ¡FUNCIÓN handleEdit MODIFICADA! ---
  const handleEdit = async (product: Product) => { // 'product' aquí tiene 'stock: number' simulado
    setIsLoading(true);
    showToast('Cargando producto...', 'info');
    try {
      // 1. Llamamos al endpoint GET /api/products/{id}
      const detailedProduct = await getProductById(product.id); // 'detailedProduct.stock' es VariantStock[]
      
      // 2. Calculamos el stock total
      const totalStock = detailedProduct.stock.reduce((acc, s) => acc + s.qty, 0);

      // 3. Creamos un objeto que sea compatible con 'Product | null'
      //    (El 'Product' de la lista, que tiene 'stock: number')
      const productForState: Product = {
        ...detailedProduct, // Contiene todos los campos de API (id, name, category_id, etc.)
        // PERO, 'detailedProduct.stock' (array) es un problema.
        // Lo sobreescribimos.
        stock: totalStock, // ¡Sobreescribimos 'stock' para que sea 'number'!
        image: product.image, // Mantenemos la imagen de la lista
        lowStock: totalStock < 10, // (o una lógica más compleja si min_qty existe)
      };
      
      // 4. Abrimos el modal. El paso 11 (mapeo) se encargará
      //    de traducir 'productForState' a 'ProductData' para el modal.
      setEditingProduct(productForState);
      setShowProductModal(true);

    } catch (error: any) {
      showToast(`Error al cargar producto: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = (product: Product) => {
    const newProduct = {
      ...product,
      id: Date.now(), // ID temporal
      sku: product.sku + '-COPY',
      name: product.name + ' (Copia)'
    };
    // @ts-ignore
    setEditingProduct(newProduct); // Abrir modal con datos duplicados
    setShowProductModal(true);
  };

  // --- 6. CONECTAR ARCHIVAR (DELETE) ---
  const handleArchive = async (productId: number) => {
    if (!confirm('¿Estás seguro de que deseas archivar este producto?')) return;

    try {
      await deleteProduct(productId);
      showToast('Producto archivado exitosamente', 'success');
      fetchProducts(); // Recargar la lista
    } catch (error: any) {
      showToast(`Error al archivar: ${error.message}`, 'error');
    }
  };

  const handleBulkArchive = async () => {
    if (!confirm(`¿Estás seguro de que deseas archivar ${selectedProducts.length} productos?`)) return;

    try {
      for (const id of selectedProducts) {
        await deleteProduct(Number(id));
      }
      showToast(`${selectedProducts.length} productos archivados`, 'success');
      fetchProducts(); // Recargar
      setSelectedProducts([]);
    } catch (error: any) {
      showToast(`Error al archivar: ${error.message}`, 'error');
    }
  };

  const handleImport = () => {
    setShowImportModal(true);
  };

  // --- 7. CONECTAR IMPORTACIÓN (POST /api/products/import) ---
  const handleImportProducts = async (file: File) => {
    setIsLoading(true);
    try {
      const result = await importProductsCSV(file);
      let message = `Importación completada: ${result.successCount} creados.`;
      if (result.errorCount > 0) {
        message += ` ${result.errorCount} errores.`;
        console.error('Errores de importación:', result.errors);
      }
      showToast(message, result.errorCount > 0 ? 'info' : 'success');
      fetchProducts(); // Recargar lista
      setShowImportModal(false); // Cerrar al éxito
    } catch (error: any) {
      showToast(`Error al importar: ${error.message}`, 'error');
      // No cerramos el modal si hay error
    } finally {
      setIsLoading(false);
    }
  };
  
  // --- 8. CONECTAR DESCARGA (GET /api/products/template.csv) ---
  const handleDownloadTemplate = async () => {
    try {
      await downloadProductTemplate();
    } catch (error: any) {
      showToast(`Error al descargar plantilla: ${error.message}`, 'error');
    }
  };

  // --- 9. CONECTAR GUARDADO (POST/PUT) ---
  const handleSaveProduct = async (formData: ProductData) => {
    // Mapear del formulario (ProductData) al Payload de la API
    const payload: ProductCreatePayload | ProductUpdatePayload = {
      name: formData.name,
      sku: formData.sku,
      categoryId: formData.categoryId,
      subcategoryId: formData.subcategoryId || undefined,
      price: formData.price,
      cost: formData.cost,
      description: formData.description,
      vat_percent: formData.taxRate,
      status: formData.status,
    };

    try {
      if (editingProduct) {
        // --- ACTUALIZAR (PUT) ---
        await updateProduct(editingProduct.id, payload as ProductUpdatePayload);
        showToast('Producto actualizado exitosamente', 'success');
      } else {
        // --- CREAR (POST) ---
        // El backend crea el producto Y la variante default
        await createProduct(payload as ProductCreatePayload);
        showToast('Producto creado exitosamente', 'success');
      }
      setShowProductModal(false);
      setEditingProduct(null);
      fetchProducts(); // Recargar la lista
    } catch (error: any) {
      console.error('Error saving product:', error);
      showToast(`Error al guardar: ${error.message}`, 'error');
      // Lanzar error para que el modal sepa que falló
      throw error;
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePrintLabels = () => {
    if (selectedProducts.length === 0) {
      showToast('Selecciona al menos un producto para imprimir etiquetas', 'error');
      return;
    }
    setShowLabelModal(true);
  };

  const handleLabelPrint = (config: any) => {
    const selectedProductsData = products.filter(p => selectedProducts.includes(String(p.id)));
    console.log('Imprimiendo etiquetas:', { products: selectedProductsData, config });
    
    setTimeout(() => {
      setShowLabelModal(false);
      setSelectedProducts([]);
      showToast(`Se enviaron ${selectedProductsData.length * config.copies} etiquetas a la impresora`, 'success');
    }, 1500);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      INACTIVE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    };
    
    const labels = {
      ACTIVE: 'Activo',
      INACTIVE: 'Inactivo',
    };

    // @ts-ignore
    if (!styles[status]) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
          Archivado
        </span>
      );
    }
    // @ts-ignore
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // --- 10. JSX (AJUSTES MÍNIMOS) ---
  return (
    <>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Productos</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona tu catálogo de productos</p>
        </div>

        <Card className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Buscador */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-search-line text-gray-400"></i>
                </div>
                <input
                  id="product-search"
                  type="text"
                  placeholder="Buscar por SKU, nombre o código... (Tecla /)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-3">
              {/* --- FILTRO DE CATEGORÍA MODIFICADO --- */}
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white pr-8"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white pr-8"
              >
                {Object.keys(statusApiMap).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLowStock}
                  onChange={(e) => setShowLowStock(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-black dark:text-white whitespace-nowrap">Stock bajo</span>
              </label>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductModal(true);
                }}
              >
                <i className="ri-add-line mr-2"></i>
                Nuevo (N)
              </Button>
              <Button variant="outline" onClick={handleImport}>
                <i className="ri-upload-line mr-2"></i>
                Importar CSV
              </Button>
              <Button 
                variant="outline" 
                onClick={handlePrintLabels}
                disabled={selectedProducts.length === 0}
              >
                <i className="ri-printer-line mr-2"></i>
                Etiquetas
              </Button>
            </div>
          </div>
        </Card>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <BulkActions
            selectedCount={selectedProducts.length}
            onActivate={() => console.log('Activar productos')}
            onDeactivate={() => console.log('Desactivar productos')}
            onChangePrice={() => console.log('Cambiar precios')}
            onAssignCategory={() => console.log('Asignar categoría')}
            onArchive={handleBulkArchive}
            onClear={() => setSelectedProducts([])}
          />
        )}

        {/* Tabla de productos */}
        <Card padding="sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 w-12">
                    <input
                      type="checkbox"
                      checked={products.length > 0 && selectedProducts.length === products.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Imagen</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">SKU</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Nombre</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Categoría</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Precio</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Costo</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Stock</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Estado</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Margen %</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(String(product.id))}
                        onChange={(e) => handleSelectProduct(String(product.id), e.target.checked)}
                        className="rounded"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <i className="ri-image-line text-gray-400"></i>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-black dark:text-white">{product.sku}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-black dark:text-white font-medium">{product.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-600 dark:text-gray-400">{product.category_name}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-medium text-black dark:text-white">{formatPrice(product.price)}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-gray-600 dark:text-gray-400">{formatPrice(product.cost)}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-medium ${product.lowStock ? 'text-red-600 dark:text-red-400' : 'text-black dark:text-white'}`}>
                        {product.stock ?? 'N/A'}
                      </span>
                      {product.lowStock && (
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-1 mx-auto"></div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(product.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {product.cost > 0 ? (((product.price - product.cost) / product.cost) * 100).toFixed(1) : 0}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                          title="Editar (E)"
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          onClick={() => handleDuplicate(product)}
                          className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                          title="Duplicar"
                        >
                          <i className="ri-file-copy-line"></i>
                        </button>
                        <button
                          onClick={() => handleArchive(product.id)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                          title="Archivar (Del)"
                        >
                          <i className="ri-archive-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isLoading && (
            <div className="text-center py-8">
              <i className="ri-loader-4-line animate-spin text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
              <p className="text-gray-500 dark:text-gray-400">Cargando productos...</p>
            </div>
          )}

          {!isLoading && products.length === 0 && (
            <div className="text-center py-8">
              <i className="ri-box-3-line text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
              <p className="text-gray-500 dark:text-gray-400">No se encontraron productos</p>
            </div>
          )}
        </Card>

        {/* Atajos de teclado */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Atajos: <span className="font-mono">/ Buscar</span> • <span className="font-mono">N Nuevo</span> • 
            <span className="font-mono">E Editar</span> • <span className="font-mono">Del Archivar</span> • 
            <span className="font-mono">Ctrl+I Importar</span>
          </p>
        </div>
      </div>

      {/* Modal de producto */}
      {showProductModal && (
        <ProductModal
          // --- 11. MAPEAR DATOS AL MODAL (Esta lógica ahora usa el 'productForState' de handleEdit) ---
          product={editingProduct ? {
            ...editingProduct,
            categoryId: editingProduct.category_id,
            subcategoryId: editingProduct.subcategory_id,
            taxRate: editingProduct.vat_percent,
            status: editingProduct.status,
            stock: editingProduct.stock ?? 0, // 'stock' ahora es el número calculado
            margin: editingProduct.cost > 0 ? (((editingProduct.price - editingProduct.cost) / editingProduct.cost) * 100) : 0,
            barcode: (editingProduct as any).variants?.[0]?.barcode || '', // Opcional: tomar de variantes
          } : null}
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct} // <-- Conectado a la API
        />
      )}

      {/* Modal de importación CSV */}
      {showImportModal && (
        <ImportCSVModal
          onClose={() => setShowImportModal(false)}
          // @ts-ignore
          onImport={handleImportProducts} // <-- Conectado a la API
          onDownloadTemplate={handleDownloadTemplate} // <-- Conectado a la API
        />
      )}

      {/* Modal de impresión de etiquetas */}
      {showLabelModal && (
        <LabelPrintModal
          // @ts-ignore
          selectedProducts={products.filter(p => selectedProducts.includes(String(p.id)))}
          onClose={() => setShowLabelModal(false)}
          onPrint={handleLabelPrint}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-500 text-white' :
          toast.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <i className={`${
              toast.type === 'success' ? 'ri-check-line' :
              toast.type === 'error' ? 'ri-error-warning-line' :
              'ri-information-line'
            }`}></i>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </>
  );
}