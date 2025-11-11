// src/pages/stock/components/TransfersTab.tsx
import { useState, useRef, useEffect } from 'react';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';
// --- 1. Importar API y Contexto de Auth ---
import {
  StockTransfer,
  getStockTransfers,
  createTransfer,
  receiveTransfer,
  searchStockProducts,
  CreateTransferPayload,
  TransferItemPayload
} from '../../../services/stock.api';
import { useAuth } from '../../../contexts/AuthContext';

// --- 2. Interfaces locales ---
// Interfaz para el producto buscado en el modal
interface SearchedProduct {
  id: string; // Este es el variantId
  name: string; // Nombre combinado (Producto + Variante)
  sku: string;
  stock: number;
  productId: number;
}

// Interfaz para el item en el carrito de transferencia
interface TransferCartItem {
  variantId: number;
  productId: number;
  name: string;
  sku: string;
  quantity: number;
}

// --- 3. Eliminar Mocks ---
// const mockTransfers: Transfer[] = [...]; // ELIMINADO
// const mockProducts = [...]; // ELIMINADO

export default function TransfersTab() {
  const { user } = useAuth(); // Para obtener sucursales

  // --- 4. Estados ---
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewTransferModal, setShowNewTransferModal] = useState(false);
  
  // Estados del Modal
  const [fromWarehouse, setFromWarehouse] = useState(user?.branchId?.toString() || '');
  const [toWarehouse, setToWarehouse] = useState('');
  const [transferItems, setTransferItems] = useState<TransferCartItem[]>([]);
  const [productInput, setProductInput] = useState('');
  const [productSearchResults, setProductSearchResults] = useState<SearchedProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [notes, setNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Estado para el toast (puedes reemplazarlo por tu sistema de notificaciones)
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const productInputRef = useRef<HTMLInputElement>(null);

  // --- 5. Map y Opciones de Sucursales ---
  // Creamos un mapa y opciones para los <select>
  const branchMap = new Map<number, string>();
  // Asumimos que user.branchIds es un array de IDs (números)
  // y que necesitamos un lugar para obtener sus nombres.
  // Por AHORA, usaremos un mock simple. En el futuro, user.branchIds debería ser un array de objetos {id, name}.
  user?.branchIds?.forEach(id => {
    branchMap.set(id, `Sucursal ${id}`); // Simulación
  });
  
  // Opciones para los <select>
  const branchOptions = Array.from(branchMap.entries()).map(([id, name]) => ({
    id: id.toString(),
    name: name
  }));


  // --- 6. Funciones de Carga de Datos ---
  const fetchTransfers = () => {
    setIsLoading(true);
    // Usamos el branchId del usuario si está en "all",
    // pero la API de transferencias usa el 'orgId' del token.
    // Pasaremos el branchId del select principal (si existe).
    const mainBranchId = user?.branchId ? user.branchId : undefined; 

    getStockTransfers(mainBranchId)
      .then(data => {
        setTransfers(data.items);
      })
      .catch(err => {
        console.error(err);
        showToast('Error al cargar transferencias', 'error');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchTransfers();
  }, []); // Cargar al montar

  useEffect(() => {
    if (showNewTransferModal && productInputRef.current) {
      productInputRef.current.focus();
    }
  }, [showNewTransferModal]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- 7. Lógica del Modal ---
  const handleProductSearch = async () => {
    if (productInput.trim().length < 2) {
      setProductSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      // Usar la API de búsqueda de productos con stock
      // Asumimos que el "fromWarehouse" (origen) es el branchId para chequear stock
      const originBranchId = Number(fromWarehouse);
      if (isNaN(originBranchId)) {
          showToast('Seleccione un depósito de origen primero', 'error');
          return;
      }

      const data = await searchStockProducts(productInput, originBranchId);
      
      // Mapear la respuesta de la API (que puede ser compleja) a nuestra interfaz simple
      const mappedResults: SearchedProduct[] = data.items.map((p: any) => ({
        id: p.variantId, // ID de la Variante
        productId: p.productId,
        name: `${p.productName} ${p.variantName || ''}`.trim(),
        sku: p.variantSku || p.productSku,
        stock: p.qty, // Stock en la sucursal de origen
      }));

      setProductSearchResults(mappedResults);

    } catch (err: any) {
      showToast(`Error buscando productos: ${err.message}`, 'error');
    } finally {
      setIsSearching(false);
    }
  };
  
  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      handleProductSearch();
    }, 300);
    return () => clearTimeout(timer);
  }, [productInput, fromWarehouse]);


  const addProductToTransfer = (product: SearchedProduct) => {
    const existingIndex = transferItems.findIndex(item => item.variantId === Number(product.id));
    
    if (existingIndex >= 0) {
      const newItems = [...transferItems];
      const newQty = newItems[existingIndex].quantity + 1;
      if (newQty > product.stock) {
          showToast('Stock insuficiente en origen', 'error');
          return;
      }
      newItems[existingIndex].quantity = newQty;
      setTransferItems(newItems);
    } else {
      if (product.stock < 1) {
           showToast('Stock insuficiente en origen', 'error');
           return;
      }
      const newItem: TransferCartItem = {
        variantId: Number(product.id),
        productId: product.productId,
        name: product.name,
        sku: product.sku,
        quantity: 1
      };
      setTransferItems([...transferItems, newItem]);
    }
    setProductInput('');
    setProductSearchResults([]);
    productInputRef.current?.focus();
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index);
      return;
    }
    // (Falta validación de stock aquí, la añadiremos)
    const newItems = [...transferItems];
    newItems[index].quantity = quantity;
    setTransferItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = transferItems.filter((_, i) => i !== index);
    setTransferItems(newItems);
  };

  const resetModal = () => {
     setShowNewTransferModal(false);
     setFromWarehouse(user?.branchId?.toString() || '');
     setToWarehouse('');
     setTransferItems([]);
     setNotes('');
     setProductInput('');
     setProductSearchResults([]);
     setIsCreating(false);
  };

  const handleCreateTransfer = async () => {
    const originBranchId = Number(fromWarehouse);
    const destBranchId = Number(toWarehouse);

    if (!originBranchId || !destBranchId) {
      showToast('Debe seleccionar origen y destino', 'error');
      return;
    }
    if (originBranchId === destBranchId) {
      showToast('El origen y destino no pueden ser iguales', 'error');
      return;
    }
    if (transferItems.length === 0) {
      showToast('Agregue al menos un producto', 'error');
      return;
    }

    setIsCreating(true);

    const payload: CreateTransferPayload = {
      originBranchId,
      destBranchId,
      note: notes || undefined,
      items: transferItems.map(item => ({
        variant_id: item.variantId,
        quantity: item.quantity
      }))
    };

    try {
      const result = await createTransfer(payload);
      showToast(`Transferencia ${result.transfer_ref || result.out_id} creada exitosamente`, 'success');
      resetModal();
      fetchTransfers(); // Recargar la lista
    } catch (err: any) {
      console.error(err);
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsCreating(false);
    }
  };
  
  // --- 8. Lógica de "Recibir" ---
  const handleReceiveTransfer = async (transfer: StockTransfer) => {
    // Necesitamos saber a qué sucursal estamos recibiendo.
    // Usaremos la sucursal activa del usuario.
    const currentBranchId = user?.branchId;
    if (!currentBranchId) {
        showToast('Error: No se pudo identificar tu sucursal actual.', 'error');
        return;
    }
    
    // Opcional: Validar que la sucursal actual sea el destino esperado
    // (Tu backend ya lo hace, pero es buena práctica)

    if (!confirm(`¿Confirmar recepción de la transferencia ${transfer.ref} en la sucursal ${branchMap.get(currentBranchId) || 'actual'}?`)) {
      return;
    }

    try {
      await receiveTransfer(transfer.ref, currentBranchId);
      showToast(`Transferencia ${transfer.ref} recibida exitosamente`, 'success');
      fetchTransfers(); // Recargar la lista
    } catch (err: any) {
       console.error(err);
       // 409: Already received
       if (err.message?.includes('409') || err.message?.includes('Already received')) {
           showToast('Esta transferencia ya fue recibida', 'info');
       } else {
           showToast(`Error al recibir: ${err.message}`, 'error');
       }
    }
  };


  // --- 9. JSX ---
  const getStatusBadge = (status: string) => {
    const styles = {
      IN_TRANSIT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      RECEIVED: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    };
    const labels = {
      IN_TRANSIT: 'En Tránsito',
      RECEIVED: 'Recibido'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 p-4 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-black dark:text-white">Transferencias de Stock</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gestiona el movimiento de productos entre depósitos
            </p>
          </div>
          <Button onClick={() => setShowNewTransferModal(true)}>
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
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Referencia</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Origen</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Destino</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Ítems</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Estado</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Fecha</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                 <tr><td colSpan={7} className="text-center p-8 text-gray-500">Cargando transferencias...</td></tr>
              ) : transfers.length === 0 ? (
                 <tr><td colSpan={7} className="text-center p-8 text-gray-500">No hay transferencias registradas.</td></tr>
              ) : (
                transfers.map((transfer) => (
                  <tr
                    key={transfer.ref}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-black dark:text-white">{transfer.ref}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-black dark:text-white">{transfer.originName || 'N/A'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-black dark:text-white">{transfer.destName || 'N/A'}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm text-black dark:text-white">{transfer.items}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(transfer.status)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-black dark:text-white">
                        {new Date(transfer.lastDate).toLocaleDateString('es-AR')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {transfer.status === 'IN_TRANSIT' && (
                          <Button
                            size="sm"
                            onClick={() => handleReceiveTransfer(transfer)}
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
                ))
              )}
            </tbody>
          </table>
        </div>

      </Card>

      {/* Modal Nueva Transferencia */}
      {showNewTransferModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-black dark:text-white">Nueva Transferencia</h3>
              <button
                onClick={resetModal}
                className="text-gray-500 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
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
                      {branchOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                      ))}
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
                       {branchOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Input de producto */}
                <div className="relative">
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Agregar Productos
                  </label>
                  <input
                    ref={productInputRef}
                    type="text"
                    value={productInput}
                    onChange={(e) => setProductInput(e.target.value)}
                    placeholder="Escanear código o escribir SKU/nombre..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                    disabled={!fromWarehouse}
                  />
                  {/* Resultados de búsqueda */}
                  {(isSearching || productSearchResults.length > 0) && (
                    <div className="absolute top-full left-0 right-0 z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                      {isSearching && <div className="p-3 text-sm text-gray-500">Buscando...</div>}
                      {!isSearching && productSearchResults.map(prod => (
                        <div
                          key={prod.id}
                          onClick={() => addProductToTransfer(prod)}
                          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex justify-between"
                        >
                          <div>
                            <p className="font-medium text-black dark:text-white">{prod.name}</p>
                            <p className="text-sm text-gray-500">{prod.sku}</p>
                          </div>
                          <div className={`text-sm ${prod.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            Stock: {prod.stock}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                            <tr key={item.variantId} className="border-t border-gray-200 dark:border-gray-700">
                              <td className="py-3 px-4">
                                <div>
                                  <p className="text-sm font-medium text-black dark:text-white">{item.name}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {item.sku}</p>
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
                                    // max={...} // Deberíamos guardar el stock máx en el item
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
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={resetModal}
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateTransfer}
                disabled={isCreating || transferItems.length === 0 || !fromWarehouse || !toWarehouse}
              >
                {isCreating ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Creando...
                  </>
                ) : (
                  <>
                    <i className="ri-truck-line mr-2"></i>
                    Crear Transferencia
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}