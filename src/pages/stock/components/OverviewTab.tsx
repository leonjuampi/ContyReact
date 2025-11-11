// src/pages/stock/components/OverviewTab.tsx
import { useState, useEffect } from 'react';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';
// 1. Importar APIs
import { getStockOverview, StockOverview } from '../../../services/stock.api'; // Ajusta la ruta a '@/' si es necesario
import { getProducts, Product } from '../../../services/product.api'; // Ajusta la ruta a '@/' si es necesario
import { useAuth } from '../../../contexts/AuthContext'; // Ajusta la ruta a '@/' si es necesario

// 2. Mover la interfaz StockItem aquí (o a un archivo de tipos)
interface StockItem {
  id: number;
  product: {
    name: string;
    sku: string;
    category: string;
  };
  warehouse: string;
  currentStock: number;
  minStock: number;
  value: number;
  lastMovement?: string; // El backend no provee esto en la lista
  isLowStock: boolean;
  noMovement90Days?: boolean; // El backend no provee esto en la lista
}

export default function OverviewTab() {
  const { user } = useAuth(); 
  
  // 3. Estados para filtros y datos
  // Usamos 'user?.branchId' como default si existe
  const [selectedWarehouse, setSelectedWarehouse] = useState(user?.branchId?.toString() || 'all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [showNoMovementOnly, setShowNoMovementOnly] = useState(false); // Este filtro no es soportado por el backend de /api/products

  const [kpis, setKpis] = useState<StockOverview | null>(null);
  const [products, setProducts] = useState<StockItem[]>([]);
  const [isLoadingKpis, setIsLoadingKpis] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Mapeo de sucursales (idealmente vendría de un contexto/API)
  const branchMap = new Map(user?.branchIds?.map(id => [id.toString(), `Sucursal ${id}`]) || []);
  if (user?.branchIds) {
      branchMap.set(user.branchIds[0]?.toString() || "1", "Depósito Central (Simulado)"); // Simulación
      branchMap.set(user.branchIds[1]?.toString() || "2", "Sucursal Norte (Simulado)"); // Simulación
  }


  const branchId = selectedWarehouse === 'all' ? undefined : Number(selectedWarehouse);

  // 4. useEffect para KPIs
  useEffect(() => {
    setIsLoadingKpis(true);
    // CORRECCIÓN: La API que definimos solo toma 'branchId'. 
    // El 'noMovementDays' es un default en el backend.
    getStockOverview(branchId)
      .then(data => {
        setKpis(data);
      })
      .catch(err => console.error("Error fetching KPIs:", err))
      .finally(() => setIsLoadingKpis(false));
  }, [selectedWarehouse]);

  // 5. useEffect para la tabla de productos
  useEffect(() => {
    setIsLoadingProducts(true);
    getProducts({
      branchId: branchId,
      stockLow: showLowStockOnly || undefined,
      // 'noMovement' no es un filtro de /api/products, el KPI lo cubre
    })
      .then(data => {
        // Mapear respuesta de la API a la interfaz StockItem
        const mappedProducts = data.items.map(p => {
          // NOTA: /api/products (lista) no devuelve stock real por sucursal.
          // Esta es una simulación. GET /api/products/{id} SÍ lo devuelve.
          // La pestaña 'Movements' será más precisa que esta tabla de 'Overview'.
          const simStock = p.stock ?? Math.floor(Math.random() * 30); // Simulación
          const simMinStock = 10;
          const simIsLowStock = simStock < simMinStock;

          return {
            id: p.id,
            product: {
              name: p.name,
              sku: p.sku,
              category: p.category_name,
            },
            warehouse: branchId ? (branchMap.get(selectedWarehouse) || 'Sucursal') : 'Múltiples',
            currentStock: simStock,
            minStock: simMinStock,
            value: simStock * p.cost,
            isLowStock: simIsLowStock,
            lastMovement: p.created_at, // Usamos 'created_at' como simulación
          };
        });
        
        // El filtro 'showNoMovementOnly' no se puede aplicar fiablemente aquí
        // ya que la API de /products no devuelve 'lastMovementDate'
        setProducts(mappedProducts); 
      })
      .catch(err => console.error("Error fetching products:", err))
      .finally(() => setIsLoadingProducts(false));

  }, [selectedWarehouse, showLowStockOnly, showNoMovementOnly]);

  // 6. CORRECCIÓN: Sintaxis de la función
  const handleAdjustStock = (itemId: number) => {
    console.log('Ajustar stock para:', itemId);
    // Esto debería abrir el modal de Movimientos (en el Tab padre)
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };
  
  // 7. CORRECCIÓN: Añadir función formatDate
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  // 8. CORRECCIÓN: El return debe estar al final de la función del componente
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Stock Bajo</p>
              <p className="text-2xl font-bold text-black dark:text-white">
                {isLoadingKpis ? '...' : (kpis?.lowStock ?? 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <i className="ri-error-warning-line text-red-600 dark:text-red-400 text-xl"></i>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Valor Inventario</p>
              <p className="text-2xl font-bold text-black dark:text-white">
                {isLoadingKpis ? '...' : formatPrice(kpis?.inventoryValue ?? 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <i className="ri-money-dollar-circle-line text-green-600 dark:text-green-400 text-xl"></i>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sin Movimiento {kpis?.noMovementDays || 90}d</p>
              <p className="text-2xl font-bold text-black dark:text-white">
                {isLoadingKpis ? '...' : (kpis?.noMovement ?? 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <i className="ri-time-line text-yellow-600 dark:text-yellow-400 text-xl"></i>
            </div>
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
              {/* Poblar esto con las sucursales del usuario desde useAuth */}
              {Array.from(branchMap.entries()).map(([id, name]) => (
                 <option key={id} value={id}>{name}</option>
              ))}
              {/* <option value="1">Depósito Central (Simulado)</option>
              <option value="2">Sucursal Norte (Simulado)</option> */}
            </select>
          </div>

          <div className="flex gap-4 pt-7">
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
              {isLoadingProducts ? (
                <tr><td colSpan={9} className="text-center p-8 text-gray-500">Cargando...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={9} className="text-center p-8 text-gray-500">No se encontraron productos.</td></tr>
              ) : (
                products.map((item) => (
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
                        {formatDate(item.lastMovement)}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}