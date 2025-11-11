// src/pages/stock/components/InventoryTab.tsx
import { useState, useEffect } from 'react';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';
// --- 1. Importar API y Auth ---
import {
  InventorySession,
  getInventorySessions,
  createInventorySession,
  getInventorySessionDetails,
  commitInventorySession,
  InventorySessionDetails,
  CreateInventoryPayload
} from '../../../services/stock.api';
import { useAuth } from '../../../contexts/AuthContext';

// --- 2. Eliminar Mocks ---
// const mockInventoryData = [...]; // ELIMINADO

export default function InventoryTab() {
  const { user } = useAuth();

  // --- 3. Estados ---
  const [sessions, setSessions] = useState<InventorySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewInventoryModal, setShowNewInventoryModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);

  // Estados para el modal de "Nuevo"
  const [newInventoryBranch, setNewInventoryBranch] = useState(user?.branchId?.toString() || '');
  const [newInventoryNote, setNewInventoryNote] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Estados para el modal de "Resultados"
  const [selectedSession, setSelectedSession] = useState<InventorySessionDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);

  // Toast (simulado)
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // --- 4. Mapa de Sucursales (simulado) ---
  // Idealmente, esto viene del contexto de Auth con nombres
  const branchMap = new Map<number, string>();
  user?.branchIds?.forEach(id => {
    branchMap.set(id, `Sucursal ${id} (Sim)`);
  });
  const branchOptions = Array.from(branchMap.entries()).map(([id, name]) => ({
    id: id.toString(),
    name: name
  }));

  // --- 5. Funciones de Carga ---
  const fetchSessions = () => {
    setIsLoading(true);
    // Filtramos por la sucursal del usuario si no es admin
    const branchId = user?.branchId; 
    
    getInventorySessions(branchId)
      .then(data => {
        setSessions(data.items);
      })
      .catch(err => {
        console.error(err);
        showToast('Error al cargar inventarios', 'error');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchSessions();
  }, []); // Cargar al montar

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- 6. Lógica de Modales ---

  const resetNewModal = () => {
    setNewInventoryBranch(user?.branchId?.toString() || '');
    setNewInventoryNote('');
    setIsCreating(false);
    setShowNewInventoryModal(false);
  };

  const handleCreateInventory = async () => {
    const branchId = Number(newInventoryBranch);
    if (!branchId) {
      showToast('Seleccione una sucursal', 'error');
      return;
    }
    
    setIsCreating(true);
    const payload: CreateInventoryPayload = {
      branchId,
      note: newInventoryNote || undefined
    };

    try {
      await createInventorySession(payload);
      showToast('Sesión de inventario creada (Borrador)', 'success');
      resetNewModal();
      fetchSessions(); // Recargar lista
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
      setIsCreating(false);
    }
  };


  const handleViewResults = async (session: InventorySession) => {
    setIsLoadingDetails(true);
    setShowResultsModal(true);
    try {
      const details = await getInventorySessionDetails(session.id);
      setSelectedSession(details);
    } catch (err: any) {
      showToast(`Error al cargar detalles: ${err.message}`, 'error');
      setShowResultsModal(false);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCommitInventory = async () => {
    if (!selectedSession || selectedSession.status === 'COMPLETED') return;

    if (!confirm(`¿Está seguro que desea finalizar este inventario? Esta acción ajustará permanentemente el stock. No se puede deshacer.`)) {
      return;
    }
    
    setIsCommitting(true);
    try {
      await commitInventorySession(selectedSession.id);
      showToast('Inventario finalizado y stock ajustado', 'success');
      setShowResultsModal(false);
      setSelectedSession(null);
      fetchSessions(); // Recargar lista
    } catch (err: any) {
      showToast(`Error al finalizar: ${err.message}`, 'error');
    } finally {
      setIsCommitting(false);
    }
  };


  // --- 7. JSX ---

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    };
    const labels = {
      DRAFT: 'Borrador',
      COMPLETED: 'Finalizado'
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
            <h3 className="text-lg font-semibold text-black dark:text-white">Conteos de Inventario</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Inicia y finaliza conteos para ajustar tu stock.
            </p>
          </div>
          <Button onClick={() => setShowNewInventoryModal(true)}>
            <i className="ri-add-line mr-2"></i>
            Nuevo Inventario (I)
          </Button>
        </div>
      </Card>

      {/* Lista de Sesiones */}
      <Card padding="sm">
         <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Fecha</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Referencia/Nota</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Depósito</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Estado</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Ítems</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Usuario</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Finalizado</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                 <tr><td colSpan={8} className="text-center p-8 text-gray-500">Cargando...</td></tr>
              ) : sessions.length === 0 ? (
                 <tr><td colSpan={8} className="text-center p-8 text-gray-500">No se encontraron conteos.</td></tr>
              ) : (
                sessions.map((session) => (
                  <tr
                    key={session.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                  >
                    <td className="py-3 px-4">
                      <span className="text-sm text-black dark:text-white">
                         {new Date(session.createdAt).toLocaleDateString('es-AR')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        {session.ref && <p className="font-medium text-black dark:text-white">{session.ref}</p>}
                        {session.note && <p className="text-xs text-gray-500">{session.note}</p>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-black dark:text-white">{session.branchName}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(session.status)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm text-black dark:text-white">{session.itemsCount}</span>
                    </td>
                    <td className="py-3 px-4">
                       <span className="text-sm text-black dark:text-white">{session.userName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-black dark:text-white">
                        {session.completedAt ? new Date(session.completedAt).toLocaleDateString('es-AR') : '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* El botón de "Contar" abriría otra pantalla (flujo complejo) */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {/* TODO: Ir a la página de conteo */} }
                          disabled={session.status === 'COMPLETED'}
                        >
                          <i className="ri-play-line mr-1"></i>
                          {session.status === 'DRAFT' ? 'Contar' : 'Recontar'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewResults(session)}
                        >
                          <i className="ri-eye-line mr-1"></i>
                          Resultados
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Nuevo Inventario */}
      {showNewInventoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Iniciar Conteo de Inventario</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Depósito a inventariar *
                </label>
                <select
                  value={newInventoryBranch}
                  onChange={(e) => setNewInventoryBranch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white pr-8"
                >
                  <option value="">Seleccionar depósito</option>
                  {branchOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Referencia o Nota (opcional)
                </label>
                <input
                  type="text"
                  value={newInventoryNote}
                  onChange={(e) => setNewInventoryNote(e.target.value)}
                  placeholder="Ej: Conteo fin de mes"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={resetNewModal} disabled={isCreating}>
                Cancelar
              </Button>
              <Button onClick={handleCreateInventory} disabled={isCreating || !newInventoryBranch}>
                {isCreating ? 'Iniciando...' : 'Iniciar Conteo'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Resultados */}
      {showResultsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-black dark:text-white">
                Resultados del Inventario {selectedSession ? `(${selectedSession.branchName})` : ''}
              </h3>
              <button
                onClick={() => setShowResultsModal(false)}
                className="text-gray-500 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingDetails ? (
                <div className="text-center py-8">
                  <i className="ri-loader-4-line animate-spin text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
                  <p className="text-gray-500 dark:text-gray-400">Cargando detalles...</p>
                </div>
              ) : !selectedSession ? (
                <div className="text-center py-8">Error al cargar datos.</div>
              ) : (
                <table className="w-full">
                  <thead>
                     <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Producto</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">SKU</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Esperado</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Contado</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Diferencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSession.items.map(item => {
                      const diff = item.diff ?? 0; // (item.counted ?? 0) - item.expected;
                      const rowColor = diff !== 0 ? 'bg-red-50 dark:bg-red-900/10' : '';
                      const diffColor = diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : '';
                      
                      return (
                        <tr key={item.id} className={`border-b border-gray-100 dark:border-gray-800 ${rowColor}`}>
                          <td className="py-3 px-4 text-sm text-black dark:text-white">
                            {item.productName} {item.variantName && `(${item.variantName})`}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                            {item.variantSku || item.productSku}
                          </td>
                          <td className="py-3 px-4 text-center text-sm text-black dark:text-white">
                            {item.expected}
                          </td>
                          <td className="py-3 px-4 text-center text-sm text-black dark:text-white font-medium">
                            {item.counted ?? <span className="text-gray-400">Sin contar</span>}
                          </td>
                          <td className={`py-3 px-4 text-center text-sm font-medium ${diffColor}`}>
                            {diff > 0 ? `+${diff}` : (diff < 0 ? diff : '-')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedSession?.status === 'DRAFT' 
                  ? 'Revisa las diferencias antes de finalizar.'
                  : 'Este inventario ya fue finalizado.'
                }
              </p>
              <div>
                <Button
                  variant="outline"
                  onClick={() => setShowResultsModal(false)}
                  className="mr-3"
                  disabled={isCommitting}
                >
                  Cerrar
                </Button>
                <Button
                  variant="danger" // Asumimos que tienes un 'danger' o 'primary' fuerte
                  onClick={handleCommitInventory}
                  disabled={isCommitting || selectedSession?.status === 'COMPLETED'}
                >
                  {isCommitting ? 'Finalizando...' : 
                   selectedSession?.status === 'COMPLETED' ? 'Finalizado' : 'Finalizar y Ajustar Stock'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}