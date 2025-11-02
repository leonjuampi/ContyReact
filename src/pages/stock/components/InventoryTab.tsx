
import { useState, useRef, useEffect } from 'react';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';

interface InventoryItem {
  id: string;
  product: {
    name: string;
    sku: string;
    category: string;
  };
  expected: number;
  counted: number;
  difference: number;
  warehouse: string;
  status: 'pending' | 'counted' | 'approved';
}

const mockInventoryData: InventoryItem[] = [
  {
    id: '1',
    product: { name: 'Camisa Manga Larga Blanca', sku: 'CAM001', category: 'Camisas' },
    expected: 25,
    counted: 23,
    difference: -2,
    warehouse: 'Depósito Central',
    status: 'counted'
  },
  {
    id: '2',
    product: { name: 'Pantalón Jean Azul Classic', sku: 'PAN002', category: 'Pantalones' },
    expected: 15,
    counted: 15,
    difference: 0,
    warehouse: 'Depósito Central',
    status: 'counted'
  },
  {
    id: '3',
    product: { name: 'Zapatillas Deportivas Negras', sku: 'ZAP003', category: 'Calzado' },
    expected: 12,
    counted: 0,
    difference: 0,
    warehouse: 'Depósito Central',
    status: 'pending'
  }
];

export default function InventoryTab() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(mockInventoryData);
  const [inventoryMode, setInventoryMode] = useState(false);
  const [productInput, setProductInput] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('Depósito Central');
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);

  const productInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inventoryMode && productInputRef.current) {
      productInputRef.current.focus();
    }
  }, [inventoryMode]);

  const filteredItems = inventoryItems.filter(item => {
    if (selectedWarehouse !== 'all' && item.warehouse !== selectedWarehouse) return false;
    if (showOnlyDifferences && item.difference === 0) return false;
    return true;
  });

  const handleStartInventory = () => {
    setInventoryMode(true);
    // Reset conteos
    setInventoryItems(items => items.map(item => ({
      ...item,
      counted: 0,
      difference: 0,
      status: 'pending'
    })));
  };

  const handleProductScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = productInput.trim();
      if (input) {
        countProduct(input);
        setProductInput('');
      }
    }
  };

  const countProduct = (input: string) => {
    const itemIndex = inventoryItems.findIndex(item => 
      item.product.sku.toLowerCase() === input.toLowerCase() ||
      item.product.name.toLowerCase().includes(input.toLowerCase())
    );

    if (itemIndex === -1) {
      alert('Producto no encontrado en el inventario');
      return;
    }

    const newItems = [...inventoryItems];
    newItems[itemIndex].counted += 1;
    newItems[itemIndex].difference = newItems[itemIndex].counted - newItems[itemIndex].expected;
    newItems[itemIndex].status = 'counted';
    setInventoryItems(newItems);
  };

  const updateManualCount = (itemId: string, count: number) => {
    const newItems = inventoryItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          counted: Math.max(0, count),
          difference: Math.max(0, count) - item.expected,
          status: 'counted' as const
        };
      }
      return item;
    });
    setInventoryItems(newItems);
  };

  const approveAdjustment = (itemId: string) => {
    const newItems = inventoryItems.map(item => {
      if (item.id === itemId) {
        return { ...item, status: 'approved' as const };
      }
      return item;
    });
    setInventoryItems(newItems);
  };

  const approveAllAdjustments = () => {
    const newItems = inventoryItems.map(item => ({
      ...item,
      status: 'approved' as const
    }));
    setInventoryItems(newItems);
    setInventoryMode(false);
  };

  const cancelInventory = () => {
    setInventoryMode(false);
    // Restaurar datos originales
    setInventoryItems(mockInventoryData);
  };

  const getDifferenceColor = (difference: number) => {
    if (difference > 0) return 'text-green-600 dark:text-green-400';
    if (difference < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      counted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    };
    
    const labels = {
      pending: 'Pendiente',
      counted: 'Contado',
      approved: 'Aprobado'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const pendingCount = inventoryItems.filter(item => item.status === 'pending').length;
  const countedItems = inventoryItems.filter(item => item.status === 'counted').length;
  const totalDifferences = inventoryItems.filter(item => item.difference !== 0).length;

  return (
    <div className="space-y-6">
      {/* Estado del inventario */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Productos Pendientes</p>
              <p className="text-2xl font-bold text-black dark:text-white">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <i className="ri-time-line text-yellow-600 dark:text-yellow-400 text-xl"></i>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Productos Contados</p>
              <p className="text-2xl font-bold text-black dark:text-white">{countedItems}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <i className="ri-checkbox-line text-blue-600 dark:text-blue-400 text-xl"></i>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Con Diferencias</p>
              <p className="text-2xl font-bold text-black dark:text-white">{totalDifferences}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <i className="ri-error-warning-line text-red-600 dark:text-red-400 text-xl"></i>
            </div>
          </div>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">Depósito</label>
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white pr-8"
                disabled={inventoryMode}
              >
                <option value="all">Todos los depósitos</option>
                <option value="Depósito Central">Depósito Central</option>
                <option value="Sucursal Norte">Sucursal Norte</option>
                <option value="Sucursal Sur">Sucursal Sur</option>
              </select>
            </div>

            <label className="flex items-center gap-2 pt-7">
              <input
                type="checkbox"
                checked={showOnlyDifferences}
                onChange={(e) => setShowOnlyDifferences(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-black dark:text-white">Solo diferencias</span>
            </label>
          </div>

          <div className="flex gap-3">
            {!inventoryMode ? (
              <Button onClick={handleStartInventory}>
                <i className="ri-clipboard-line mr-2"></i>
                Iniciar Inventario (I)
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={cancelInventory}
                >
                  <i className="ri-close-line mr-2"></i>
                  Cancelar
                </Button>
                <Button
                  onClick={approveAllAdjustments}
                  disabled={pendingCount > 0}
                >
                  <i className="ri-check-double-line mr-2"></i>
                  Aprobar Todo
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Modo conteo */}
        {inventoryMode && (
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <i className="ri-scan-line text-blue-600 dark:text-blue-400 text-xl mr-2"></i>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Modo Conteo Activo</h4>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  ref={productInputRef}
                  type="text"
                  value={productInput}
                  onChange={(e) => setProductInput(e.target.value)}
                  onKeyDown={handleProductScan}
                  placeholder="Escanear código de barras o escribir SKU..."
                  className="w-full px-4 py-3 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                <p>Pendientes: <span className="font-bold">{pendingCount}</span></p>
                <p>Contados: <span className="font-bold">{countedItems}</span></p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Tabla de inventario */}
      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Producto</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">SKU</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Esperado</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Contado</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Diferencia</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Depósito</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Estado</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 ${
                    item.difference !== 0 ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-black dark:text-white">{item.product.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.product.category}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm text-black dark:text-white">{item.product.sku}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-black dark:text-white font-medium">{item.expected}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {inventoryMode && item.status === 'pending' ? (
                      <input
                        type="number"
                        value={item.counted}
                        onChange={(e) => updateManualCount(item.id, parseInt(e.target.value) || 0)}
                        className="w-16 text-center text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-black dark:text-white"
                        min="0"
                      />
                    ) : (
                      <span className="text-black dark:text-white font-medium">{item.counted}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-medium ${getDifferenceColor(item.difference)}`}>
                      {item.difference > 0 ? '+' : ''}{item.difference}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-600 dark:text-gray-400">{item.warehouse}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.status === 'counted' && item.difference !== 0 && (
                      <Button
                        size="sm"
                        onClick={() => approveAdjustment(item.id)}
                        disabled={item.status === 'approved'}
                      >
                        <i className="ri-check-line mr-1"></i>
                        Aprobar
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-8">
            <i className="ri-clipboard-line text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
            <p className="text-gray-500 dark:text-gray-400">No hay productos para mostrar</p>
          </div>
        )}
      </Card>

      {/* Resumen de diferencias */}
      {totalDifferences > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Resumen de Ajustes</h3>
          <div className="space-y-2">
            {inventoryItems.filter(item => item.difference !== 0).map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-black dark:text-white">{item.product.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">SKU: {item.product.sku}</p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${getDifferenceColor(item.difference)}`}>
                    {item.difference > 0 ? 'Sobrante: +' : 'Faltante: '}{Math.abs(item.difference)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.expected} → {item.counted}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
