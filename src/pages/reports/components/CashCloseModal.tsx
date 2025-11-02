import { useState, useEffect } from 'react';
import Button from '../../../components/base/Button';
import Card from '../../../components/base/Card';

interface CashCloseModalProps {
  currentCashAmount: number;
  onClose: () => void;
  onConfirm: (data: {
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
  }) => void;
}

interface Denomination {
  value: number;
  type: 'bill' | 'coin';
  label: string;
  count: number;
}

const denominations: Denomination[] = [
  { value: 1000, type: 'bill', label: '$1000', count: 0 },
  { value: 500, type: 'bill', label: '$500', count: 0 },
  { value: 200, type: 'bill', label: '$200', count: 0 },
  { value: 100, type: 'bill', label: '$100', count: 0 },
  { value: 50, type: 'bill', label: '$50', count: 0 },
  { value: 20, type: 'bill', label: '$20', count: 0 },
  { value: 10, type: 'bill', label: '$10', count: 0 },
  { value: 5, type: 'coin', label: '$5', count: 0 },
  { value: 2, type: 'coin', label: '$2', count: 0 },
  { value: 1, type: 'coin', label: '$1', count: 0 },
  { value: 0.5, type: 'coin', label: '$0.50', count: 0 },
  { value: 0.25, type: 'coin', label: '$0.25', count: 0 },
  { value: 0.1, type: 'coin', label: '$0.10', count: 0 },
  { value: 0.05, type: 'coin', label: '$0.05', count: 0 }
];

export default function CashCloseModal({ currentCashAmount, onClose, onConfirm }: CashCloseModalProps) {
  const [step, setStep] = useState(1);
  const [counts, setCounts] = useState<{ [key: number]: number }>({});
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualAmount, setManualAmount] = useState('');
  const [countMethod, setCountMethod] = useState<'detailed' | 'manual'>('detailed');

  // Datos simulados del turno
  const shiftData = {
    startTime: '08:00',
    duration: '4h 30m',
    totalSales: 26800,
    totalWithdrawals: 2000,
    openingBalance: 10000,
    expectedBalance: currentCashAmount
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (step === 3) {
          handleConfirm();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [step]);

  const updateCount = (value: number, count: number) => {
    setCounts(prev => ({
      ...prev,
      [value]: Math.max(0, count)
    }));
  };

  const getCountedTotal = () => {
    if (countMethod === 'manual') {
      return parseFloat(manualAmount) || 0;
    }
    
    return Object.entries(counts).reduce((total, [value, count]) => {
      return total + (parseFloat(value) * count);
    }, 0);
  };

  const getDifference = () => {
    return getCountedTotal() - currentCashAmount;
  };

  const getDifferenceType = () => {
    const diff = getDifference();
    if (diff > 0) return 'surplus';
    if (diff < 0) return 'shortage';
    return 'exact';
  };

  const getDifferenceColor = () => {
    const type = getDifferenceType();
    if (type === 'surplus') return 'text-green-600 dark:text-green-400';
    if (type === 'shortage') return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getDifferenceIcon = () => {
    const type = getDifferenceType();
    if (type === 'surplus') return 'ri-arrow-up-circle-line';
    if (type === 'shortage') return 'ri-arrow-down-circle-line';
    return 'ri-checkbox-circle-line';
  };

  const getDifferenceText = () => {
    const diff = Math.abs(getDifference());
    const type = getDifferenceType();
    
    if (type === 'surplus') return `Sobrante: $${diff.toLocaleString()}`;
    if (type === 'shortage') return `Faltante: $${diff.toLocaleString()}`;
    return 'Arqueo exacto';
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const countedAmount = getCountedTotal();
      const difference = getDifference();
      
      onConfirm({
        expectedAmount: currentCashAmount,
        countedAmount,
        difference,
        denominations: counts,
        notes,
        requiresAdjustment: Math.abs(difference) > 0,
        closingData: {
          totalSales: shiftData.totalSales,
          totalWithdrawals: shiftData.totalWithdrawals,
          finalBalance: countedAmount
        }
      });
      
    } catch (error) {
      console.error('Error al procesar cierre:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearCounts = () => {
    setCounts({});
    setManualAmount('');
  };

  const quickFill = () => {
    const amount = currentCashAmount;
    const newCounts: { [key: number]: number } = {};
    
    let remaining = amount;
    
    newCounts[1000] = Math.floor(remaining / 1000);
    remaining = remaining % 1000;
    
    newCounts[500] = Math.floor(remaining / 500);
    remaining = remaining % 500;
    
    newCounts[200] = Math.floor(remaining / 200);
    remaining = remaining % 200;
    
    newCounts[100] = Math.floor(remaining / 100);
    remaining = remaining % 100;
    
    newCounts[50] = Math.floor(remaining / 50);
    remaining = remaining % 50;
    
    newCounts[20] = Math.floor(remaining / 20);
    remaining = remaining % 20;
    
    newCounts[10] = Math.floor(remaining / 10);
    remaining = remaining % 10;
    
    newCounts[5] = Math.floor(remaining / 5);
    remaining = remaining % 5;
    
    newCounts[2] = Math.floor(remaining / 2);
    remaining = remaining % 2;
    
    newCounts[1] = Math.floor(remaining / 1);
    
    setCounts(newCounts);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-black dark:text-white">Cierre de Caja</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Arqueo final y cierre del turno
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                step >= 1 ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {step > 1 ? <i className="ri-check-line"></i> : '1'}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${step >= 1 ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  Resumen
                </p>
              </div>
            </div>
            
            <div className={`flex-1 h-px mx-4 ${step > 1 ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                step >= 2 ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {step > 2 ? <i className="ri-check-line"></i> : '2'}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${step >= 2 ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  Arqueo
                </p>
              </div>
            </div>
            
            <div className={`flex-1 h-px mx-4 ${step > 2 ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                step >= 3 ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {step > 3 ? <i className="ri-check-line"></i> : '3'}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${step >= 3 ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  Cierre
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6">
            {/* Paso 1: Resumen del turno */}
            {step === 1 && (
              <div className="space-y-6">
                <Card>
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
                    Resumen del Turno
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Apertura</p>
                      <p className="text-xl font-bold text-black dark:text-white">
                        ${shiftData.openingBalance.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{shiftData.startTime}</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ventas</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        +${shiftData.totalSales.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Efectivo</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Retiros</p>
                      <p className="text-xl font-bold text-red-600 dark:text-red-400">
                        -${shiftData.totalWithdrawals.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Autorizados</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Esperado</p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        ${shiftData.expectedBalance.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Balance final</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Cajero</p>
                      <p className="font-medium text-black dark:text-white">Juan Pérez</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Turno</p>
                      <p className="font-medium text-black dark:text-white">Mañana</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Duración</p>
                      <p className="font-medium text-black dark:text-white">{shiftData.duration}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Sucursal</p>
                      <p className="font-medium text-black dark:text-white">Centro</p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                    Movimientos del Día
                  </h3>
                  
                  <div className="space-y-3">
                    {[
                      { time: '08:00', type: 'Apertura', amount: '$10,000', status: 'info' },
                      { time: '09:15', type: 'Venta', amount: '+$450', status: 'success' },
                      { time: '10:30', type: 'Venta', amount: '+$280', status: 'success' },
                      { time: '11:45', type: 'Retiro', amount: '-$2,000', status: 'warning' },
                      { time: '12:20', type: 'Venta', amount: '+$1,250', status: 'success' },
                      { time: '12:45', type: 'Venta', amount: '+$380', status: 'success' }
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
                          <span className="text-sm font-medium text-black dark:text-white">
                            {movement.type}
                          </span>
                        </div>
                        <span className={`text-sm font-medium ${
                          movement.amount.startsWith('+') ? 'text-green-600 dark:text-green-400' :
                          movement.amount.startsWith('-') ? 'text-red-600 dark:text-red-400' :
                          'text-black dark:text-white'
                        }`}>
                          {movement.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Paso 2: Arqueo (igual que el modal anterior) */}
            {step === 2 && (
              <div className="space-y-6">
                <Card>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Efectivo esperado</p>
                      <p className="text-2xl font-bold text-black dark:text-white">
                        ${currentCashAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Efectivo contado</p>
                      <p className="text-2xl font-bold text-black dark:text-white">
                        ${getCountedTotal().toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Diferencia</p>
                      <div className="flex items-center justify-center space-x-2">
                        <i className={`${getDifferenceIcon()} ${getDifferenceColor()}`}></i>
                        <p className={`text-2xl font-bold ${getDifferenceColor()}`}>
                          {getDifferenceText()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                    Método de conteo
                  </h3>
                  
                  <div className="flex gap-4 mb-6">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="countMethod"
                        value="detailed"
                        checked={countMethod === 'detailed'}
                        onChange={(e) => setCountMethod(e.target.value as 'detailed' | 'manual')}
                        className="text-black dark:text-white focus:ring-black dark:focus:ring-white"
                      />
                      <div>
                        <span className="text-sm font-medium text-black dark:text-white">Conteo detallado</span>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Contar por denominación</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="countMethod"
                        value="manual"
                        checked={countMethod === 'manual'}
                        onChange={(e) => setCountMethod(e.target.value as 'detailed' | 'manual')}
                        className="text-black dark:text-white focus:ring-black dark:focus:ring-white"
                      />
                      <div>
                        <span className="text-sm font-medium text-black dark:text-white">Monto total</span>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Ingresar total directamente</p>
                      </div>
                    </label>
                  </div>

                  {countMethod === 'manual' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Monto total contado
                      </label>
                      <input
                        type="number"
                        value={manualAmount}
                        onChange={(e) => setManualAmount(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-lg font-mono"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-black dark:text-white">
                          Conteo por denominación
                        </h4>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={quickFill}>
                            <i className="ri-magic-line mr-1"></i>
                            Llenar automático
                          </Button>
                          <Button variant="outline" size="sm" onClick={clearCounts}>
                            <i className="ri-delete-bin-line mr-1"></i>
                            Limpiar
                          </Button>
                        </div>
                      </div>

                      {/* Billetes */}
                      <div className="mb-6">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                          <i className="ri-money-dollar-box-line mr-2"></i>
                          Billetes
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                          {denominations.filter(d => d.type === 'bill').map(denomination => (
                            <div key={denomination.value} className="text-center">
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                {denomination.label}
                              </label>
                              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                                <button
                                  onClick={() => updateCount(denomination.value, (counts[denomination.value] || 0) - 1)}
                                  className="p-2 text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
                                >
                                  <i className="ri-subtract-line text-sm"></i>
                                </button>
                                <input
                                  type="number"
                                  value={counts[denomination.value] || 0}
                                  onChange={(e) => updateCount(denomination.value, parseInt(e.target.value) || 0)}
                                  className="w-full text-center py-2 bg-transparent text-black dark:text-white font-mono text-sm border-0 focus:ring-0"
                                  min="0"
                                />
                                <button
                                  onClick={() => updateCount(denomination.value, (counts[denomination.value] || 0) + 1)}
                                  className="p-2 text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
                                >
                                  <i className="ri-add-line text-sm"></i>
                                </button>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                ${((counts[denomination.value] || 0) * denomination.value).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Monedas */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                          <i className="ri-coins-line mr-2"></i>
                          Monedas
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                          {denominations.filter(d => d.type === 'coin').map(denomination => (
                            <div key={denomination.value} className="text-center">
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                {denomination.label}
                              </label>
                              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                                <button
                                  onClick={() => updateCount(denomination.value, (counts[denomination.value] || 0) - 1)}
                                  className="p-2 text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
                                >
                                  <i className="ri-subtract-line text-sm"></i>
                                </button>
                                <input
                                  type="number"
                                  value={counts[denomination.value] || 0}
                                  onChange={(e) => updateCount(denomination.value, parseInt(e.target.value) || 0)}
                                  className="w-full text-center py-2 bg-transparent text-black dark:text-white font-mono text-sm border-0 focus:ring-0"
                                  min="0"
                                />
                                <button
                                  onClick={() => updateCount(denomination.value, (counts[denomination.value] || 0) + 1)}
                                  className="p-2 text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
                                >
                                  <i className="ri-add-line text-sm"></i>
                                </button>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                ${((counts[denomination.value] || 0) * denomination.value).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Paso 3: Confirmación y cierre */}
            {step === 3 && (
              <div className="space-y-6">
                <Card>
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
                    Confirmación de Cierre
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Efectivo esperado</p>
                      <p className="text-xl font-bold text-black dark:text-white">
                        ${currentCashAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Efectivo contado</p>
                      <p className="text-xl font-bold text-black dark:text-white">
                        ${getCountedTotal().toLocaleString()}
                      </p>
                    </div>
                    <div className={`text-center p-4 rounded-lg ${
                      getDifferenceType() === 'exact' ? 'bg-green-50 dark:bg-green-900/20' :
                      getDifferenceType() === 'surplus' ? 'bg-blue-50 dark:bg-blue-900/20' :
                      'bg-red-50 dark:bg-red-900/20'
                    }`}>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Diferencia</p>
                      <div className="flex items-center justify-center space-x-2">
                        <i className={`${getDifferenceIcon()} ${getDifferenceColor()}`}></i>
                        <p className={`text-xl font-bold ${getDifferenceColor()}`}>
                          {getDifferenceType() === 'exact' ? 'Exacto' : `$${Math.abs(getDifference()).toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {getDifferenceType() !== 'exact' && (
                    <div className={`p-4 rounded-lg border mb-6 ${
                      getDifferenceType() === 'surplus' 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}>
                      <div className="flex items-center mb-2">
                        <i className={`${getDifferenceIcon()} ${getDifferenceColor()} mr-2`}></i>
                        <h4 className={`font-medium ${getDifferenceColor()}`}>
                          {getDifferenceType() === 'surplus' ? 'Sobrante detectado' : 'Faltante detectado'}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Esta diferencia será registrada en el cierre de caja.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Observaciones del cierre {getDifferenceType() !== 'exact' && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white resize-none"
                      placeholder={
                        getDifferenceType() !== 'exact' 
                          ? 'Explica el motivo de la diferencia encontrada...'
                          : 'Observaciones adicionales sobre el cierre (opcional)...'
                      }
                    />
                  </div>
                </Card>

                <Card>
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                    Resumen Final del Turno
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Fecha y hora de cierre</p>
                      <p className="font-medium text-black dark:text-white">
                        {new Date().toLocaleString('es-AR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Duración total</p>
                      <p className="font-medium text-black dark:text-white">{shiftData.duration}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Ventas en efectivo</p>
                      <p className="font-medium text-green-600 dark:text-green-400">
                        ${shiftData.totalSales.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Balance final</p>
                      <p className="font-medium text-black dark:text-white">
                        ${getCountedTotal().toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {step === 1 ? 'Revisa el resumen del turno' : 
             step === 2 ? 'Realiza el conteo del efectivo' : 
             'Confirma el cierre de caja'}
          </div>
          
          <div className="flex gap-3">
            {step > 1 && (
              <Button variant="outline" onClick={handlePreviousStep}>
                <i className="ri-arrow-left-line mr-2"></i>
                Anterior
              </Button>
            )}
            
            {step < 3 ? (
              <Button
                variant="primary"
                onClick={handleNextStep}
                disabled={step === 2 && getCountedTotal() === 0}
              >
                Continuar
                <i className="ri-arrow-right-line ml-2"></i>
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleConfirm}
                disabled={isProcessing || (getDifferenceType() !== 'exact' && !notes.trim())}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isProcessing ? (
                  <>
                    <i className="ri-loader-4-line mr-2 animate-spin"></i>
                    Cerrando caja...
                  </>
                ) : (
                  <>
                    <i className="ri-lock-line mr-2"></i>
                    Cerrar Caja
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}