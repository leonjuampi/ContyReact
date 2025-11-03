import { useState, useEffect } from 'react';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import CustomerDetail from './components/CustomerDetail';
import CustomerModal from './components/CustomerModal';
import ImportCSVModal from './components/ImportCSVModal';

// 1. Importar los servicios de la API y las interfaces
import { 
  Customer, 
  getCustomers,
  createCustomer, 
  updateCustomer, 
  deleteCustomer, // (Aún no lo usamos, pero está listo)
  downloadCustomerTemplate,
  importCustomersCSV,
  CustomerPayload, 
  CustomerListResponse
} from '../../services/customer.api';

// 2. Mapeo de valores (Frontend <-> Backend)
// Tu frontend usa "Responsable Inscripto", tu API usa "RI"
const taxConditionApiMap: Record<string, string> = {
  'Todas': '',
  'Responsable Inscripto': 'RI',
  'Consumidor Final': 'CF',
  'Monotributista': 'MT',
  'Exento': 'EX'
};
// Mapeo inverso para mostrar en la UI
const taxConditionDisplayMap: Record<string, string> = {
  'RI': 'Responsable Inscripto',
  'CF': 'Consumidor Final',
  'MT': 'Monotributista',
  'EX': 'Exento'
};
// Mapeo de Estatus
const statusApiMap: Record<string, string> = {
  'Todos': '',
  'Activo': 'ACTIVE',
  'Bloqueado': 'BLOCKED'
};

// const priceLists = ['Todas', 'General', 'Minorista', 'Mayorista', 'Mayorista Plus'];
// TODO: Cargar 'priceLists' desde la API (GET /api/pricelists)
// Por ahora, usaremos los IDs fijos en el modal.

export default function CustomersPage() {
  
  // 3. Modifica los estados para recibir datos de la API
  const [customers, setCustomers] = useState<Customer[]>([]); // Inicia vacío
  const [isLoading, setIsLoading] = useState(true);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  
  // Estados de filtros (sin cambios)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTaxCondition, setSelectedTaxCondition] = useState('Todas');
  const [showWithDebt, setShowWithDebt] = useState(false);
  const [showNoRecentPurchases, setShowNoRecentPurchases] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('Todos'); // Estado que faltaba
  
  // Estados de Modales (sin cambios)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  
  // 4. Función para cargar clientes desde la API
  const fetchCustomers = () => {
    setIsLoading(true);
    
    // Mapea los filtros del estado a lo que la API espera
    const filters = {
      search: searchTerm || undefined,
      status: statusApiMap[selectedStatus] || undefined,
      taxCondition: taxConditionApiMap[selectedTaxCondition] || undefined,
      withDebt: showWithDebt || undefined,
      noPurchasesDays: showNoRecentPurchases ? 90 : undefined,
      page: currentPage,
      pageSize: pageSize
    };

    getCustomers(filters)
      .then((data: CustomerListResponse) => {
        setCustomers(data.items);
        setTotalCustomers(data.total);
      })
      .catch(error => {
        console.error('Error fetching customers:', error);
        showToast(`Error al cargar clientes: ${error.message}`, 'error');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // 5. useEffect para cargar/filtrar datos
  //    (Reemplaza tu useEffect de filtrado local)
  useEffect(() => {
    // Usamos un 'debounce' (retraso) para no llamar a la API en cada tecla
    const timerId = setTimeout(() => {
      // Reiniciamos a la página 1 si el filtro cambia
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchCustomers();
      }
    }, 300); // 300ms de espera

    return () => clearTimeout(timerId);
  }, [searchTerm, selectedTaxCondition, selectedStatus, showWithDebt, showNoRecentPurchases]);

  // useEffect para paginación
  useEffect(() => {
    fetchCustomers();
  }, [currentPage]);
  

  // Atajos de teclado (sin cambios)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        document.getElementById('customer-search')?.focus();
      } else if (e.key === 'n' || e.key === 'N') {
        if (!e.ctrlKey && !e.altKey) {
          e.preventDefault();
          handleNewCustomer();
        }
      } else if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        handleSendStatement();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCustomerClick = (customer: Customer) => {
    // Podríamos cargar el detalle completo aquí
    // getCustomerById(customer.id).then(fullCustomer => {
    //   setSelectedCustomer(fullCustomer);
    //   setShowCustomerDetail(true);
    // }).catch(e => showToast(e.message, 'error'));
    setSelectedCustomer(customer); // Por ahora usamos los datos de la lista
    setShowCustomerDetail(true);
  };

  const handleNewCustomer = () => {
    setEditingCustomer(null);
    setShowCustomerModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowCustomerModal(true);
  };

  const handleImportCSV = () => {
    setShowImportModal(true);
  };

  // 6. Conectar la importación de CSV
  const handleImportCustomers = async (file: File) => {
    setIsLoading(true);
    try {
      const result = await importCustomersCSV(file);
      let message = `Importación completada: ${result.successCount} creados.`;
      if (result.errorCount > 0) {
        message += ` ${result.errorCount} errores.`;
        console.error('Errores de importación:', result.errors);
      }
      showToast(message, result.errorCount > 0 ? 'info' : 'success');
      fetchCustomers(); // Recargar lista
    } catch (error: any) {
      showToast(`Error al importar: ${error.message}`, 'error');
    } finally {
      setShowImportModal(false);
      setIsLoading(false);
    }
  };

  // 7. Conectar la descarga de plantilla
  const handleDownloadTemplate = async () => {
    try {
      await downloadCustomerTemplate();
    } catch (error: any) {
      showToast(`Error al descargar plantilla: ${error.message}`, 'error');
    }
  };


  const handleCreateSale = (customerId: string | number) => {
    e.stopPropagation();
    console.log('Crear venta para cliente:', customerId);
    // Idealmente: navigate(`/ventas?clienteId=${customerId}`);
  };

  const handleAssignPriceList = (customerId: string | number) => {
    e.stopPropagation();
    console.log('Asignar lista de precios:', customerId);
  };

  // 8. Conectar la lógica de Bloquear/Activar (PUT)
  const handleToggleBlock = async (e: React.MouseEvent, customer: Customer) => {
    e.stopPropagation(); // Evitar que se abra el detalle
    
    const newStatus = customer.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    
    try {
      await updateCustomer(customer.id, { status: newStatus });
      showToast(`Cliente ${newStatus === 'ACTIVE' ? 'activado' : 'bloqueado'}`, 'success');
      
      // Actualizar solo este cliente en el estado local (más rápido que un refetch)
      setCustomers(prev => 
        prev.map(c => c.id === customer.id ? { ...c, status: newStatus } : c)
      );

    } catch (error: any) {
      showToast(`Error al cambiar estado: ${error.message}`, 'error');
    }
  };

  const handleSendStatement = () => {
    console.log('Enviar estado de cuenta');
  };

  // 9. Conectar el guardado (POST / PUT)
  const handleSaveCustomer = async (formData: Omit<Customer, 'id' | 'balance' | 'lastPurchase' | 'priceListName' | 'lastPurchaseAt'>) => {
    
    // Mapear datos del Form (Frontend) al Payload (Backend)
    // El modal usa "document" pero la API "taxId"
    // El modal usa "Responsable Inscripto" pero la API "RI"
    // El modal usa "active" pero la API "ACTIVE"
    
    // ❗️ ATENCIÓN: priceListId está fijo. Necesitamos un GET /api/pricelists
    // para llenar el dropdown en el modal y obtener el ID correcto.
    // Por ahora, asumimos que 'General' = 1, 'Mayorista' = 2, etc.
    const priceListIdMap: Record<string, number> = {
      'General': 1,
      'Minorista': 2,
      'Mayorista': 3,
      'Mayorista Plus': 4
    };
    
    const payload: CustomerPayload = {
      name: formData.name,
      taxId: formData.document, // Mapeo
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      taxCondition: taxConditionApiMap[formData.taxCondition] as CustomerPayload['taxCondition'], // Mapeo
      status: formData.status.toUpperCase() as CustomerPayload['status'], // Mapeo
      notes: formData.notes,
      tags: formData.tags,
      priceListId: priceListIdMap[formData.priceList] || 1 // <-- Mapeo temporal
    };

    try {
      if (editingCustomer) {
        // --- Llamar a la API para ACTUALIZAR ---
        await updateCustomer(editingCustomer.id, payload);
        showToast('Cliente actualizado exitosamente', 'success');
      } else {
        // --- Llamar a la API para CREAR ---
        await createCustomer(payload);
        showToast('Cliente creado exitosamente', 'success');
      }
      
      // Cerrar modal y recargar la lista
      setShowCustomerModal(false);
      setEditingCustomer(null);
      fetchCustomers(); 

    } catch (error: any) {
      console.error('Error al guardar cliente:', error);
      showToast(`Error al guardar: ${error.message}`, 'error');
    }
  };
  
  // --- (Funciones de formato no cambian) ---
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const getBalanceBadge = (balance: number) => {
    if (balance === 0) {
      return <span className="text-gray-600 dark:text-gray-400">Sin saldo</span>;
    } else if (balance < 0) { // Asumo que negativo es "Debe"
      return (
        <span className="text-red-600 dark:text-red-400 font-medium">
          Debe: {formatCurrency(balance)}
        </span>
      );
    } else {
      return (
        <span className="text-green-600 dark:text-green-400 font-medium">
          A favor: {formatCurrency(balance)}
        </span>
      );
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'ACTIVE' ? (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
        Activo
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
        Bloqueado
      </span>
    );
  };
  
  // --- (Inicio del JSX) ---
  return (
    <>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Clientes</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona tu base de clientes</p>
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
                  id="customer-search"
                  type="text"
                  placeholder="Buscar por nombre, CUIT/DNI, email o teléfono... (Tecla /)"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-3">
              <select
                value={selectedTaxCondition}
                onChange={e => setSelectedTaxCondition(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white pr-8"
              >
                {Object.keys(taxConditionApiMap).map(condition => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showWithDebt}
                  onChange={e => setShowWithDebt(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-black dark:text-white whitespace-nowrap">Con deuda</span>
              </label>

              <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showNoRecentPurchases}
                  onChange={e => setShowNoRecentPurchases(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-black dark:text-white whitespace-nowrap">Sin compras 90d</span>
              </label>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2">
              <Button variant="primary" onClick={handleNewCustomer}>
                <i className="ri-add-line mr-2"></i>
                Nuevo (N)
              </Button>
              <Button variant="outline" onClick={handleImportCSV}>
                <i className="ri-upload-line mr-2"></i>
                Importar CSV
              </Button>
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Nombre
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    CUIT/DNI
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Teléfono
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Condición IVA
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Saldo/Deuda
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Última compra
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Lista de precios
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr
                    key={customer.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer"
                    onClick={() => handleCustomerClick(customer)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-black dark:text-white">{customer.name}</div>
                          <div className="flex gap-1 mt-1">
                            {customer.tags?.map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-black dark:text-white">{customer.taxId}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-600 dark:text-gray-400">{customer.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-600 dark:text-gray-400">{customer.phone}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-black dark:text-white">
                        {taxConditionDisplayMap[customer.taxCondition] || customer.taxCondition}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">{getBalanceBadge(customer.balance || 0)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-gray-600 dark:text-gray-400">{formatDate(customer.lastPurchaseAt || '')}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-black dark:text-white">{customer.priceListName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateSale(customer.id);
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer"
                          title="Crear venta"
                        >
                          <i className="ri-shopping-cart-line"></i>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssignPriceList(customer.id);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                          title="Asignar lista"
                        >
                          <i className="ri-price-tag-3-line"></i>
                        </button>
                        <button
                          onClick={(e) => handleToggleBlock(e, customer)}
                          className={`p-2 transition-colors cursor-pointer ${
                            customer.status === 'ACTIVE'
                              ? 'text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                              : 'text-red-600 dark:text-red-400 hover:text-green-600 dark:hover:text-green-400'
                          }`}
                          title={customer.status === 'ACTIVE' ? 'Bloquear' : 'Desbloquear'}
                        >
                          <i className={customer.status === 'ACTIVE' ? 'ri-lock-line' : 'ri-lock-unlock-line'}></i>
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
              <p className="text-gray-500 dark:text-gray-400">Cargando clientes...</p>
            </div>
          )}

          {!isLoading && customers.length === 0 && (
            <div className="text-center py-8">
              <i className="ri-user-line text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
              <p className="text-gray-500 dark:text-gray-400">No se encontraron clientes</p>
            </div>
          )}
        </Card>

        {/* 10. TODO: Paginación */}
        {/* Aquí deberías agregar botones de paginación que actualicen 'currentPage' */}
        {/*
        <div className="flex justify-center mt-6">
          <Button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>Anterior</Button>
          <span className="p-2">{currentPage} / {Math.ceil(totalCustomers / pageSize)}</span>
          <Button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage * pageSize >= totalCustomers}>Siguiente</Button>
        </div>
        */}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Atajos: <span className="font-mono">/ Buscar</span> • <span className="font-mono">N Nuevo</span> •{' '}
            <span className="font-mono">Ctrl+E Estado de cuenta</span>
          </p>
        </div>
      </div>

      {/* 11. Modales (No cambian, pero los handlers que les pasamos SÍ) */}
      {showCustomerDetail && selectedCustomer && (
        <CustomerDetail
          customer={selectedCustomer}
          onClose={() => {
            setShowCustomerDetail(false);
            setSelectedCustomer(null);
          }}
          onSendStatement={handleSendStatement}
          onEditCustomer={handleEditCustomer} // <-- Ya estaba
        />
      )}

      {showCustomerModal && (
        <CustomerModal
          customer={editingCustomer}
          onClose={() => {
            setShowCustomerModal(false);
            setEditingCustomer(null);
          }}
          onSave={handleSaveCustomer} // <-- Ahora llama a la API
        />
      )}

      {showImportModal && (
        <ImportCSVModal 
          onClose={() => setShowImportModal(false)} 
          onImport={handleImportCustomers} // <-- Ahora sube el archivo
          onDownloadTemplate={handleDownloadTemplate} // <-- Ahora descarga de la API
        />
      )}

      {/* ... (Tu Toast no cambia) ... */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : toast.type === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            <i
              className={`${
                toast.type === 'success'
                  ? 'ri-check-line'
                  : toast.type === 'error'
                  ? 'ri-error-warning-line'
                  : 'ri-information-line'
              }`}
            ></i>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </>
  );
}