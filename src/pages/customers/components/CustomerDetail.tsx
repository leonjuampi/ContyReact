
import { useState } from 'react';
import Button from '../../../components/base/Button';

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

interface CustomerDetailProps {
  customer: Customer;
  onClose: () => void;
  onSendStatement: () => void;
  onEditCustomer: (customer: Customer) => void;
}

const mockTimeline: TimelineItem[] = [
  {
    id: '1',
    type: 'sale',
    date: '2024-01-15',
    title: 'Venta realizada',
    amount: 25600,
    reference: 'V-0087',
    status: 'Pagado'
  },
  {
    id: '2',
    type: 'payment',
    date: '2024-01-14',
    title: 'Pago recibido',
    amount: 15000,
    reference: 'PAG-0234',
    status: 'Procesado'
  },
  {
    id: '3',
    type: 'quote',
    date: '2024-01-10',
    title: 'Presupuesto enviado',
    amount: 18900,
    reference: 'P-0156',
    status: 'Pendiente'
  },
  {
    id: '4',
    type: 'sale',
    date: '2024-01-05',
    title: 'Venta realizada',
    amount: 12400,
    reference: 'V-0078',
    status: 'Pagado'
  },
  {
    id: '5',
    type: 'note',
    date: '2024-01-03',
    title: 'Nota agregada',
    reference: 'N-001',
    description: 'Cliente solicitó descuento por volumen para próximas compras'
  }
];

interface TimelineItem {
  id: string;
  type: 'sale' | 'quote' | 'payment' | 'note';
  date: string;
  title: string;
  amount?: number;
  reference: string;
  status?: string;
  description?: string;
}

export default function CustomerDetail({ customer, onClose, onSendStatement, onEditCustomer }: CustomerDetailProps) {
  const [activeSection, setActiveSection] = useState('info');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTimelineIcon = (type: string) => {
    const icons = {
      sale: 'ri-shopping-cart-line',
      quote: 'ri-file-text-line',
      payment: 'ri-money-dollar-circle-line',
      note: 'ri-sticky-note-line'
    };
    return icons[type as keyof typeof icons] || 'ri-information-line';
  };

  const getTimelineColor = (type: string, status?: string) => {
    if (type === 'sale' && status === 'Pagado') return 'text-green-600 dark:text-green-400';
    if (type === 'payment') return 'text-blue-600 dark:text-blue-400';
    if (type === 'quote' && status === 'Pendiente') return 'text-yellow-600 dark:text-yellow-400';
    if (type === 'note') return 'text-gray-600 dark:text-gray-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const handleEditClick = () => {
    onEditCustomer(customer);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
              {customer.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-black dark:text-white">{customer.name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{customer.document}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
        >
          <i className="ri-close-line text-xl"></i>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex px-6">
          <button
            onClick={() => setActiveSection('info')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeSection === 'info'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <i className="ri-user-line"></i>
            Información
          </button>
          <button
            onClick={() => setActiveSection('timeline')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeSection === 'timeline'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <i className="ri-history-line"></i>
            Timeline
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeSection === 'info' && (
          <div className="p-6 space-y-6">
            {/* Información fiscal */}
            <div>
              <h3 className="text-sm font-medium text-black dark:text-white mb-3">Datos fiscales</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Condición IVA:</span>
                  <span className="text-sm text-black dark:text-white">{customer.taxCondition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Lista de precios:</span>
                  <span className="text-sm text-black dark:text-white">{customer.priceList}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Estado:</span>
                  <span className={`text-sm font-medium ${
                    customer.status === 'active' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {customer.status === 'active' ? 'Activo' : 'Bloqueado'}
                  </span>
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div>
              <h3 className="text-sm font-medium text-black dark:text-white mb-3">Contacto</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
                  <p className="text-sm text-black dark:text-white mt-1">{customer.email}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Teléfono:</span>
                  <p className="text-sm text-black dark:text-white mt-1">{customer.phone}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Dirección:</span>
                  <p className="text-sm text-black dark:text-white mt-1">{customer.address}</p>
                </div>
              </div>
            </div>

            {/* Saldo y estadísticas */}
            <div>
              <h3 className="text-sm font-medium text-black dark:text-white mb-3">Saldo y estadísticas</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Saldo actual:</span>
                  <span className={`text-sm font-medium ${
                    customer.balance === 0
                      ? 'text-gray-600 dark:text-gray-400'
                      : customer.balance > 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {customer.balance === 0 
                      ? 'Sin saldo'
                      : customer.balance > 0
                      ? `A favor: ${formatCurrency(customer.balance)}`
                      : `Debe: ${formatCurrency(customer.balance)}`
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Última compra:</span>
                  <span className="text-sm text-black dark:text-white">{formatDate(customer.lastPurchase)}</span>
                </div>
              </div>
            </div>

            {/* Etiquetas */}
            <div>
              <h3 className="text-sm font-medium text-black dark:text-white mb-3">Etiquetas</h3>
              <div className="flex flex-wrap gap-2">
                {customer.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div>
              <h3 className="text-sm font-medium text-black dark:text-white mb-3">Notas</h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {customer.notes || 'Sin notas registradas'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'timeline' && (
          <div className="p-6">
            <div className="space-y-4">
              {mockTimeline.map((item, index) => (
                <div key={item.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      <i className={`${getTimelineIcon(item.type)} text-sm ${
                        index === 0 ? 'text-white dark:text-black' : getTimelineColor(item.type, item.status)
                      }`}></i>
                    </div>
                    {index < mockTimeline.length - 1 && (
                      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mt-2"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-sm font-medium text-black dark:text-white">{item.title}</h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(item.date)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">{item.reference}</span>
                      {item.status && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.status === 'Pagado' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          item.status === 'Procesado' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}>
                          {item.status}
                        </span>
                      )}
                    </div>
                    
                    {item.amount && (
                      <p className="text-sm font-medium text-black dark:text-white">
                        {formatCurrency(item.amount)}
                      </p>
                    )}
                    
                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-3">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="font-medium rounded-lg transition-colors duration-200 cursor-pointer whitespace-nowrap flex items-center justify-center border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 text-sm w-full"
          >
            <i className="ri-edit-line mr-2"></i>
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}
