import { useState, useEffect, useRef } from 'react';
// import Sidebar from '../../components/feature/Sidebar'; // <--- ELIMINADO
// import TopBar from '../../components/feature/TopBar'; // <--- ELIMINADO
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import QuoteEditor from './components/QuoteEditor';

interface Quote {
  id: string;
  number: string;
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  total: number;
  validUntil: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'expired' | 'converted';
  createdAt: string;
  items: QuoteItem[];
  notes?: string;
  timeline: TimelineEvent[];
}

interface QuoteItem {
  id: string;
  product: {
    id: string;
    name: string;
    sku: string;
    price: number;
  };
  quantity: number;
  unitPrice: number;
  discount: number;
  discountType: 'percentage' | 'amount';
  subtotal: number;
}

interface TimelineEvent {
  date: string;
  type: 'created' | 'sent' | 'viewed' | 'accepted' | 'expired' | 'converted';
  description: string;
  user?: string;
}

const mockQuotes: Quote[] = [
  // ... (tus datos mock no cambian)
  {
    id: '1',
    number: 'PRES-2024-001',
    client: {
      id: 'C001',
      name: 'María González',
      email: 'maria@email.com',
      phone: '+54 11 1234-5678'
    },
    total: 145000,
    validUntil: '2024-02-15',
    status: 'sent',
    createdAt: '2024-01-20',
    items: [
      {
        id: '1',
        product: { id: 'P001', name: 'Camisa Manga Larga Blanca', sku: 'CAM001', price: 5500 },
        quantity: 2,
        unitPrice: 5500,
        discount: 10,
        discountType: 'percentage',
        subtotal: 9900
      }
    ],
    notes: 'Cliente interesado en pedido mensual',
    timeline: [
      { date: '2024-01-20', type: 'created', description: 'Presupuesto creado', user: 'Juan Pérez' },
      { date: '2024-01-20', type: 'sent', description: 'Enviado por email', user: 'Juan Pérez' }
    ]
  },
  {
    id: '2',
    number: 'PRES-2024-002',
    client: {
      id: 'C002',
      name: 'Carlos Rodríguez',
      email: 'carlos@email.com',
      phone: '+54 11 2345-6789'
    },
    total: 89900,
    validUntil: '2024-02-20',
    status: 'accepted',
    createdAt: '2024-01-18',
    items: [],
    timeline: [
      { date: '2024-01-18', type: 'created', description: 'Presupuesto creado', user: 'María Silva' },
      { date: '2024-01-18', type: 'sent', description: 'Enviado por WhatsApp', user: 'María Silva' },
      { date: '2024-01-19', type: 'viewed', description: 'Cliente visualizó el presupuesto' },
      { date: '2024-01-21', type: 'accepted', description: 'Presupuesto aceptado por el cliente' }
    ]
  }
];

const statusTabs = [
  // ... (tus datos de tabs no cambian)
  { id: 'all', label: 'Todos', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
  { id: 'draft', label: 'Borrador', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' },
  { id: 'sent', label: 'Enviado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
  { id: 'viewed', label: 'Visto', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' },
  { id: 'accepted', label: 'Aceptado', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
  { id: 'expired', label: 'Vencido', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
  { id: 'converted', label: 'Convertido', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400' }
];

export default function QuotesPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [quotes, setQuotes] = useState<Quote[]>(mockQuotes);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>(mockQuotes);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let filtered = quotes;

    if (activeTab !== 'all') {
      filtered = filtered.filter(quote => quote.status === activeTab);
    }

    if (searchTerm) {
      filtered = filtered.filter(quote =>
        quote.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.client.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredQuotes(filtered);
  }, [quotes, activeTab, searchTerm]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'n' || e.key === 'N') {
        if (!e.ctrlKey && !e.altKey) {
          e.preventDefault();
          handleNewQuote();
        }
      } else if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        // Enviar presupuesto actual
        console.log('Enviar presupuesto');
      } else if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        // Descargar PDF
        console.log('Descargar PDF');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNewQuote = () => {
    setSelectedQuote(null);
    setShowEditor(true);
  };

  const handleEditQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setShowEditor(true);
  };

  const handleDuplicate = (quote: Quote) => {
    const newQuote: Quote = {
      ...quote,
      id: Date.now().toString(),
      number: `PRES-2024-${String(quotes.length + 1).padStart(3, '0')}`,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      timeline: [
        { date: new Date().toISOString().split('T')[0], type: 'created', description: 'Presupuesto duplicado', user: 'Usuario Actual' }
      ]
    };
    setQuotes([newQuote, ...quotes]);
  };

  const handleCancel = (quoteId: string) => {
    setQuotes(quotes.map(q => 
      q.id === quoteId ? { ...q, status: 'expired' as const } : q
    ));
  };

  const getStatusBadge = (status: string) => {
    const tab = statusTabs.find(t => t.id === status);
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${tab?.color || 'bg-gray-100 text-gray-800'}`}>
        {tab?.label || status}
      </span>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  if (showEditor) {
    return (
      <QuoteEditor
        quote={selectedQuote}
        onClose={() => {
          setShowEditor(false);
          setSelectedQuote(null);
        }}
        onSave={(quoteData) => {
          if (selectedQuote) {
            setQuotes(quotes.map(q => 
              q.id === selectedQuote.id ? { ...q, ...quoteData } : q
            ));
          } else {
            const newQuote: Quote = {
              ...quoteData,
              id: Date.now().toString(),
              number: `PRES-2024-${String(quotes.length + 1).padStart(3, '0')}`,
              createdAt: new Date().toISOString().split('T')[0],
              timeline: [
                { date: new Date().toISOString().split('T')[0], type: 'created', description: 'Presupuesto creado', user: 'Usuario Actual' }
              ]
            };
            setQuotes([newQuote, ...quotes]);
          }
          setShowEditor(false);
          setSelectedQuote(null);
        }}
      />
    );
  }

  // 3. JSX modificado: Se quitan los wrappers, Sidebar y TopBar.
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Presupuestos</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona cotizaciones y propuestas comerciales</p>
        </div>
        <Button onClick={handleNewQuote}>
          <i className="ri-add-line mr-2"></i>
          Nuevo Presupuesto (N)
        </Button>
      </div>

      {/* Tabs de estado */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-1">
            {statusTabs.map(tab => {
              const count = tab.id === 'all' ? quotes.length : quotes.filter(q => q.status === tab.id).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="ri-search-line text-gray-400"></i>
              </div>
              <input
                type="text"
                placeholder="Buscar presupuestos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 text-sm"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Lista de presupuestos */}
      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">N°</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Cliente</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Total</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Validez</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Estado</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.map((quote) => (
                <tr
                  key={quote.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                >
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm text-black dark:text-white">{quote.number}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-black dark:text-white">{quote.client.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{quote.client.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-medium text-black dark:text-white">{formatPrice(quote.total)}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="text-sm">
                      <p className={`${isExpired(quote.validUntil) ? 'text-red-600 dark:text-red-400' : 'text-black dark:text-white'}`}>
                        {new Date(quote.validUntil).toLocaleDateString('es-AR')}
                      </p>
                      {isExpired(quote.validUntil) && (
                        <p className="text-xs text-red-500">Vencido</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(quote.status)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditQuote(quote)}
                        className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                        title="Ver / Editar"
                      >
                        <i className="ri-eye-line"></i>
                      </button>
                      <button
                        onClick={() => handleDuplicate(quote)}
                        className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                        title="Duplicar"
                      >
                        <i className="ri-file-copy-line"></i>
                      </button>
                      {quote.status !== 'converted' && quote.status !== 'expired' && (
                        <button
                          onClick={() => handleCancel(quote.id)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                          title="Cancelar"
                        >
                          <i className="ri-close-circle-line"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredQuotes.length === 0 && (
          <div className="text-center py-8">
            <i className="ri-file-text-line text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
            <p className="text-gray-500 dark:text-gray-400">No se encontraron presupuestos</p>
            <Button onClick={handleNewQuote} className="mt-4">
              Crear primer presupuesto
            </Button>
          </div>
        )}
      </Card>

      {/* Atajos de teclado */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Atajos: <span className="font-mono">N Nuevo</span> • <span className="font-mono">Ctrl+Enter Enviar</span> • 
          <span className="font-mono">Ctrl+D PDF</span>
        </p>
      </div>
    </div>
  );
}