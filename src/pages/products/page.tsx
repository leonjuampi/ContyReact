// 1. Imports eliminados: Sidebar, TopBar
import { useState, useEffect } from 'react';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import ProductModal from './components/ProductModal';
import BulkActions from './components/BulkActions';
import ImportCSVModal from './components/ImportCSVModal';
import LabelPrintModal from './components/LabelPrintModal';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  status: 'active' | 'inactive' | 'archived';
  margin: number;
  image?: string;
  lowStock: boolean;
}

const mockProducts: Product[] = [
  // ... (tus datos mock no cambian)
  {
    id: '1',
    sku: 'CAM001',
    name: 'Camisa Manga Larga Blanca',
    category: 'Camisas',
    price: 5500,
    cost: 3200,
    stock: 25,
    status: 'active',
    margin: 71.9,
    image: 'https://readdy.ai/api/search-image?query=elegant%20white%20long%20sleeve%20dress%20shirt%20on%20clean%20white%20background%2C%20professional%20product%20photography%2C%20minimalist%20style%2C%20high%20quality%20commercial%20photo%2C%20centered%20composition%2C%20soft%20lighting&width=80&height=80&seq=prod1&orientation=squarish',
    lowStock: false
  },
  {
    id: '2',
    sku: 'PAN002',
    name: 'Pantalón Jean Azul Classic',
    category: 'Pantalones',
    price: 8900,
    cost: 4800,
    stock: 8,
    status: 'active',
    margin: 85.4,
    image: 'https://readdy.ai/api/search-image?query=classic%20blue%20denim%20jeans%20pants%20on%20white%20background%2C%20product%20photography%2C%20minimalist%20commercial%20style%2C%20high%20quality%20image%2C%20centered%20composition%2C%20professional%20lighting&width=80&height=80&seq=prod2&orientation=squarish',
    lowStock: true
  },
  {
    id: '3',
    sku: 'ZAP003',
    name: 'Zapatillas Deportivas Negras',
    category: 'Calzado',
    price: 12400,
    cost: 7200,
    stock: 15,
    status: 'active',
    margin: 72.2,
    image: 'https://readdy.ai/api/search-image?query=black%20sports%20sneakers%20on%20white%20background%2C%20product%20photography%2C%20minimalist%20commercial%20style%2C%20high%20quality%20image%2C%20centered%20composition%2C%20professional%20lighting%20for%20ecommerce&width=80&height=80&seq=prod3&orientation=squarish',
    lowStock: false
  },
  {
    id: '4',
    sku: 'BUZ004',
    name: 'Buzo Canguro Gris',
    category: 'Buzos',
    price: 7200,
    cost: 4100,
    stock: 2,
    status: 'active',
    margin: 75.6,
    image: 'https://readdy.ai/api/search-image?query=gray%20hooded%20sweatshirt%20kangaroo%20pocket%20on%20white%20background%2C%20product%20photography%2C%20minimalist%20commercial%20style%2C%20high%20quality%20image%2C%20centered%20composition%2C%20professional%20lighting&width=80&height=80&seq=prod4&orientation=squarish',
    lowStock: true
  },
  {
    id: '5',
    sku: 'ACC005',
    name: 'Cinturón Cuero Marrón',
    category: 'Accesorios',
    price: 3800,
    cost: 2200,
    stock: 18,
    status: 'inactive',
    margin: 72.7,
    image: 'https://readdy.ai/api/search-image?query=brown%20leather%20belt%20on%20white%20background%2C%20product%20photography%2C%20minimalist%20commercial%20style%2C%20high%20quality%20image%2C%20centered%20composition%2C%20professional%20lighting%20for%20ecommerce%20catalog&width=80&height=80&seq=prod5&orientation=squarish',
    lowStock: false
  }
];

const categories = ['Todas', 'Camisas', 'Pantalones', 'Calzado', 'Buzos', 'Accesorios'];
const statusOptions = ['Todos', 'Activo', 'Inactivo', 'Archivado'];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [showLowStock, setShowLowStock] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  // const [showBulkActions, setShowBulkActions] = useState(false); // Esta variable no se usa, la comentamos
  const [showImportModal, setShowImportModal] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'Todas') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (selectedStatus !== 'Todos') {
      const statusMap = { 'Activo': 'active', 'Inactivo': 'inactive', 'Archivado': 'archived' };
      filtered = filtered.filter(product => product.status === statusMap[selectedStatus as keyof typeof statusMap]);
    }

    if (showLowStock) {
      filtered = filtered.filter(product => product.lowStock);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, selectedStatus, showLowStock]);

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
      setSelectedProducts(filteredProducts.map(p => p.id));
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

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleDuplicate = (product: Product) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      sku: product.sku + '-COPY',
      name: product.name + ' (Copia)'
    };
    setProducts([...products, newProduct]);
  };

  const handleArchive = (productId: string) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, status: 'archived' as const } : p
    ));
  };

  const handleBulkArchive = () => {
    setProducts(products.map(p => 
      selectedProducts.includes(p.id) ? { ...p, status: 'archived' as const } : p // Corregido: 'archive' a 'archived'
    ));
    setSelectedProducts([]);
  };

  const handleImport = () => {
    setShowImportModal(true);
  };

  const handleImportProducts = (importedProducts: Product[]) => {
    // Aquí deberías castear 'any[]' a 'Product[]' o asegurar que onImport devuelva 'Product[]'
    const newProducts = importedProducts.map(p => ({
      ...p,
      id: p.id || Date.now().toString(),
      lowStock: p.stock <= (p.minStock || 10)
    })) as Product[];
    setProducts([...products, ...newProducts]);
    setShowImportModal(false);
    showToast(`Se importaron ${importedProducts.length} productos exitosamente`, 'success');
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
    const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));
    console.log('Imprimiendo etiquetas:', { products: selectedProductsData, config });
    
    // Simular impresión
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
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      inactive: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      archived: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
    };
    
    const labels = {
      active: 'Activo',
      inactive: 'Inactivo',
      archived: 'Archivado'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  // 3. JSX modificado: Eliminamos wrappers, Sidebar y TopBar.
  //    Usamos un Fragment (<>) para devolver el contenido y los modales.
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
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white pr-8"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white pr-8"
              >
                {statusOptions.map(status => (
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
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
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
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
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
                      <span className="text-gray-600 dark:text-gray-400">{product.category}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-medium text-black dark:text-white">{formatPrice(product.price)}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-gray-600 dark:text-gray-400">{formatPrice(product.cost)}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-medium ${product.lowStock ? 'text-red-600 dark:text-red-400' : 'text-black dark:text-white'}`}>
                        {product.stock}
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
                        {product.margin.toFixed(1)}%
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

          {filteredProducts.length === 0 && (
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
          product={editingProduct}
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(null);
          }}
          onSave={(productData) => {
            if (editingProduct) {
              setProducts(products.map(p => 
                p.id === editingProduct.id ? { ...p, ...productData } : p
              ));
            } else {
              const newProduct = {
                ...productData,
                id: Date.now().toString(),
                lowStock: productData.stock <= (productData.minStock || 10) // <-- Lógica mejorada
              };
              setProducts([...products, newProduct as Product]);
            }
            setShowProductModal(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* Modal de importación CSV */}
      {showImportModal && (
        <ImportCSVModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImportProducts}
        />
      )}

      {/* Modal de impresión de etiquetas */}
      {showLabelModal && (
        <LabelPrintModal
          selectedProducts={products.filter(p => selectedProducts.includes(p.id))}
          onClose={() => setShowLabelModal(false)}
          onPrint={handleLabelPrint}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-500 text-white' :
          toast.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white' // Corregido: 'bg-blue-5 00' a 'bg-blue-500'
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