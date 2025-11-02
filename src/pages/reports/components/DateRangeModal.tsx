
import { useState } from 'react';
import Button from '../../../components/base/Button';

interface DateRangeModalProps {
  currentRange: string;
  onClose: () => void;
  onApply: (range: string) => void;
}

export default function DateRangeModal({ currentRange, onClose, onApply }: DateRangeModalProps) {
  const [selectedRange, setSelectedRange] = useState(currentRange);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const presets = [
    'Hoy',
    'Ayer',
    'Últimos 7 días',
    'Últimos 30 días',
    'Mes actual',
    'Mes pasado',
    'Personalizado'
  ];

  const handleApply = () => {
    if (selectedRange === 'Personalizado' && customStartDate && customEndDate) {
      onApply(`${customStartDate} - ${customEndDate}`);
    } else {
      onApply(selectedRange);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Seleccionar Período
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-close-line text-xl"></i>
            </div>
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-3 mb-6">
            {presets.map((preset) => (
              <label key={preset} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="dateRange"
                  value={preset}
                  checked={selectedRange === preset}
                  onChange={(e) => setSelectedRange(e.target.value)}
                  className="w-4 h-4 text-black dark:text-white border-gray-300 dark:border-gray-600 focus:ring-black dark:focus:ring-white"
                />
                <span className="text-gray-900 dark:text-white">{preset}</span>
              </label>
            ))}
          </div>

          {selectedRange === 'Personalizado' && (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleApply}
            disabled={selectedRange === 'Personalizado' && (!customStartDate || !customEndDate)}
            className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
          >
            Aplicar
          </Button>
        </div>
      </div>
    </div>
  );
}
