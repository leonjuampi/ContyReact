
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import Sidebar from '../../components/feature/Sidebar';
import TopBar from '../../components/feature/TopBar';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import DateRangeModal from './components/DateRangeModal';
import ScheduleEmailModal from './components/ScheduleEmailModal';
import SaveViewModal from './components/SaveViewModal';
import TransactionDetailModal from './components/TransactionDetailModal';
import CashWithdrawalModal from './components/CashWithdrawalModal';
import CashCountModal from './components/CashCountModal';
import CashCloseModal from './components/CashCloseModal';

export default function Reports() {
  const [activeItem, setActiveItem] = useState('reports');
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [showDateModal, setShowDateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showCashCountModal, setShowCashCountModal] = useState(false);
  const [showCashCloseModal, setShowCashCloseModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [currentCashAmount, setCurrentCashAmount] = useState(12450);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  // Estado de filtros que faltaba
  const [filters, setFilters] = useState({
    dateRange: 'Últimos 7 días',
    granularity: 'Día',
    branch: 'Todas',
    seller: 'Todos',
    category: 'Todas',
    product: 'Todos',
    customer: 'Todos',
    paymentMethod: 'Todos',
    channel: 'Todos',
    priceList: 'Todas'
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCashWithdrawal = () => {
    setShowWithdrawalModal(true);
  };

  const handleConfirmWithdrawal = (data: {
    amount: number;
    reason: string;
    notes: string;
    requiresAuthorization: boolean;
  }) => {
    if (data.requiresAuthorization) {
      showToast('Retiro pendiente de autorización del supervisor', 'info');
    } else {
      setCurrentCashAmount(prev => prev - data.amount);
      showToast(`Retiro de $${data.amount.toLocaleString()} registrado exitosamente`, 'success');
    }
    setShowWithdrawalModal(false);
  };

  const handleCashCount = () => {
    setShowCashCountModal(true);
  };

  const handleConfirmCashCount = (data: {
    expectedAmount: number;
    countedAmount: number;
    difference: number;
    denominations: { [key: string]: number };
    notes: string;
    isIntermediateCount: boolean;
  }) => {
    if (data.difference !== 0) {
      if (data.difference > 0) {
        showToast(`Arqueo registrado: Diferencia de +$${Math.abs(data.difference).toLocaleString()}`, 'info');
      } else {
        showToast(`Arqueo registrado: Diferencia de -$${Math.abs(data.difference).toLocaleString()}`, 'info');
      }
    } else {
      showToast('Arqueo registrado: Conteo exacto', 'success');
    }
    
    setShowCashCountModal(false);
  };

  const handleCashClose = () => {
    setShowCashCloseModal(true);
  };

  const handleConfirmCashClose = (data: {
    expectedAmount: number;
    countedAmount: number;
    difference: number;
    denominations: { [key: string]: number };
    notes: string;
    requiresAdjustment: boolean;
    closingData: {
      totalSales: number;
      totalWithdrawals: number;
      finalBalance: number;
    };
  }) => {
    if (data.requiresAdjustment) {
      if (data.difference > 0) {
        showToast(`Caja cerrada: Sobrante de $${Math.abs(data.difference).toLocaleString()}`, 'info');
      } else {
        showToast(`Caja cerrada: Faltante de $${Math.abs(data.difference).toLocaleString()}`, 'error');
      }
    } else {
      showToast('Caja cerrada exitosamente: Arqueo exacto', 'success');
    }
    
    // Actualizar el monto actual
    setCurrentCashAmount(data.countedAmount);
    setShowCashCloseModal(false);
  };

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
  };

  const handleNewSale = () => {
    navigate('/ventas');
  };

  const handleApplyFilters = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const handleClearFilters = () => {
    setFilters({
      dateRange: 'Últimos 7 días',
      granularity: 'Día',
      branch: 'Todas',
      seller: 'Todos',
      category: 'Todas',
      product: 'Todos',
      customer: 'Todos',
      paymentMethod: 'Todos',
      channel: 'Todos',
      priceList: 'Todas'
    });
    setCompareMode(false);
  };

  const handleExport = (format: 'CSV' | 'PDF') => {
    try {
      console.log(`Exportando en formato ${format}`);
    } catch (error) {
      console.error('Error al exportar:', error);
    }
  };

  const handleSaveView = () => {
    setShowSaveViewModal(true);
  };

  const handleScheduleEmail = () => {
    setShowScheduleModal(true);
  };

  const handleTransactionClick = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        handleExport('CSV');
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setCompareMode(!compareMode);
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleSaveView();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        handleScheduleEmail();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [compareMode]);

  const kpis = [
    {
      title: 'Total Vendido',
      value: '$125,847',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: 'ri-money-dollar-circle-line',
      description: 'Suma total de ventas en el período seleccionado'
    },
    {
      title: 'Cantidad de Ventas',
      value: '456',
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: 'ri-shopping-cart-line',
      description: 'Número total de transacciones realizadas'
    },
    {
      title: 'Ticket Promedio',
      value: '$276.05',
      change: '+3.8%',
      changeType: 'positive' as const,
      icon: 'ri-calculator-line',
      description: 'Valor promedio por transacción'
    },
    {
      title: 'Margen Bruto',
      value: '34.2%',
      change: '-1.2%',
      changeType: 'negative' as const,
      icon: 'ri-percent-line',
      description: 'Porcentaje de ganancia sobre las ventas'
    },
    {
      title: 'Unidades Vendidas',
      value: '2,847',
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: 'ri-box-3-line',
      description: 'Total de productos vendidos'
    }
  ];

  const topProducts = [
    { name: 'Smartphone Galaxy S24', quantity: 45, total: '$13,500', margin: '28.5%', rotation: 'Alta' },
    { name: 'Auriculares Bluetooth', quantity: 32, total: '$4,800', margin: '42.1%', rotation: 'Media' },
    { name: 'Tablet Android 12"', quantity: 28, total: '$8,400', margin: '35.7%', rotation: 'Alta' },
    { name: 'Smartwatch Series 9', quantity: 24, total: '$7,200', margin: '31.2%', rotation: 'Media' },
    { name: 'Cargador Inalámbrico', quantity: 19, total: '$1,900', margin: '55.8%', rotation: 'Baja' }
  ];

  const topCustomers = [
    { name: 'Empresa Tech Solutions SA', total: '$8,450', avgTicket: '$845', lastPurchase: '2 días', frequency: 'Semanal' },
    { name: 'María González', total: '$3,280', avgTicket: '$410', lastPurchase: '1 día', frequency: 'Quincenal' },
    { name: 'Carlos Rodríguez', total: '$2,890', avgTicket: '$289', lastPurchase: '3 días', frequency: 'Mensual' },
    { name: 'Tech Store Mayorista', total: '$12,500', avgTicket: '$2,500', lastPurchase: '1 semana', frequency: 'Mensual' },
    { name: 'Ana Martínez', total: '$1,650', avgTicket: '$330', lastPurchase: '5 días', frequency: 'Mensual' }
  ];

  const transactions = [
    { id: 'VTA-001', date: '15/01/2024 14:30', customer: 'María González', seller: 'Juan Pérez', items: 3, total: '$450', margin: '32%', payment: 'Efectivo', channel: 'Local', branch: 'Sucursal Centro' },
    { id: 'VTA-002', date: '15/01/2024 15:45', customer: 'Carlos López', seller: 'Ana García', items: 1, total: '$280', margin: '28%', payment: 'Tarjeta', channel: 'Local', branch: 'Sucursal Norte' },
    { id: 'VTA-003', date: '15/01/2024 16:20', customer: 'Tech Solutions', seller: 'Pedro Ruiz', items: 5, total: '$1,250', margin: '35%', payment: 'Transferencia', channel: 'E-commerce', branch: 'Online' },
    { id: 'VTA-004', date: '15/01/2024 17:10', customer: 'Laura Fernández', seller: 'Juan Pérez', items: 2, total: '$380', margin: '30%', payment: 'Tarjeta', channel: 'Local', branch: 'Sucursal Centro' }
  ];

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-950 ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar activeItem={activeItem} onItemClick={handleItemClick} />
      
      <div className="ml-64">
        <TopBar 
          title="Reportes"
          onNewSale={handleNewSale}
        />
        
        <main className="p-6">
          {/* Header de Filtros - Sticky */}
          <div className="sticky top-0 z-30 bg-gray-50 dark:bg-gray-950 pb-6 -mt-6 pt-6">
            <Card className="mb-6">
              <div className="space-y-4">
                {/* Primera fila de filtros */}
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Período
                    </label>
                    <button
                      onClick={() => setShowDateModal(true)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-left bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer"
                    >
                      {filters.dateRange}
                      <div className="w-4 h-4 float-right mt-0.5 flex items-center justify-center">
                        <i className="ri-calendar-line text-gray-400"></i>
                      </div>
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Granularidad
                    </label>
                    <select 
                      value={filters.granularity}
                      onChange={(e) => setFilters({...filters, granularity: e.target.value})}
                      className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer"
                    >
                      <option>Día</option>
                      <option>Semana</option>
                      <option>Mes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sucursal
                    </label>
                    <select 
                      value={filters.branch}
                      onChange={(e) => setFilters({...filters, branch: e.target.value})}
                      className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer"
                    >
                      <option>Todas</option>
                      <option>Sucursal Centro</option>
                      <option>Sucursal Norte</option>
                      <option>Sucursal Sur</option>
                      <option>Online</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Vendedor
                    </label>
                    <select 
                      value={filters.seller}
                      onChange={(e) => setFilters({...filters, seller: e.target.value})}
                      className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer"
                    >
                      <option>Todos</option>
                      <option>Juan Pérez</option>
                      <option>Ana García</option>
                      <option>Pedro Ruiz</option>
                      <option>María López</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categoría
                    </label>
                    <select 
                      value={filters.category}
                      onChange={(e) => setFilters({...filters, category: e.target.value})}
                      className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer"
                    >
                      <option>Todas</option>
                      <option>Electrónicos</option>
                      <option>Accesorios</option>
                      <option>Telefonía</option>
                      <option>Computación</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Canal
                    </label>
                    <select 
                      value={filters.channel}
                      onChange={(e) => setFilters({...filters, channel: e.target.value})}
                      className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer"
                    >
                      <option>Todos</option>
                      <option>Local</option>
                      <option>E-commerce</option>
                      <option>WhatsApp</option>
                      <option>Teléfono</option>
                    </select>
                  </div>
                </div>

                {/* Toggle de comparación */}
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={compareMode}
                      onChange={(e) => setCompareMode(e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-black dark:text-white focus:ring-black dark:focus:ring-white"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Comparar con período anterior
                    </span>
                  </label>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={handleApplyFilters}
                      disabled={isLoading}
                      className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 flex items-center justify-center mr-2">
                            <i className="ri-loader-4-line animate-spin"></i>
                          </div>
                          Aplicando...
                        </>
                      ) : (
                        'Aplicar'
                      )}
                    </Button>
                    
                    <Button
                      onClick={handleClearFilters}
                      variant="outline"
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    >
                      Limpiar
                    </Button>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={handleSaveView}
                      variant="outline"
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    >
                      <div className="w-4 h-4 flex items-center justify-center mr-2">
                        <i className="ri-bookmark-line"></i>
                      </div>
                      Guardar Vista
                    </Button>

                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                      <Button
                        onClick={() => handleExport('CSV')}
                        variant="outline"
                        className="border-0 rounded-r-none border-r border-gray-300 dark:border-gray-600"
                      >
                        <div className="w-4 h-4 flex items-center justify-center mr-2">
                          <i className="ri-file-excel-line"></i>
                        </div>
                        CSV
                      </Button>
                      <Button
                        onClick={() => handleExport('PDF')}
                        variant="outline"
                        className="border-0 rounded-l-none"
                      >
                        <div className="w-4 h-4 flex items-center justify-center mr-2">
                          <i className="ri-file-pdf-line"></i>
                        </div>
                        PDF
                      </Button>
                    </div>

                    <Button
                      onClick={handleScheduleEmail}
                      variant="outline"
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    >
                      <div className="w-4 h-4 flex items-center justify-center mr-2">
                        <i className="ri-mail-send-line"></i>
                      </div>
                      Programar Email
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {isLoading ? (
            // Loading Skeletons
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 rounded-lg p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                {kpis.map((kpi, index) => (
                  <Card key={index} className="relative group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {kpi.title}
                          </p>
                          <div className="w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <i className="ri-information-line text-gray-400 cursor-help" title={kpi.description}></i>
                          </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                          {kpi.value}
                        </p>
                        <div className="flex items-center space-x-1">
                          <div className={`w-4 h-4 flex items-center justify-center ${kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                            <i className={`${kpi.changeType === 'positive' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'}`}></i>
                          </div>
                          <span className={`text-sm font-medium ${kpi.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {kpi.change}
                          </span>
                          {compareMode && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">vs período anterior</span>
                          )}
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
                        <div className="w-6 h-6 flex items-center justify-center">
                          <i className={`${kpi.icon} text-xl`}></i>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Serie temporal de ventas */}
                <Card className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Evolución de Ventas
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-0.5 bg-black dark:bg-white"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Período actual</span>
                      </div>
                      {compareMode && (
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-0.5 border-t border-dashed border-gray-400"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Período anterior</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="h-64 relative">
                    <svg className="w-full h-full" viewBox="0 0 800 200">
                      {/* Grid lines */}
                      {[0, 50, 100, 150, 200].map((y) => (
                        <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="currentColor" strokeWidth="0.5" className="text-gray-200 dark:text-gray-700" />
                      ))}
                      {[0, 100, 200, 300, 400, 500, 600, 700, 800].map((x) => (
                        <line key={x} x1={x} y1="0" x2={x} y2="200" stroke="currentColor" strokeWidth="0.5" className="text-gray-200 dark:text-gray-700" />
                      ))}
                      
                      {/* Area chart */}
                      <defs>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" className="stop-color-gray-900 dark:stop-color-white" stopOpacity="0.1"/>
                          <stop offset="100%" className="stop-color-gray-900 dark:stop-color-white" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      
                      {/* Current period */}
                      <path 
                        d="M 0 150 L 100 120 L 200 140 L 300 100 L 400 90 L 500 110 L 600 80 L 700 70 L 800 60 L 800 200 L 0 200 Z"
                        fill="url(#areaGradient)"
                      />
                      <path 
                        d="M 0 150 L 100 120 L 200 140 L 300 100 L 400 90 L 500 110 L 600 80 L 700 70 L 800 60"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-black dark:text-white"
                      />
                      
                      {/* Previous period (if compare mode is on) */}
                      {compareMode && (
                        <path 
                          d="M 0 160 L 100 140 L 200 155 L 300 130 L 400 120 L 500 135 L 600 115 L 700 105 L 800 95"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          className="text-gray-400"
                        />
                      )}
                    </svg>
                  </div>
                </Card>

                {/* Ventas por vendedor */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Ventas por Vendedor
                  </h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Juan Pérez', value: 85, amount: '$28,500' },
                      { name: 'Ana García', value: 72, amount: '$24,200' },
                      { name: 'Pedro Ruiz', value: 68, amount: '$22,800' },
                      { name: 'María López', value: 45, amount: '$15,100' },
                      { name: 'Carlos Silva', value: 38, amount: '$12,700' }
                    ].map((seller, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-20 text-sm text-gray-600 dark:text-gray-400 truncate">
                          {seller.name}
                        </div>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-black dark:bg-white h-2 rounded-full transition-all duration-300"
                            style={{ width: `${seller.value}%` }}
                          ></div>
                        </div>
                        <div className="w-16 text-sm font-medium text-gray-900 dark:text-white text-right">
                          {seller.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Métodos de pago */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Métodos de Pago
                  </h3>
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative w-40 h-40">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Efectivo - 45% */}
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" 
                                strokeDasharray="113 251" strokeDashoffset="0" className="text-black dark:text-white" />
                        {/* Tarjeta - 35% */}
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" 
                                strokeDasharray="88 251" strokeDashoffset="-113" className="text-gray-400" />
                        {/* Transferencia - 20% */}
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" 
                                strokeDasharray="50 251" strokeDashoffset="-201" className="text-gray-600" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { method: 'Efectivo', percentage: '45%', color: 'bg-black dark:bg-white' },
                      { method: 'Tarjeta', percentage: '35%', color: 'bg-gray-400' },
                      { method: 'Transferencia', percentage: '20%', color: 'bg-gray-600' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{item.method}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.percentage}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Arqueo de Caja */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Arqueo de Caja
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                        Caja Abierta
                      </span>
                    </div>
                  </div>

                  {/* Estado actual */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Turno</p>
                        <p className="font-medium text-gray-900 dark:text-white">Mañana</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Cajero</p>
                        <p className="font-medium text-gray-900 dark:text-white">Juan Pérez</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Apertura</p>
                        <p className="font-medium text-gray-900 dark:text-white">08:00</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Duración</p>
                        <p className="font-medium text-gray-900 dark:text-white">4h 30m</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Efectivo</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">$12,450</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Tarjetas</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">$8,720</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Transferencias</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">$5,630</p>
                      </div>
                    </div>
                  </div>

                  {/* Últimos movimientos */}
                  <div className="space-y-3 mb-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Últimos Movimientos
                    </h4>
                    
                    {[
                      { time: '12:30', type: 'Venta', amount: '+$450', status: 'success' },
                      { time: '11:45', type: 'Retiro', amount: '-$2,000', status: 'warning' },
                      { time: '10:20', type: 'Venta', amount: '+$280', status: 'success' },
                      { time: '08:00', type: 'Apertura', amount: '$10,000', status: 'info' }
                    ].map((movement, index) => (
                      <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            movement.status === 'success' ? 'bg-green-500' : 
                            movement.status === 'warning' ? 'bg-yellow-500' : 
                            movement.status === 'info' ? 'bg-blue-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {movement.time}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {movement.type}
                          </span>
                        </div>
                        <span className={`text-sm font-medium ${
                          movement.amount.startsWith('+') ? 'text-green-600 dark:text-green-400' :
                          movement.amount.startsWith('-') ? 'text-red-600 dark:text-red-400' :
                          'text-gray-900 dark:text-white'
                        }`}>
                          {movement.amount}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Acciones */}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={handleCashWithdrawal}
                      className="flex items-center justify-center space-x-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-money-dollar-circle-line text-gray-600 dark:text-gray-400"></i>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Retiro</span>
                    </button>
                    
                    <button
                      onClick={handleCashCount}
                      className="flex items-center justify-center space-x-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-calculator-line text-gray-600 dark:text-gray-400"></i>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Arqueo</span>
                    </button>
                    
                    <button
                      onClick={handleCashClose}
                      className="flex items-center justify-center space-x-2 p-3 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-lock-line text-red-600 dark:text-red-400"></i>
                      </div>
                      <span className="text-sm text-red-700 dark:text-red-300">Cerrar</span>
                    </button>
                  </div>
                </Card>
              </div>

              {/* Tablas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Top Productos */}
                <Card>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Top Productos
                    </h3>
                    <Button variant="outline" className="text-xs">
                      Ver todos
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium">Producto</th>
                          <th className="text-right py-3 text-gray-600 dark:text-gray-400 font-medium">Cant.</th>
                          <th className="text-right py-3 text-gray-600 dark:text-gray-400 font-medium">Total</th>
                          <th className="text-right py-3 text-gray-600 dark:text-gray-400 font-medium">Margen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProducts.map((product, index) => (
                          <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                            <td className="py-3">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                  {product.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Rotación: {product.rotation}
                                </p>
                              </div>
                            </td>
                            <td className="text-right py-3 text-gray-900 dark:text-white">
                              {product.quantity}
                            </td>
                            <td className="text-right py-3 font-medium text-gray-900 dark:text-white">
                              {product.total}
                            </td>
                            <td className="text-right py-3">
                              <span className="text-green-600 dark:text-green-400">
                                {product.margin}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Top Clientes */}
                <Card>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Top Clientes
                    </h3>
                    <Button variant="outline" className="text-xs">
                      Ver todos
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium">Cliente</th>
                          <th className="text-right py-3 text-gray-600 dark:text-gray-400 font-medium">Total</th>
                          <th className="text-right py-3 text-gray-600 dark:text-gray-400 font-medium">Ticket Prom.</th>
                          <th className="text-right py-3 text-gray-600 dark:text-gray-400 font-medium">Frecuencia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topCustomers.map((customer, index) => (
                          <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                            <td className="py-3">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                  {customer.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Última: hace {customer.lastPurchase}
                                </p>
                              </div>
                            </td>
                            <td className="text-right py-3 font-medium text-gray-900 dark:text-white">
                              {customer.total}
                            </td>
                            <td className="text-right py-3 text-gray-900 dark:text-white">
                              {customer.avgTicket}
                            </td>
                            <td className="text-right py-3 text-gray-600 dark:text-gray-400">
                              {customer.frequency}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              {/* Tabla de Transacciones */}
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Detalle de Transacciones
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar transacciones..."
                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                      />
                      <div className="absolute left-3 top-2.5 w-4 h-4 flex items-center justify-center">
                        <i className="ri-search-line"></i>
                      </div>
                    </div>
                    <Button variant="outline" className="text-xs">
                      <div className="w-4 h-4 flex items-center justify-center mr-2">
                        <i className="ri-download-line"></i>
                      </div>
                      Exportar
                    </Button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium">Fecha</th>
                        <th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium">Comprobante</th>
                        <th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium">Cliente</th>
                        <th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium">Vendedor</th>
                        <th className="text-right py-3 text-gray-600 dark:text-gray-400 font-medium">Ítems</th>
                        <th className="text-right py-3 text-gray-600 dark:text-gray-400 font-medium">Total</th>
                        <th className="text-right py-3 text-gray-600 dark:text-gray-400 font-medium">Margen</th>
                        <th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium">Método</th>
                        <th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium">Canal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction, index) => (
                        <tr 
                          key={index} 
                          onClick={() => handleTransactionClick(transaction)}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        >
                          <td className="py-3 text-gray-900 dark:text-white">
                            {transaction.date}
                          </td>
                          <td className="py-3">
                            <span className="font-mono text-gray-900 dark:text-white">
                              {transaction.id}
                            </span>
                          </td>
                          <td className="py-3 text-gray-900 dark:text-white">
                            {transaction.customer}
                          </td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">
                            {transaction.seller}
                          </td>
                          <td className="text-right py-3 text-gray-900 dark:text-white">
                            {transaction.items}
                          </td>
                          <td className="text-right py-3 font-medium text-gray-900 dark:text-white">
                            {transaction.total}
                          </td>
                          <td className="text-right py-3">
                            <span className="text-green-600 dark:text-green-400">
                              {transaction.margin}
                            </span>
                          </td>
                          <td className="py-3 text-gray-600 dark:text-gray-400">
                            {transaction.payment}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              transaction.channel === 'E-commerce' 
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                            }`}>
                              {transaction.channel}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                <div className="flex items-center justify-between mt-6 pt-4 border-top border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Mostrando 1-10 de 456 transacciones
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="small" disabled>
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-arrow-left-line"></i>
                      </div>
                    </Button>
                    <Button variant="outline" size="small" className="bg-black dark:bg-white text-white dark:text-black">
                      1
                    </Button>
                    <Button variant="outline" size="small">2</Button>
                    <Button variant="outline" size="small">3</Button>
                    <span className="text-gray-400">...</span>
                    <Button variant="outline" size="small">46</Button>
                    <Button variant="outline" size="small">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-arrow-right-line"></i>
                      </div>
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          )}
        </main>
      </div>

      {/* Modales */}
      {showDateModal && (
        <DateRangeModal
          currentRange={filters.dateRange}
          onClose={() => setShowDateModal(false)}
          onApply={(range) => {
            setFilters({ ...filters, dateRange: range });
            setShowDateModal(false);
          }}
        />
      )}

      {showScheduleModal && (
        <ScheduleEmailModal
          onClose={() => setShowScheduleModal(false)}
          onSchedule={(config) => {
            console.log('Programando email:', config);
            setShowScheduleModal(false);
          }}
        />
      )}

      {showSaveViewModal && (
        <SaveViewModal
          onClose={() => setShowSaveViewModal(false)}
          onSave={(name) => {
            console.log('Guardando vista:', name);
            setShowSaveViewModal(false);
          }}
        />
      )}

      {showTransactionModal && selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => {
            setShowTransactionModal(false);
            setSelectedTransaction(null);
          }}
        />
      )}

      {/* Modal de retiro de efectivo */}
      {showWithdrawalModal && (
        <CashWithdrawalModal
          currentCashAmount={currentCashAmount}
          onClose={() => setShowWithdrawalModal(false)}
          onConfirm={handleConfirmWithdrawal}
        />
      )}

      {/* Modal de arqueo de caja */}
      {showCashCountModal && (
        <CashCountModal
          currentCashAmount={currentCashAmount}
          onClose={() => setShowCashCountModal(false)}
          onConfirm={handleConfirmCashCount}
        />
      )}

      {/* Modal de cierre de caja */}
      {showCashCloseModal && (
        <CashCloseModal
          currentCashAmount={currentCashAmount}
          onClose={() => setShowCashCloseModal(false)}
          onConfirm={handleConfirmCashClose}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-500 text-white' :
          toast.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <i className={`${
              toast.type === 'success' ? 'ri-check-line' :
              toast.type === 'error' ? 'ri-error-warning-line' :
              'ri-information-line'
            }`}></i>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
