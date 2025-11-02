
import { useState } from 'react';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'debit' | 'credit' | 'transfer' | 'mixed';
  enabled: boolean;
  installments: number;
  surcharge: number;
  discount: number;
  ticketNote: string;
}

export default function PaymentMethodSettings() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', name: 'Efectivo', type: 'cash', enabled: true, installments: 1, surcharge: 0, discount: 5, ticketNote: 'Pago en efectivo' },
    { id: '2', name: 'Débito', type: 'debit', enabled: true, installments: 1, surcharge: 0, discount: 0, ticketNote: 'Tarjeta de débito' },
    { id: '3', name: 'Visa Crédito', type: 'credit', enabled: true, installments: 12, surcharge: 10, discount: 0, ticketNote: 'Visa crédito' },
    { id: '4', name: 'Mastercard Crédito', type: 'credit', enabled: true, installments: 18, surcharge: 12, discount: 0, ticketNote: 'Mastercard crédito' },
    { id: '5', name: 'Transferencia', type: 'transfer', enabled: true, installments: 1, surcharge: 0, discount: 3, ticketNote: 'Transferencia bancaria' },
    { id: '6', name: 'Pago Mixto', type: 'mixed', enabled: true, installments: 1, surcharge: 0, discount: 0, ticketNote: 'Pago combinado' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'cash' as PaymentMethod['type'],
    installments: 1,
    surcharge: 0,
    discount: 0,
    ticketNote: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const paymentTypeLabels = {
    cash: 'Efectivo',
    debit: 'Débito',
    credit: 'Crédito',
    transfer: 'Transferencia',
    mixed: 'Mixto'
  };

  const paymentTypeIcons = {
    cash: 'ri-money-dollar-circle-line',
    debit: 'ri-bank-card-line',
    credit: 'ri-bank-card-2-line',
    transfer: 'ri-exchange-line',
    mixed: 'ri-shuffle-line'
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      type: method.type,
      installments: method.installments,
      surcharge: method.surcharge,
      discount: method.discount,
      ticketNote: method.ticketNote,
    });
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingMethod(null);
    setFormData({
      name: '',
      type: 'cash',
      installments: 1,
      surcharge: 0,
      discount: 0,
      ticketNote: '',
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingMethod) {
      setPaymentMethods(prev => prev.map(method =>
        method.id === editingMethod.id
          ? { ...method, ...formData }
          : method
      ));
    } else {
      const newMethod: PaymentMethod = {
        id: Date.now().toString(),
        ...formData,
        enabled: true
      };
      setPaymentMethods(prev => [...prev, newMethod]);
    }
    setShowModal(false);
  };

  const toggleMethod = (id: string) => {
    setPaymentMethods(prev => prev.map(method =>
      method.id === id
        ? { ...method, enabled: !method.enabled }
        : method
    ));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Medios de Pago</h2>
          <p className="text-gray-600 dark:text-gray-400">Configura los métodos de pago disponibles</p>
        </div>
        <Button onClick={handleNew}>
          <div className="w-4 h-4 flex items-center justify-center mr-2">
            <i className="ri-add-line"></i>
          </div>
          Nuevo Método
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Método</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Tipo</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Cuotas</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Recargo/Desc.</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paymentMethods.map((method) => (
                <tr key={method.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <i className={`${paymentTypeIcons[method.type]} text-gray-600 dark:text-gray-400`}></i>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{method.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{method.ticketNote}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      method.type === 'cash' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' :
                      method.type === 'debit' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300' :
                      method.type === 'credit' ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300' :
                      method.type === 'transfer' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300' :
                      'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                    }`}>
                      {paymentTypeLabels[method.type]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {method.installments > 1 ? `Hasta ${method.installments}` : '1'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col space-y-1">
                      {method.surcharge > 0 && (
                        <span className="text-red-600 dark:text-red-400 text-sm">
                          +{method.surcharge}% recargo
                        </span>
                      )}
                      {method.discount > 0 && (
                        <span className="text-green-600 dark:text-green-400 text-sm">
                          -{method.discount}% descuento
                        </span>
                      )}
                      {method.surcharge === 0 && method.discount === 0 && (
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          Sin ajustes
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleMethod(method.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${
                        method.enabled
                          ? 'bg-black dark:bg-white'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-black transition-transform ${
                          method.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleEdit(method)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-edit-line"></i>
                      </div>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {saveStatus === 'success' && (
            <div className="flex items-center text-green-600 dark:text-green-400">
              <div className="w-4 h-4 flex items-center justify-center mr-1">
                <i className="ri-check-line"></i>
              </div>
              <span className="text-sm">Configuración guardada</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center text-red-600 dark:text-red-400">
              <div className="w-4 h-4 flex items-center justify-center mr-1">
                <i className="ri-error-warning-line"></i>
              </div>
              <span className="text-sm">Error al guardar</span>
            </div>
          )}
        </div>

        <Button onClick={handleSaveAll} disabled={isSaving}>
          {isSaving ? (
            <>
              <div className="w-4 h-4 flex items-center justify-center mr-2">
                <i className="ri-loader-4-line animate-spin"></i>
              </div>
              Guardando...
            </>
          ) : (
            <>
              <div className="w-4 h-4 flex items-center justify-center mr-2">
                <i className="ri-save-line"></i>
              </div>
              Guardar Cambios
            </>
          )}
        </Button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-2xl mx-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingMethod ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                    placeholder="Nombre del método"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as PaymentMethod['type'] }))}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  >
                    <option value="cash">Efectivo</option>
                    <option value="debit">Débito</option>
                    <option value="credit">Crédito</option>
                    <option value="transfer">Transferencia</option>
                    <option value="mixed">Mixto</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cuotas Máximas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="48"
                    value={formData.installments}
                    onChange={(e) => setFormData(prev => ({ ...prev, installments: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recargo (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.surcharge}
                    onChange={(e) => setFormData(prev => ({ ...prev, surcharge: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descuento (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.discount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nota en Ticket
                </label>
                <input
                  type="text"
                  value={formData.ticketNote}
                  onChange={(e) => setFormData(prev => ({ ...prev, ticketNote: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  placeholder="Texto que aparecerá en el ticket"
                />
              </div>

              {/* Preview */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Vista Previa en Ticket</h4>
                <div className="bg-white dark:bg-gray-900 p-3 rounded border text-sm font-mono">
                  <div className="text-center border-b pb-2 mb-2">
                    <div className="font-bold">TICKET DE VENTA</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>$1,000.00</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span>Método: {formData.ticketNote || formData.name}</span>
                    </div>
                    {formData.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Descuento ({formData.discount}%):</span>
                        <span>-${(1000 * formData.discount / 100).toFixed(2)}</span>
                      </div>
                    )}
                    {formData.surcharge > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Recargo ({formData.surcharge}%):</span>
                        <span>+${(1000 * formData.surcharge / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t pt-1">
                      <span>TOTAL:</span>
                      <span>${(1000 - (1000 * formData.discount / 100) + (1000 * formData.surcharge / 100)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingMethod ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
