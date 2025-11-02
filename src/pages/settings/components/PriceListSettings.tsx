
import { useState } from 'react';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';

interface PriceList {
  id: string;
  name: string;
  baseRule: 'cost' | 'price';
  adjustment: number;
  adjustmentType: 'percentage' | 'fixed';
  validFrom: string;
  validTo: string;
  priority: number;
  assignedTo: 'all' | 'customers' | 'channels';
  status: 'active' | 'inactive';
}

export default function PriceListSettings() {
  const [priceLists, setPriceLists] = useState<PriceList[]>([
    {
      id: '1',
      name: 'Lista General',
      baseRule: 'cost',
      adjustment: 50,
      adjustmentType: 'percentage',
      validFrom: '2024-01-01',
      validTo: '',
      priority: 1,
      assignedTo: 'all',
      status: 'active'
    },
    {
      id: '2',
      name: 'Lista Mayorista',
      baseRule: 'price',
      adjustment: -15,
      adjustmentType: 'percentage',
      validFrom: '2024-01-01',
      validTo: '',
      priority: 2,
      assignedTo: 'customers',
      status: 'active'
    },
    {
      id: '3',
      name: 'Lista E-commerce',
      baseRule: 'cost',
      adjustment: 65,
      adjustmentType: 'percentage',
      validFrom: '2024-01-01',
      validTo: '',
      priority: 3,
      assignedTo: 'channels',
      status: 'active'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingList, setEditingList] = useState<PriceList | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    baseRule: 'cost' as 'cost' | 'price',
    adjustment: 0,
    adjustmentType: 'percentage' as 'percentage' | 'fixed',
    validFrom: '',
    validTo: '',
    priority: 1,
    assignedTo: 'all' as 'all' | 'customers' | 'channels',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleEdit = (priceList: PriceList) => {
    setEditingList(priceList);
    setFormData({
      name: priceList.name,
      baseRule: priceList.baseRule,
      adjustment: priceList.adjustment,
      adjustmentType: priceList.adjustmentType,
      validFrom: priceList.validFrom,
      validTo: priceList.validTo,
      priority: priceList.priority,
      assignedTo: priceList.assignedTo,
    });
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingList(null);
    setFormData({
      name: '',
      baseRule: 'cost',
      adjustment: 0,
      adjustmentType: 'percentage',
      validFrom: new Date().toISOString().split('T')[0],
      validTo: '',
      priority: priceLists.length + 1,
      assignedTo: 'all',
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingList) {
      setPriceLists(prev => prev.map(list =>
        list.id === editingList.id
          ? { ...list, ...formData }
          : list
      ));
    } else {
      const newList: PriceList = {
        id: Date.now().toString(),
        ...formData,
        status: 'active'
      };
      setPriceLists(prev => [...prev, newList]);
    }
    setShowModal(false);
  };

  const toggleStatus = (id: string) => {
    setPriceLists(prev => prev.map(list =>
      list.id === id
        ? { ...list, status: list.status === 'active' ? 'inactive' : 'active' }
        : list
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

  const formatAdjustment = (adjustment: number, type: string, baseRule: string) => {
    const sign = adjustment >= 0 ? '+' : '';
    if (type === 'percentage') {
      return `${sign}${adjustment}% sobre ${baseRule === 'cost' ? 'costo' : 'precio base'}`;
    }
    return `${sign}$${adjustment} sobre ${baseRule === 'cost' ? 'costo' : 'precio base'}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Listas de Precios</h2>
          <p className="text-gray-600 dark:text-gray-400">Administra las reglas de precios y márgenes</p>
        </div>
        <Button onClick={handleNew}>
          <div className="w-4 h-4 flex items-center justify-center mr-2">
            <i className="ri-add-line"></i>
          </div>
          Nueva Lista
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Lista</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Regla</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Vigencia</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Prioridad</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Asignación</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {priceLists.map((list) => (
                <tr key={list.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900 dark:text-white">{list.name}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatAdjustment(list.adjustment, list.adjustmentType, list.baseRule)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div>Desde: {new Date(list.validFrom).toLocaleDateString()}</div>
                      {list.validTo && <div>Hasta: {new Date(list.validTo).toLocaleDateString()}</div>}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                      {list.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      list.assignedTo === 'all'
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                        : list.assignedTo === 'customers'
                        ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300'
                        : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                    }`}>
                      {list.assignedTo === 'all' ? 'Todos' : 
                       list.assignedTo === 'customers' ? 'Clientes' : 'Canales'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleStatus(list.id)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                        list.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                      }`}
                    >
                      <div className="w-3 h-3 flex items-center justify-center mr-1">
                        <i className={list.status === 'active' ? 'ri-checkbox-circle-line' : 'ri-close-circle-line'}></i>
                      </div>
                      {list.status === 'active' ? 'Activa' : 'Inactiva'}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleEdit(list)}
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
                {editingList ? 'Editar Lista de Precios' : 'Nueva Lista de Precios'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  placeholder="Nombre de la lista"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Base de Cálculo
                  </label>
                  <select
                    value={formData.baseRule}
                    onChange={(e) => setFormData(prev => ({ ...prev, baseRule: e.target.value as 'cost' | 'price' }))}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  >
                    <option value="cost">Costo</option>
                    <option value="price">Precio Base</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Ajuste
                  </label>
                  <select
                    value={formData.adjustmentType}
                    onChange={(e) => setFormData(prev => ({ ...prev, adjustmentType: e.target.value as 'percentage' | 'fixed' }))}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo ($)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ajuste {formData.adjustmentType === 'percentage' ? '(%)' : '($)'}
                </label>
                <input
                  type="number"
                  step={formData.adjustmentType === 'percentage' ? '0.1' : '0.01'}
                  value={formData.adjustment}
                  onChange={(e) => setFormData(prev => ({ ...prev, adjustment: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  placeholder={formData.adjustmentType === 'percentage' ? '50' : '100.00'}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Válida Desde *
                  </label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Válida Hasta
                  </label>
                  <input
                    type="date"
                    value={formData.validTo}
                    onChange={(e) => setFormData(prev => ({ ...prev, validTo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prioridad
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Asignada a
                  </label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value as 'all' | 'customers' | 'channels' }))}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  >
                    <option value="all">Todos</option>
                    <option value="customers">Clientes específicos</option>
                    <option value="channels">Canales específicos</option>
                  </select>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Vista Previa</h4>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div>Costo del producto: $100.00</div>
                  <div>Resultado: {formatAdjustment(formData.adjustment, formData.adjustmentType, formData.baseRule)}</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Precio final: ${formData.baseRule === 'cost' 
                      ? formData.adjustmentType === 'percentage' 
                        ? (100 + (100 * formData.adjustment / 100)).toFixed(2)
                        : (100 + formData.adjustment).toFixed(2)
                      : formData.adjustmentType === 'percentage'
                        ? (150 + (150 * formData.adjustment / 100)).toFixed(2)
                        : (150 + formData.adjustment).toFixed(2)
                    }
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
                {editingList ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
