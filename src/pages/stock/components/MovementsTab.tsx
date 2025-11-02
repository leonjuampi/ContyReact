
import { useState } from 'react';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';

interface StockMovement {
  id: string;
  date: string;
  time: string;
  type: 'entrada' | 'salida' | 'ajuste' | 'venta';
  product: {
    name: string;
    sku: string;
  };
  quantity: number;
  warehouse: string;
  user: string;
  reference?: string;
  notes?: string;
}

const mockMovements: StockMovement[] = [
  {
    id: '1',
    date: '2024-01-22',
    time: '14:30',
    type: 'venta',
    product: { name: 'Camisa Manga Larga Blanca', sku: 'CAM001' },
    quantity: -2,
    warehouse: 'Depósito Central',
    user: 'Juan Pérez',
    reference: 'V-0001',
    notes: 'Venta presencial'
  },
  {
    id: '2',
    date: '2024-01-22',
    time: '10:15',
    type: 'entrada',
    product: { name: 'Pantalón Jean Azul Classic', sku: 'PAN002' },
    quantity: 50,
    warehouse: 'Depósito Central',
    user: 'María Silva',
    reference: 'C-0045',
    notes: 'Compra a proveedor'
  },
  {
    id: '3',
    date: '2024-01-21',
    time: '16:45',
    type: 'ajuste',
    product: { name: 'Zapatillas Deportivas Negras', sku: 'ZAP003' },
    quantity: -3,
    warehouse: 'Sucursal Norte',
    user: 'Carlos López',
    reference: 'AJ-001',
    notes: 'Productos dañados'
  },
  {
    id: '4',
    date: '2024-01-21',
    time: '09:20',
    type: 'salida',
    product: { name: 'Buzo Canguro Gris', sku: 'BUZ004' },
    quantity: -10,
    warehouse: 'Depósito Central',
    user: 'Ana Torres',
    reference: 'T-002',
    notes: 'Transferencia a sucursal'
  }
];

export default function MovementsTab() {
  const [movements, setMovements] = useState<StockMovement[]>(mockMovements);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [productFilter, setProductFilter] = useState('');
  const [showNewMovementModal, setShowNewMovementModal] = useState(false);

  const filteredMovements = movements.filter(movement => {
    if (dateFrom && movement.date < dateFrom) return false;
    if (dateTo && movement.date > dateTo) return false;
    if (selectedType !== 'all' && movement.type !== selectedType) return false;
    if (selectedWarehouse !== 'all' && movement.warehouse !== selectedWarehouse) return false;
    if (productFilter && !movement.product.name.toLowerCase().includes(productFilter.toLowerCase()) && 
        !movement.product.sku.toLowerCase().includes(productFilter.toLowerCase())) return false;
    return true;
  });

  const getMovementTypeIcon = (type: string) => {
    const icons = {
      entrada: 'ri-arrow-down-line',
      salida: 'ri-arrow-up-line',
      ajuste: 'ri-edit-line',
      venta: 'ri-shopping-cart-line'
    };
    return icons[type as keyof typeof icons] || 'ri-exchange-line';
  };

  const getMovementTypeColor = (type: string) => {
    const colors = {
      entrada: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20',
      salida: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20',
      ajuste: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20',
      venta: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
  };

  const getMovementTypeLabel = (type: string) => {
    const labels = {
      entrada: 'Entrada',
      salida: 'Salida',
      ajuste: 'Ajuste',
      venta: 'Venta'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleNewMovement = () => {
    setShowNewMovementModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
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
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
              <option value="ajuste">Ajuste</option>
              <option value="venta">Venta</option>
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
              {filteredMovements.map((movement) => (
                <tr
                  key={movement.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm font-medium text-black dark:text-white">
                        {new Date(movement.date).toLocaleDateString('es-AR')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{movement.time}</p>
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
                      <p className="text-sm font-medium text-black dark:text-white">{movement.product.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {movement.product.sku}</p>
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
                    <span className="text-sm text-gray-600 dark:text-gray-400">{movement.warehouse}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-black dark:text-white">{movement.user}</span>
                  </td>
                  <td className="py-3 px-4">
                    {movement.reference && (
                      <span className="text-sm font-mono text-black dark:text-white">{movement.reference}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {movement.notes && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">{movement.notes}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMovements.length === 0 && (
          <div className="text-center py-8">
            <i className="ri-exchange-line text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
            <p className="text-gray-500 dark:text-gray-400">No se encontraron movimientos</p>
            <Button onClick={handleNewMovement} className="mt-4">
              Crear primer movimiento
            </Button>
          </div>
        )}
      </Card>

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

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">Tipo de movimiento</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white pr-8">
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                  <option value="ajuste">Ajuste</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">Producto</label>
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
