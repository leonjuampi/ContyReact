
import { useState } from 'react';
import Button from '../../../components/base/Button';

interface SaveViewModalProps {
  onClose: () => void;
  onSave: (name: string) => void;
}

export default function SaveViewModal({ onClose, onSave }: SaveViewModalProps) {
  const [viewName, setViewName] = useState('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const handleSave = () => {
    if (viewName.trim()) {
      onSave(viewName.trim());
    }
  };

  const savedViews = [
    { name: 'Reporte Mensual', description: 'Vista mensual con comparación', isDefault: true },
    { name: 'Análisis por Vendedor', description: 'Enfoque en performance de vendedores', isDefault: false },
    { name: 'Top Productos', description: 'Productos más vendidos del mes', isDefault: false }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Guardar Vista
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
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre de la vista
              </label>
              <input
                type="text"
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                placeholder="Ej: Reporte Semanal de Ventas"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción de la vista..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              />
            </div>

            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-black dark:text-white border-gray-300 dark:border-gray-600 focus:ring-black dark:focus:ring-white"
                />
                <span className="text-sm text-gray-900 dark:text-white">
                  Usar como vista predeterminada
                </span>
              </label>
            </div>
          </div>

          {/* Vistas guardadas */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Vistas guardadas
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {savedViews.map((view, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {view.name}
                      </p>
                      {view.isDefault && (
                        <span className="px-2 py-0.5 bg-black dark:bg-white text-white dark:text-black text-xs rounded-full">
                          Por defecto
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {view.description}
                    </p>
                  </div>
                  <button className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 ml-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-delete-bin-line"></i>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
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
            onClick={handleSave}
            disabled={!viewName.trim()}
            className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
          >
            <div className="w-4 h-4 flex items-center justify-center mr-2">
              <i className="ri-bookmark-line"></i>
            </div>
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
}
