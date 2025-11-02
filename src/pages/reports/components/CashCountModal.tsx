
import { useState, useEffect } from 'react';
import Button from '../../../components/base/Button';
import Card from '../../../components/base/Card';

interface CashCountModalProps {
  currentCashAmount: number;
  onClose: () => void;
  onConfirm: (data: {
    expectedAmount: number;
    countedAmount: number;
    difference: number;
    denominations: { [key: string]: number };
    notes: string;
    isIntermediateCount: boolean;
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

export default function CashCountModal({ currentCashAmount, onClose, onConfirm }: CashCountModalProps) {
  const [counts, setCounts] = useState<{ [key: number]: number }>({});
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualAmount, setManualAmount] = useState('');
  const [countMethod, setCountMethod] = useState<'detailed' | 'manual'>('detailed');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleConfirm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    if (type === 'surplus') return 'text-blue-600 dark:text-blue-400';
    if (type === 'shortage') return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
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
    
    if (type === 'surplus') return `Diferencia: +$${diff.toLocaleString()}`;
    if (type === 'shortage') return `Diferencia: -$${diff.toLocaleString()}`;
    return 'Conteo exacto';
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const countedAmount = getCountedTotal();
      const difference = getDifference();
      
      onConfirm({
        expectedAmount: currentCashAmount,
        countedAmount,
        difference,
        denominations: counts,
        notes,
        isIntermediateCount: true
      });
      
    } catch (error) {
      console.error('Error al procesar arqueo:', error);
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
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-black dark:text-white">Arqueo Intermedio</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Verificación del efectivo en caja (sin cerrar el turno)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6 space-y-6">
            {/* Información actual */}
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
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Estado</p>
                  <div className="flex items-center justify-center space-x-2">
                    <i className={`${getDifferenceIcon()} ${getDifferenceColor()}`}></i>
                    <p className={`text-lg font-bold ${getDifferenceColor()}`}>
                      {getDifferenceText()}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Método de conteo */}
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

            {/* Resultado del arqueo */}
            {getCountedTotal() > 0 && (
              <Card>
                <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                  Resultado del Arqueo
                </h3>

                <div className={`p-4 rounded-lg border ${
                  getDifferenceType() === 'exact' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                  getDifferenceType() === 'surplus' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                  'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                } mb-4`}>
                  <div className="flex items-center mb-2">
                    <i className={`${getDifferenceIcon()} ${getDifferenceColor()} mr-2`}></i>
                    <h4 className={`font-medium ${getDifferenceColor()}`}>
                      {getDifferenceType() === 'exact' ? 'Arqueo exacto' :
                       getDifferenceType() === 'surplus' ? 'Diferencia positiva' : 'Diferencia negativa'}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getDifferenceType() === 'exact' 
                      ? 'El efectivo contado coincide exactamente con el esperado.'
                      : getDifferenceType() === 'surplus'
                      ? 'Se encontró más efectivo del esperado. Esto puede indicar ventas no registradas o errores en el conteo.'
                      : 'Se encontró menos efectivo del esperado. Verifica el conteo y los movimientos del día.'
                    }
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Observaciones
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white resize-none"
                    placeholder="Observaciones sobre el arqueo (opcional)..."
                  />
                </div>
              </Card>
            )}

            {/* Información del arqueo */}
            <Card>
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                Información del arqueo
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Fecha y hora</p>
                  <p className="font-medium text-black dark:text-white">
                    {new Date().toLocaleString('es-AR')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Cajero</p>
                  <p className="font-medium text-black dark:text-white">Juan Pérez</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Turno</p>
                  <p className="font-medium text-black dark:text-white">Mañana</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Tipo</p>
                  <p className="font-medium text-blue-600 dark:text-blue-400">Arqueo intermedio</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Ctrl+S para guardar • Esc para cancelar
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={isProcessing || getCountedTotal() === 0}
            >
              {isProcessing ? (
                <>
                  <i className="ri-loader-4-line mr-2 animate-spin"></i>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="ri-save-line mr-2"></i>
                  Guardar Arqueo
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
