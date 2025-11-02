
import { useState } from 'react';
import Button from '../../../components/base/Button';

interface CashWithdrawalModalProps {
  onClose: () => void;
  onConfirm: (data: {
    amount: number;
    reason: string;
    notes: string;
    requiresAuthorization: boolean;
  }) => void;
  currentCashAmount: number;
}

const withdrawalReasons = [
  'Gastos operativos',
  'Pago a proveedores',
  'Cambio para clientes',
  'Depósito bancario',
  'Gastos varios',
  'Otro'
];

export default function CashWithdrawalModal({ onClose, onConfirm, currentCashAmount }: CashWithdrawalModalProps) {
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [notes, setNotes] = useState('');
  const [requiresAuthorization, setRequiresAuthorization] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!amount || amount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    }

    if (amount > currentCashAmount) {
      newErrors.amount = 'El monto no puede ser mayor al efectivo disponible';
    }

    if (!reason) {
      newErrors.reason = 'Debe seleccionar un motivo';
    }

    if (reason === 'Otro' && !customReason.trim()) {
      newErrors.customReason = 'Debe especificar el motivo';
    }

    if (amount >= 10000) {
      setRequiresAuthorization(true);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onConfirm({
        amount,
        reason: reason === 'Otro' ? customReason : reason,
        notes,
        requiresAuthorization
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Retiro de Efectivo
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-close-line text-xl"></i>
            </div>
          </button>
        </div>

        {/* Información actual */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Efectivo disponible en caja:
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(currentCashAmount)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Monto a retirar <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400">$</span>
              <input
                type="number"
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className={`w-full pl-8 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                  errors.amount 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                } focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent`}
                placeholder="0.00"
                min="0"
                max={currentCashAmount}
                step="0.01"
                required
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.amount}</p>
            )}
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Motivo del retiro <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={`w-full px-3 py-2 pr-8 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                errors.reason 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              } focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent`}
              required
            >
              <option value="">Seleccionar motivo</option>
              {withdrawalReasons.map((reasonOption) => (
                <option key={reasonOption} value={reasonOption}>
                  {reasonOption}
                </option>
              ))}
            </select>
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.reason}</p>
            )}
          </div>

          {/* Motivo personalizado */}
          {reason === 'Otro' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Especificar motivo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                  errors.customReason 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                } focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent`}
                placeholder="Describir el motivo del retiro"
                required
              />
              {errors.customReason && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.customReason}</p>
              )}
            </div>
          )}

          {/* Notas adicionales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notas adicionales
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
              placeholder="Información adicional sobre el retiro (opcional)"
            />
          </div>

          {/* Alerta de autorización */}
          {requiresAuthorization && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                  <i className="ri-alert-line text-yellow-600 dark:text-yellow-400"></i>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Autorización requerida
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Los retiros superiores a $10.000 requieren autorización de un supervisor.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Resumen */}
          {amount > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Resumen del retiro
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Monto a retirar:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Efectivo restante:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(currentCashAmount - amount)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <div className="w-4 h-4 flex items-center justify-center mr-2">
                <i className="ri-money-dollar-circle-line"></i>
              </div>
              Confirmar Retiro
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
