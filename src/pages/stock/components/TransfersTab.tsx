
import { useState, useRef, useEffect } from 'react';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';

interface Transfer {
  id: string;
  number: string;
  fromWarehouse: string;
  toWarehouse: string;
  status: 'pending' | 'in_transit' | 'received';
  createdAt: string;
  items: TransferItem[];
  createdBy: string;
  notes?: string;
}

interface TransferItem {
  id: string;
  product: {
    name: string;
    sku: string;
  };
  quantity: number;
}

const mockTransfers: Transfer[] = [
  {
    id: '1',
    number: 'TRANS-2024-001',
    fromWarehouse: 'Depósito Central',
    toWarehouse: 'Sucursal Norte',
    status: 'in_transit',
    createdAt: '2024-01-22',
    createdBy: 'María Silva',
    items: [
      { id: '1', product: { name: 'Camisa Manga Larga Blanca', sku: 'CAM001' }, quantity: 10 },
      { id: '2', product: { name: 'Pantalón Jean Azul Classic', sku: 'PAN002' }, quantity: 5 }
    ],
    notes: 'Reposición stock sucursal'
  },
  {
    id: '2',
    number: 'TRANS-2024-002',
    fromWarehouse: 'Sucursal Sur',
    toWarehouse: 'Depósito Central',
    status: 'received',
    createdAt: '2024-01-20',
    createdBy: 'Carlos López',
    items: [
      { id: '3', product: { name: 'Zapatillas Deportivas Negras', sku: 'ZAP003' }, quantity: 3 }
    ]
  }
];

const mockProducts = [
  { id: 'P001', name: 'Camisa Manga Larga Blanca', sku: 'CAM001', stock: 25 },
  { id: 'P002', name: 'Pantalón Jean Azul Classic', sku: 'PAN002', stock: 15 },
  { id: 'P003', name: 'Zapatillas Deportivas Negras', sku: 'ZAP003', stock: 12 }
];

export default function TransfersTab() {
  const [transfers, setTransfers] = useState<Transfer[]>(mockTransfers);
  const [showNewTransferModal, setShowNewTransferModal] = useState(false);
  const [fromWarehouse, setFromWarehouse] = useState('');
  const [toWarehouse, setToWarehouse] = useState('');
  const [transferItems, setTransferItems] = useState<TransferItem[]>([]);
  const [productInput, setProductInput] = useState('');
  const [notes, setNotes] = useState('');

  const productInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showNewTransferModal && productInputRef.current) {
      productInputRef.current.focus();
    }
  }, [showNewTransferModal]);

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      in_transit: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      received: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    };
    
    const labels = {
      pending: 'Pendiente',
      in_transit: 'En Tránsito',
      received: 'Recibido'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const handleNewTransfer = () => {
    setShowNewTransferModal(true);
    setFromWarehouse('');
    setToWarehouse('');
    setTransferItems([]);
    setNotes('');
  };

  const handleProductInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = productInput.trim();
      if (input) {
        addProductToTransfer(input);
        setProductInput('');
      }
    }
  };

  const addProductToTransfer = (input: string) => {
    const product = mockProducts.find(p => 
      p.sku.toLowerCase().includes(input.toLowerCase()) ||
      p.name.toLowerCase().includes(input.toLowerCase())
    );

    if (!product) {
      alert('Producto no encontrado');
      return;
    }

    const existingIndex = transferItems.findIndex(item => item.product.sku === product.sku);
    
    if (existingIndex >= 0) {
      const newItems = [...transferItems];
      newItems[existingIndex].quantity += 1;
      setTransferItems(newItems);
    } else {
      const newItem: TransferItem = {
        id: Date.now().toString(),
        product: { name: product.name, sku: product.sku },
        quantity: 1
      };
      setTransferItems([...transferItems, newItem]);
    }
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index);
      return;
    }

    const newItems = [...transferItems];
    newItems[index].quantity = quantity;
    setTransferItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = transferItems.filter((_, i) => i !== index);
    setTransferItems(newItems);
  };

  const handleCreateTransfer = () => {
    if (!fromWarehouse || !toWarehouse || transferItems.length === 0) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    const newTransfer: Transfer = {
      id: Date.now().toString(),
      number: `TRANS-2024-${String(transfers.length + 1).padStart(3, '0')}`,
      fromWarehouse,
      toWarehouse,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'Usuario Actual',
      items: transferItems,
      notes
    };

    setTransfers([newTransfer, ...transfers]);
    setShowNewTransferModal(false);
  };

  const handleUpdateStatus = (transferId: string, newStatus: 'pending' | 'in_transit' | 'received') => {
    setTransfers(transfers.map(t => 
      t.id === transferId ? { ...t, status: newStatus } : t
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-black dark:text-white">Transferencias de Stock</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gestiona el movimiento de productos entre depósitos
            </p>
          </div>
          <Button onClick={handleNewTransfer}>
            <i className="ri-add-line mr-2"></i>
            Nueva Transferencia (T)
          </Button>
        </div>
      </Card>

      {/* Lista de transferencias */}
      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">N° Transferencia</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Origen</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Destino</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Ítems</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Estado</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Fecha</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Creado por</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((transfer) => (
                <tr
                  key={transfer.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                >
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm text-black dark:text-white">{transfer.number}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-black dark:text-white">{transfer.fromWarehouse}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-black dark:text-white">{transfer.toWarehouse}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-sm text-black dark:text-white">{transfer.items.length}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(transfer.status)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-black dark:text-white">
                      {new Date(transfer.createdAt).toLocaleDateString('es-AR')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-black dark:text-white">{transfer.createdBy}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      {transfer.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(transfer.id, 'in_transit')}
                        >
                          Enviar
                        </Button>
                      )}
                      {transfer.status === 'in_transit' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(transfer.id, 'received')}
                        >
                          Recibir
                        </Button>
                      )}
                      <button
                        className="p-2 text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
                        title="Ver detalles"
                      >
                        <i className="ri-eye-line"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {transfers.length === 0 && (
          <div className="text-center py-8">
            <i className="ri-truck-line text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
            <p className="text-gray-500 dark:text-gray-400">No hay transferencias registradas</p>
            <Button onClick={handleNewTransfer} className="mt-4">
              Crear primera transferencia
            </Button>
          </div>
        )}
      </Card>

      {/* Modal Nueva Transferencia */}
      {showNewTransferModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-black dark:text-white">Nueva Transferencia</h3>
              <button
                onClick={() => setShowNewTransferModal(false)}
                className="text-gray-500 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="space-y-6">
              {/* Origen y Destino */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Depósito Origen *
                  </label>
                  <select
                    value={fromWarehouse}
                    onChange={(e) => setFromWarehouse(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white pr-8"
                  >
                    <option value="">Seleccionar origen</option>
                    <option value="Depósito Central">Depósito Central</option>
                    <option value="Sucursal Norte">Sucursal Norte</option>
                    <option value="Sucursal Sur">Sucursal Sur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Depósito Destino *
                  </label>
                  <select
                    value={toWarehouse}
                    onChange={(e) => setToWarehouse(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white pr-8"
                  >
                    <option value="">Seleccionar destino</option>
                    <option value="Depósito Central">Depósito Central</option>
                    <option value="Sucursal Norte">Sucursal Norte</option>
                    <option value="Sucursal Sur">Sucursal Sur</option>
                  </select>
                </div>
              </div>

              {/* Input de producto */}
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Agregar Productos
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      ref={productInputRef}
                      type="text"
                      value={productInput}
                      onChange={(e) => setProductInput(e.target.value)}
                      onKeyDown={handleProductInput}
                      placeholder="Escanear código o escribir SKU/nombre..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      if (productInput.trim()) {
                        addProductToTransfer(productInput.trim());
                        setProductInput('');
                      }
                    }}
                  >
                    <i className="ri-add-line mr-2"></i>
                    Agregar
                  </Button>
                </div>
              </div>

              {/* Lista de productos */}
              {transferItems.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-black dark:text-white mb-3">Productos a Transferir</h4>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Producto</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Cantidad</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transferItems.map((item, index) => (
                          <tr key={item.id} className="border-t border-gray-200 dark:border-gray-700">
                            <td className="py-3 px-4">
                              <div>
                                <p className="text-sm font-medium text-black dark:text-white">{item.product.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {item.product.sku}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center space-x-2">
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                                  className="w-20 text-center text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-black dark:text-white"
                                  min="1"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => removeItem(index)}
                                className="text-red-500 hover:text-red-700 cursor-pointer"
                              >
                                <i className="ri-delete-bin-line"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observaciones sobre la transferencia..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowNewTransferModal(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateTransfer}>
                <i className="ri-truck-line mr-2"></i>
                Crear Transferencia
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
