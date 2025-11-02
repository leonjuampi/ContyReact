
import { useState } from 'react';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';

interface NumberingRule {
  id: string;
  documentType: string;
  format: string;
  nextNumber: number;
  resetBy: 'none' | 'year' | 'month' | 'pos';
  padding: number;
}

export default function NumberingSettings() {
  const [rules, setRules] = useState<NumberingRule[]>([
    {
      id: '1',
      documentType: 'Factura A',
      format: 'FA-{PV}-{NUM}',
      nextNumber: 1,
      resetBy: 'none',
      padding: 8
    },
    {
      id: '2',
      documentType: 'Factura B',
      format: 'FB-{PV}-{NUM}',
      nextNumber: 1,
      resetBy: 'none',
      padding: 8
    },
    {
      id: '3',
      documentType: 'Presupuesto',
      format: 'PRES-{AÑO}-{NUM}',
      nextNumber: 1,
      resetBy: 'year',
      padding: 6
    },
    {
      id: '4',
      documentType: 'Remito',
      format: 'REM-{PV}-{NUM}',
      nextNumber: 1,
      resetBy: 'none',
      padding: 8
    }
  ]);

  const [editingRule, setEditingRule] = useState<NumberingRule | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const availableTokens = [
    { token: '{TIPO}', description: 'Tipo de documento' },
    { token: '{PV}', description: 'Punto de venta' },
    { token: '{NUM}', description: 'Número secuencial' },
    { token: '{AÑO}', description: 'Año actual (4 dígitos)' },
    { token: '{MES}', description: 'Mes actual (2 dígitos)' },
  ];

  const generatePreview = (format: string, padding: number) => {
    const previewValues = {
      '{TIPO}': 'FA',
      '{PV}': '0001',
      '{NUM}': '1'.padStart(padding, '0'),
      '{AÑO}': '2024',
      '{MES}': '03'
    };

    let preview = format;
    Object.entries(previewValues).forEach(([token, value]) => {
      preview = preview.replace(new RegExp(token, 'g'), value);
    });

    return preview;
  };

  const handleEdit = (rule: NumberingRule) => {
    setEditingRule({ ...rule });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingRule) {
      setRules(prev => prev.map(rule =>
        rule.id === editingRule.id ? editingRule : rule
      ));
      setShowModal(false);
      setEditingRule(null);
    }
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
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Numeración de Documentos</h2>
        <p className="text-gray-600 dark:text-gray-400">Configura el formato de numeración para cada tipo de documento</p>
      </div>

      {/* Available Tokens */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tokens Disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableTokens.map((token) => (
            <div key={token.token} className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono text-gray-900 dark:text-white mr-3">
                {token.token}
              </code>
              <span className="text-sm text-gray-600 dark:text-gray-400">{token.description}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Numbering Rules */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reglas de Numeración</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Documento</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Formato</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Vista Previa</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Próximo N°</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Reinicio</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                    {rule.documentType}
                  </td>
                  <td className="py-3 px-4">
                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-gray-700 dark:text-gray-300">
                      {rule.format}
                    </code>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                      {generatePreview(rule.format, rule.padding)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {rule.nextNumber.toString().padStart(rule.padding, '0')}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {rule.resetBy === 'none' ? 'Nunca' : 
                     rule.resetBy === 'year' ? 'Por año' :
                     rule.resetBy === 'month' ? 'Por mes' : 'Por PV'}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleEdit(rule)}
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

      {/* Edit Modal */}
      {showModal && editingRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-2xl mx-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Editar Numeración: {editingRule.documentType}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Formato *
                </label>
                <input
                  type="text"
                  value={editingRule.format}
                  onChange={(e) => setEditingRule(prev => prev ? { ...prev, format: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent font-mono"
                  placeholder="Ej: FA-{PV}-{NUM}"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Usa tokens como {'{PV}'}, {'{NUM}'}, {'{AÑO}'}, etc.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Próximo Número
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingRule.nextNumber}
                    onChange={(e) => setEditingRule(prev => prev ? { ...prev, nextNumber: parseInt(e.target.value) || 1 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Padding (Ceros)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={editingRule.padding}
                    onChange={(e) => setEditingRule(prev => prev ? { ...prev, padding: parseInt(e.target.value) || 6 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reiniciar Numeración
                </label>
                <select
                  value={editingRule.resetBy}
                  onChange={(e) => setEditingRule(prev => prev ? { ...prev, resetBy: e.target.value as any } : null)}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                >
                  <option value="none">Nunca reiniciar</option>
                  <option value="year">Reiniciar cada año</option>
                  <option value="month">Reiniciar cada mes</option>
                  <option value="pos">Reiniciar por punto de venta</option>
                </select>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Vista Previa</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Resultado:</span>
                  <code className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-2 py-1 rounded font-mono text-sm">
                    {generatePreview(editingRule.format, editingRule.padding)}
                  </code>
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
                Guardar Cambios
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
