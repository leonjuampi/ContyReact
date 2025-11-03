// 1. Imports eliminados: Sidebar, TopBar, useTheme
import { useState, useEffect } from 'react';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import CustomerDetail from './components/CustomerDetail';
import CustomerModal from './components/CustomerModal';
import ImportCSVModal from './components/ImportCSVModal';

interface Customer {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  taxCondition: string;
  balance: number;
  lastPurchase: string;
  priceList: string;
  tags: string[];
  address: string;
  notes: string;
  status: 'active' | 'blocked';
}

const mockCustomers: Customer[] = [
  // ... (tus datos mock no cambian)
  {
    id: '1',
    name: 'María Elena Rodríguez',
    document: '27-45678123-4',
    email: 'maria.rodriguez@email.com',
    phone: '+54 11 4567-8901',
    taxCondition: 'Responsable Inscripto',
    balance: -15750,
    lastPurchase: '2024-01-15',
    priceList: 'Mayorista',
    tags: ['VIP', 'Mayorista'],
    address: 'Av. Corrientes 1234, CABA',
    notes: 'Cliente frecuente, siempre paga en término',
    status: 'active'
  },
  {
    id: '2',
    name: 'Juan Carlos Pérez',
    document: '20-35678912-5',
    email: 'juan.perez@empresa.com',
    phone: '+54 11 5678-9012',
    taxCondition: 'Responsable Inscripto',
    balance: 0,
    lastPurchase: '2024-01-10',
    priceList: 'General',
    tags: ['Comercio'],
    address: 'San Martín 567, Vicente López',
    notes: 'Comercio minorista de barrio',
    status: 'active'
  },
  {
    id: '3',
    name: 'Ana Lucía Fernández',
    document: '27-42345678-9',
    email: 'ana.fernandez@gmail.com',
    phone: '+54 11 6789-0123',
    taxCondition: 'Consumidor Final',
    balance: 8900,
    lastPurchase: '2024-01-12',
    priceList: 'Minorista',
    tags: ['Online'],
    address: 'Belgrano 890, San Isidro',
    notes: 'Compras frecuentes online',
    status: 'active'
  },
  {
    id: '4',
    name: 'Roberto Silva',
    document: '20-28345612-7',
    email: 'roberto.silva@hotmail.com',
    phone: '+54 11 7890-1234',
    taxCondition: 'Monotributista',
    balance: -2500,
    lastPurchase: '2023-10-15',
    priceList: 'General',
    tags: ['Sin compras 90d'],
    address: 'Rivadavia 2345, Caballito',
    notes: 'Cliente hace tiempo sin comprar',
    status: 'active'
  },
  {
    id: '5',
    name: 'Comercial Los Andes SA',
    document: '30-71234567-8',
    email: 'compras@losandes.com.ar',
    phone: '+54 11 8901-2345',
    taxCondition: 'Responsable Inscripto',
    balance: -45000,
    lastPurchase: '2024-01-14',
    priceList: 'Mayorista Plus',
    tags: ['VIP', 'Corporativo'],
    address: 'Av. Santa Fe 4567, Palermo',
    notes: 'Cliente corporativo, pedidos grandes',
    status: 'blocked'
  }
];

const taxConditions = ['Todas', 'Responsable Inscripto', 'Consumidor Final', 'Monotributista', 'Exento'];
const priceLists = ['Todas', 'General', 'Minorista', 'Mayorista', 'Mayorista Plus'];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTaxCondition, setSelectedTaxCondition] = useState('Todas');
  const [showWithDebt, setShowWithDebt] = useState(false);
  const [showNoRecentPurchases, setShowNoRecentPurchases] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  // 2. Hook eliminado: useTheme

  useEffect(() => {
    let filtered = customers;

    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.document.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTaxCondition !== 'Todas') {
      filtered = filtered.filter(customer => customer.taxCondition === selectedTaxCondition);
    }

    if (showWithDebt) {
      filtered = filtered.filter(customer => customer.balance < 0);
    }

    if (showNoRecentPurchases) {
      filtered = filtered.filter(customer => customer.tags.includes('Sin compras 90d'));
    }

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, selectedTaxCondition, showWithDebt, showNoRecentPurchases]);

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
    setSelectedCustomer(customer);
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

  const handleImportCustomers = (importedCustomers: Customer[]) => {
    setCustomers([...customers, ...importedCustomers]);
    setShowImportModal(false);
    showToast(`Se importaron ${importedCustomers.length} clientes exitosamente`, 'success');
  };

  const handleCreateSale = (customerId: string) => {
    console.log('Crear venta para cliente:', customerId);
  };

  const handleAssignPriceList = (customerId: string) => {
    console.log('Asignar lista de precios:', customerId);
  };

  const handleToggleBlock = (customerId: string) => {
    setCustomers(customers.map(c =>
      c.id === customerId
        ? { ...c, status: c.status === 'active' ? 'blocked' : 'active' }
        : c
    ));
  };

  const handleSendStatement = () => {
    console.log('Enviar estado de cuenta');
  };

  const handleSaveCustomer = (customerData: Omit<Customer, 'id' | 'balance' | 'lastPurchase'>) => {
    if (editingCustomer) {
      setCustomers(customers.map(c =>
        c.id === editingCustomer.id
          ? {
              ...c,
              ...customerData,
              id: c.id,
              balance: c.balance,
              lastPurchase: c.lastPurchase
            }
          : c
      ));
      showToast('Cliente actualizado exitosamente', 'success');
    } else {
      const newCustomer: Customer = {
        ...customerData,
        id: Date.now().toString(),
        balance: 0,
        lastPurchase: new Date().toISOString().split('T')[0]
      };
      setCustomers([...customers, newCustomer]);
      showToast('Cliente creado exitosamente', 'success');
    }
    setShowCustomerModal(false);
    setEditingCustomer(null);
  };

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
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const getBalanceBadge = (balance: number) => {
    if (balance === 0) {
      return <span className="text-gray-600 dark:text-gray-400">Sin saldo</span>;
    } else if (balance > 0) {
      return (
        <span className="text-green-600 dark:text-green-400 font-medium">
          A favor: {formatCurrency(balance)}
        </span>
      );
    } else {
      return (
        <span className="text-red-600 dark:text-red-400 font-medium">
          Debe: {formatCurrency(balance)}
        </span>
      );
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
        Activo
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
        Bloqueado
      </span>
    );
  };

  // 3. JSX modificado: Eliminamos los wrappers, Sidebar y TopBar.
  //    Usamos un Fragment (<>) para devolver el contenido y los modales.
  return (
    <>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Clientes</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona tu base de clientes</p>
        </div>

        <Card className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
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

            <div className="flex gap-3">
              <select
                value={selectedTaxCondition}
                onChange={e => setSelectedTaxCondition(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white pr-8"
              >
                {taxConditions.map(condition => (
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
                {filteredCustomers.map(customer => (
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
                            {customer.tags.map(tag => (
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
                      <span className="font-mono text-sm text-black dark:text-white">{customer.document}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-600 dark:text-gray-400">{customer.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-600 dark:text-gray-400">{customer.phone}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-black dark:text-white">{customer.taxCondition}</span>
                    </td>
                    <td className="py-3 px-4 text-right">{getBalanceBadge(customer.balance)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-gray-600 dark:text-gray-400">{formatDate(customer.lastPurchase)}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-black dark:text-white">{customer.priceList}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleCreateSale(customer.id);
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer"
                          title="Crear venta"
                        >
                          <i className="ri-shopping-cart-line"></i>
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleAssignPriceList(customer.id);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                          title="Asignar lista"
                        >
                          <i className="ri-price-tag-3-line"></i>
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleToggleBlock(customer.id);
                          }}
                          className={`p-2 transition-colors cursor-pointer ${
                            customer.status === 'active'
                              ? 'text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                              : 'text-red-600 dark:text-red-400 hover:text-green-600 dark:hover:text-green-400'
                          }`}
                          title={customer.status === 'active' ? 'Bloquear' : 'Desbloquear'}
                        >
                          <i className={customer.status === 'active' ? 'ri-lock-line' : 'ri-lock-unlock-line'}></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8">
              <i className="ri-user-line text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
              <p className="text-gray-500 dark:text-gray-400">No se encontraron clientes</p>
            </div>
          )}
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Atajos: <span className="font-mono">/ Buscar</span> • <span className="font-mono">N Nuevo</span> •{' '}
            <span className="font-mono">Ctrl+E Estado de cuenta</span>
          </p>
        </div>
      </div>

      {showCustomerDetail && selectedCustomer && (
        <CustomerDetail
          customer={selectedCustomer}
          onClose={() => {
            setShowCustomerDetail(false);
            setSelectedCustomer(null);
          }}
          onSendStatement={handleSendStatement}
          onEditCustomer={handleEditCustomer}
        />
      )}

      {showCustomerModal && (
        <CustomerModal
          customer={editingCustomer}
          onClose={() => {
            setShowCustomerModal(false);
            setEditingCustomer(null);
          }}
          onSave={handleSaveCustomer}
        />
      )}

      {showImportModal && (
        <ImportCSVModal onClose={() => setShowImportModal(false)} onImport={handleImportCustomers} />
      )}

      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : toast.type === 'error'
              ? 'bg-red-5 00 text-white'
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