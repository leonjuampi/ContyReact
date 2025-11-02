
import { useState } from 'react';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';

interface StockItem {
  id: string;
  product: {
    name: string;
    sku: string;
    category: string;
  };
  warehouse: string;
  currentStock: number;
  minStock: number;
  value: number;
  lastMovement: string;
  isLowStock: boolean;
  noMovement90Days: boolean;
}

const mockStockData: StockItem[] = [
  {
    id: '1',
    product: { name: 'Camisa Manga Larga Blanca', sku: 'CAM001', category: 'Camisas' },
    warehouse: 'Depósito Central',
    currentStock: 5,
    minStock: 10,
    value: 27500,
    lastMovement: '2024-01-20',
    isLowStock: true,
    noMovement90Days: false
  },
  {
    id: '2',
    product: { name: 'Pantalón Jean Azul Classic', sku: 'PAN002', category: 'Pantalones' },
    warehouse: 'Depósito Central',
    currentStock: 25,
    minStock: 15,
    value: 222500,
    lastMovement: '2024-01-21',
    isLowStock: false,
    noMovement90Days: false
  },
  {
    id: '3',
    product: { name: 'Cinturón Cuero Marrón', sku: 'ACC005', category: 'Accesorios' },
    warehouse: 'Sucursal Norte',
    currentStock: 18,
    minStock: 5,
    value: 68400,
    lastMovement: '2023-10-15',
    isLowStock: false,
    noMovement90Days: true
  }
];

export default function OverviewTab() {
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [showNoMovementOnly, setShowNoMovementOnly] = useState(false);

  const filteredData = mockStockData.filter(item => {
    if (selectedWarehouse !== 'all' && item.warehouse !== selectedWarehouse) return false;
    if (showLowStockOnly && !item.isLowStock) return false;
    if (showNoMovementOnly && !item.noMovement90Days) return false;
    return true;
  });

  const lowStockCount = mockStockData.filter(item => item.isLowStock).length;
  const totalValue = mockStockData.reduce((sum, item) => sum + item.value, 0);
  const noMovementCount = mockStockData.filter(item => item.noMovement90Days).length;

  const handleAdjustStock = (itemId: string) => {
    console.log('Ajustar stock para:', itemId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Stock Bajo</p>
              <p className="text-2xl font-bold text-black dark:text-white">{lowStockCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <i className="ri-error-warning-line text-red-600 dark:text-red-400 text-xl"></i>
            </div>
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
              Requiere atención
            </span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Valor Inventario</p>
              <p className="text-2xl font-bold text-black dark:text-white">{formatPrice(totalValue)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <i className="ri-money-dollar-circle-line text-green-600 dark:text-green-400 text-xl"></i>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +5.2% vs mes anterior
            </span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sin Movimiento 90d</p>
              <p className="text-2xl font-bold text-black dark:text-white">{noMovementCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <i className="ri-time-line text-yellow-600 dark:text-yellow-400 text-xl"></i>
            </div>
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
              Revisar rotación
            </span>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-black dark:text-white mb-2">Depósito</label>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white pr-8"
            >
              <option value="all">Todos los depósitos</option>
              <option value="Depósito Central">Depósito Central</option>
              <option value="Sucursal Norte">Sucursal Norte</option>
              <option value="Sucursal Sur">Sucursal Sur</option>
            </select>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showLowStockOnly}
                onChange={(e) => setShowLowStockOnly(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-black dark:text-white">Solo stock bajo</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showNoMovementOnly}
                onChange={(e) => setShowNoMovementOnly(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-black dark:text-white">Sin movimiento 90d</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Tabla de stock */}
      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Producto</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">SKU</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Stock</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Mínimo</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Diferencia</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Depósito</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Valor</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Últ. Mov.</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-black dark:text-white">{item.product.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.product.category}</p>
                      {item.noMovement90Days && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 mt-1">
                          Sin movimiento
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm text-black dark:text-white">{item.product.sku}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-medium ${item.isLowStock ? 'text-red-600 dark:text-red-400' : 'text-black dark:text-white'}`}>
                      {item.currentStock}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-gray-600 dark:text-gray-400">{item.minStock}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.isLowStock && (
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        -{item.minStock - item.currentStock}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-600 dark:text-gray-400">{item.warehouse}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-medium text-black dark:text-white">{formatPrice(item.value)}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(item.lastMovement).toLocaleDateString('es-AR')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAdjustStock(item.id)}
                    >
                      <i className="ri-edit-line mr-1"></i>
                      Ajustar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-8">
            <i className="ri-box-3-line text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
            <p className="text-gray-500 dark:text-gray-400">No se encontraron productos con los filtros aplicados</p>
          </div>
        )}
      </Card>
    </div>
  );
}
