// src/pages/stock/components/MovementsTab.tsx
import { useState, useEffect } from 'react';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';
// --- 1. Importar la API y la nueva interfaz ---
import { StockMovement, getStockMovements, MovementFilters } from '../../../services/stock.api';

export default function MovementsTab() {
  // --- 3. Añadir estados para datos, carga y total ---
  const [movements, setMovements] = useState<StockMovement[]>([]); // Inicia vacío
  const [isLoading, setIsLoading] = useState(true);
  const [totalMovements, setTotalMovements] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50); // Coincide con el default del backend

  // Estados de filtros (sin cambios)
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [productFilter, setProductFilter] = useState('');
  const [showNewMovementModal, setShowNewMovementModal] = useState(false);

  // --- 4. Función para cargar datos ---
  const fetchMovements = () => {
    setIsLoading(true);
    
    // Mapear el ID del warehouse (string) a un ID numérico (number)
    // Esto es una suposición. Necesitarías un estado que mapee "Depósito Central" a 1, etc.
    // Por ahora, lo dejamos simple.
    const branchIdMap: Record<string, number> = {
      'Depósito Central': 1,
      'Sucursal Norte': 2,
      'Sucursal Sur': 3
    };

    const filters: MovementFilters = {
      from: dateFrom || undefined,
      to: dateTo || undefined,
      type: selectedType !== 'all' ? (selectedType.toUpperCase() as MovementFilters['type']) : undefined,
      branchId: selectedWarehouse !== 'all' ? branchIdMap[selectedWarehouse] : undefined,
      q: productFilter || undefined,
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
    };

    getStockMovements(filters)
      .then(data => {
        setMovements(data.items);
        setTotalMovements(data.total);
      })
      .catch(err => {
        console.error("Error fetching movements:", err);
        // Aquí deberías mostrar un toast de error
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // --- 5. useEffect para cargar datos cuando cambian los filtros ---
  useEffect(() => {
    // Usamos un debounce para no llamar a la API en cada tecla del filtro de producto
    const timer = setTimeout(() => {
      fetchMovements();
    }, 300); 

    return () => clearTimeout(timer);
  }, [dateFrom, dateTo, selectedType, selectedWarehouse, productFilter, currentPage]);


  // (Funciones getMovementTypeIcon, getMovementTypeColor, getMovementTypeLabel no cambian)
  const getMovementTypeIcon = (type: string) => {
    const icons = {
      ENTRY: 'ri-arrow-down-line', // ENTRADA
      TRANSFER_IN: 'ri-arrow-down-line',
      SALE: 'ri-shopping-cart-line', // VENTA
      ADJUSTMENT: 'ri-edit-line', // AJUSTE
      TRANSFER_OUT: 'ri-arrow-up-line', // SALIDA
      INVENTORY: 'ri-clipboard-line', // AÑADIDO
    };
    return icons[type as keyof typeof icons] || 'ri-exchange-line';
  };

  const getMovementTypeColor = (type: string) => {
    const colors = {
      ENTRY: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20',
      TRANSFER_IN: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20',
      SALE: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20',
      ADJUSTMENT: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20',
      TRANSFER_OUT: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20',
      INVENTORY: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/20', // AÑADIDO
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
  };
  
  const getMovementTypeLabel = (type: string) => {
    const labels = {
      ENTRY: 'Entrada',
      TRANSFER_IN: 'Recepción',
      SALE: 'Venta',
      ADJUSTMENT: 'Ajuste',
      TRANSFER_OUT: 'Salida (Transf.)',
      INVENTORY: 'Inventario', // AÑADIDO
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleNewMovement = () => {
    setShowNewMovementModal(true);
  };
  
  // --- 6. Actualizar JSX de la tabla ---
  return (
    <div className="space-y-6">
      {/* Filtros (Tu JSX va aquí) */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-black dark:text-white">Filtros</h3>
          <Button onClick={handleNewMovement}>
            <i className="ri-add-line mr-2"></i>
            Nuevo Movimiento (N)
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">Desde</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">Hasta</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">Tipo</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-sm pr-8"
            >
              <option value="all">Todos</option>
              <option value="ENTRY">Entrada</option>
              <option value="SALE">Venta</option>
              <option value="ADJUSTMENT">Ajuste</option>
              <option value="TRANSFER_IN">Recepción</option>
              <option value="TRANSFER_OUT">Salida (Transf.)</option>
              <option value="INVENTORY">Inventario</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">Depósito</label>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-sm pr-8"
            >
              <option value="all">Todos</option>
              <option value="Depósito Central">Depósito Central</option>
              <option value="Sucursal Norte">Sucursal Norte</option>
              <option value="Sucursal Sur">Sucursal Sur</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-black dark:text-white mb-2">Producto</label>
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-sm"
            />
          </div>
        </div>
      </Card>

      {/* Tabla de movimientos */}
      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Fecha/Hora</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Tipo</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Producto</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Cantidad</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Depósito</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Usuario</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Referencia</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Nota</th>
              </tr>
            </thead>
            <tbody>
              {/* --- 7. Adaptar el map a la nueva data --- */}
              {movements.map((movement) => (
                <tr
                  key={movement.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm font-medium text-black dark:text-white">
                        {new Date(movement.createdAt).toLocaleDateString('es-AR')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(movement.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMovementTypeColor(movement.type)}`}>
                      <i className={`${getMovementTypeIcon(movement.type)} mr-1`}></i>
                      {getMovementTypeLabel(movement.type)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      {/* Usar los campos de la API */}
                      <p className="text-sm font-medium text-black dark:text-white">{movement.productName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        SKU: {movement.variantSku || movement.productSku} {movement.variantName && `(${movement.variantName})`}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-medium ${
                      movement.quantity > 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{movement.branchName}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-black dark:text-white">{movement.userName || 'Sistema'}</span>
                  </td>
                  <td className="py-3 px-4">
                    {movement.refCode && (
                      <span className="text-sm font-mono text-black dark:text-white">{movement.refCode}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {movement.note && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">{movement.note}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- 8. Añadir estados de Carga y Vacío --- */}
        {isLoading && (
          <div className="text-center py-8">
            <i className="ri-loader-4-line animate-spin text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
            <p className="text-gray-500 dark:text-gray-400">Cargando movimientos...</p>
          </div>
        )}

        {!isLoading && movements.length === 0 && (
          <div className="text-center py-8">
            <i className="ri-exchange-line text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
            <p className="text-gray-500 dark:text-gray-400">No se encontraron movimientos con los filtros aplicados</p>
            <Button onClick={handleNewMovement} className="mt-4">
              Crear primer movimiento
            </Button>
          </div>
        )}
      </Card>
      
      {/* Paginación (Ejemplo simple) */}
      {/* ... Aquí deberías añadir botones de paginación que actualicen 'currentPage' ... */}

      {/* Modal Nuevo Movimiento */}
      {showNewMovementModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">Nuevo Movimiento</h3>
              <button
                onClick={() => setShowNewMovementModal(false)}
                className="text-gray-500 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {/* Aquí conectarás este formulario al endpoint POST /api/stock/movements */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">Tipo de movimiento</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white pr-8">
                  {/* CORREGIDO: Usar valores de la API */}
                  <option value="ENTRY">Entrada</option>
                  <option value="ADJUSTMENT">Ajuste</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">Producto</label>
                {/* Este input debería usar la API searchStockProducts que creamos */}
                <input
                  type="text"
                  placeholder="Buscar producto por nombre o SKU..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Cantidad</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Depósito</label>
                  {/* Este select debería poblarse desde el AuthContext */}
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white pr-8">
                    <option value="Depósito Central">Depósito Central</option>
                    <option value="Sucursal Norte">Sucursal Norte</option>
                    <option value="Sucursal Sur">Sucursal Sur</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">Referencia</label>
                <input
                  type="text"
                  placeholder="Número de comprobante o referencia"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">Nota (opcional)</label>
                <textarea
                  rows={3}
                  placeholder="Descripción del movimiento..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowNewMovementModal(false)}
              >
                Cancelar
              </Button>
              <Button onClick={() => setShowNewMovementModal(false)}>
                Crear Movimiento
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}