import { useState } from 'react';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';

interface ExportOption {
  id: string;
  name: string;
  description: string;
  format: 'csv' | 'json' | 'zip';
  enabled: boolean;
}

interface BackupHistory {
  id: string;
  type: 'manual' | 'scheduled';
  date: string;
  size: string;
  status: 'completed' | 'failed' | 'in_progress';
}

export default function BackupExportSettings() {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedExports, setSelectedExports] = useState<string[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  
  const [exportOptions] = useState<ExportOption[]>([
    {
      id: 'products',
      name: 'Productos',
      description: 'Catálogo completo con precios, stock y categorías',
      format: 'csv',
      enabled: true
    },
    {
      id: 'customers',
      name: 'Clientes',
      description: 'Base de datos de clientes con información de contacto',
      format: 'csv',
      enabled: true
    },
    {
      id: 'sales',
      name: 'Ventas',
      description: 'Historial de ventas con detalles de transacciones',
      format: 'csv',
      enabled: true
    },
    {
      id: 'quotes',
      name: 'Presupuestos',
      description: 'Presupuestos generados con estado y seguimiento',
      format: 'csv',
      enabled: true
    },
    {
      id: 'inventory',
      name: 'Movimientos de Stock',
      description: 'Historial completo de movimientos de inventario',
      format: 'csv',
      enabled: true
    },
    {
      id: 'full_backup',
      name: 'Backup Completo',
      description: 'Exportación completa de toda la base de datos',
      format: 'zip',
      enabled: true
    }
  ]);

  const [backupHistory] = useState<BackupHistory[]>([
    {
      id: '1',
      type: 'manual',
      date: '2024-01-20T15:30:00Z',
      size: '2.4 MB',
      status: 'completed'
    },
    {
      id: '2',
      type: 'scheduled',
      date: '2024-01-19T02:00:00Z',
      size: '2.3 MB',
      status: 'completed'
    },
    {
      id: '3',
      type: 'manual',
      date: '2024-01-18T10:15:00Z',
      size: '2.2 MB',
      status: 'completed'
    },
    {
      id: '4',
      type: 'scheduled',
      date: '2024-01-17T02:00:00Z',
      size: '0 B',
      status: 'failed'
    }
  ]);

  const toggleExportSelection = (optionId: string) => {
    setSelectedExports(prev => 
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const selectAllExports = () => {
    setSelectedExports(exportOptions.map(option => option.id));
  };

  const clearAllExports = () => {
    setSelectedExports([]);
  };

  const handleExport = async () => {
    if (selectedExports.length === 0) return;
    
    setIsExporting(true);
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsExporting(false);
    
    // Simulate download
    alert(`Exportación completada: ${selectedExports.length} archivos descargados`);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setImportFile(files[0]);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    
    setIsImporting(true);
    // Simulate import process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsImporting(false);
    setImportFile(null);
    
    alert('Importación completada exitosamente');
  };

  const downloadBackup = (backupId: string) => {
    alert(`Descargando backup ${backupId}...`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'ri-check-line text-green-600 dark:text-green-400';
      case 'failed':
        return 'ri-close-line text-red-600 dark:text-red-400';
      case 'in_progress':
        return 'ri-loader-4-line animate-spin text-blue-600 dark:text-blue-400';
      default:
        return 'ri-time-line text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Backup & Export</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Exporta e importa datos del sistema</p>
        </div>
      </div>

      {/* Export Data */}
      <Card title="Exportar Datos" icon="ri-download-2-line">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Selecciona los datos que deseas exportar
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAllExports}>
                Seleccionar todo
              </Button>
              <Button variant="outline" size="sm" onClick={clearAllExports}>
                Limpiar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exportOptions.map((option) => (
              <div
                key={option.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedExports.includes(option.id)
                    ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-900'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900'
                }`}
                onClick={() => toggleExportSelection(option.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedExports.includes(option.id)}
                        onChange={() => toggleExportSelection(option.id)}
                        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded cursor-pointer"
                      />
                      <h4 className="ml-3 font-medium text-gray-900 dark:text-white">{option.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-7">
                      {option.description}
                    </p>
                  </div>
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded uppercase">
                    {option.format}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={handleExport}
              disabled={selectedExports.length === 0 || isExporting}
              className="whitespace-nowrap"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 flex items-center justify-center mr-2">
                    <i className="ri-loader-4-line animate-spin"></i>
                  </div>
                  Exportando...
                </>
              ) : (
                <>
                  <div className="w-4 h-4 flex items-center justify-center mr-2">
                    <i className="ri-download-line"></i>
                  </div>
                  Exportar seleccionados ({selectedExports.length})
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Import Data */}
      <Card title="Importar Datos" icon="ri-upload-2-line">
        <div className="space-y-4">
          <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <div className="text-center">
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 text-gray-400">
                <i className="ri-file-upload-line text-2xl"></i>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Selecciona un archivo CSV para importar
              </p>
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleFileChange}
                className="hidden"
                id="import-file"
              />
              <label
                htmlFor="import-file"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              >
                <div className="w-4 h-4 flex items-center justify-center mr-2">
                  <i className="ri-folder-open-line"></i>
                </div>
                Seleccionar archivo
              </label>
            </div>
          </div>

          {importFile && (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center">
                <div className="w-4 h-4 flex items-center justify-center mr-2">
                  <i className="ri-file-text-line text-gray-600 dark:text-gray-400"></i>
                </div>
                <span className="text-sm text-gray-900 dark:text-white">{importFile.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  ({(importFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleImport}
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <>
                      <div className="w-4 h-4 flex items-center justify-center mr-1">
                        <i className="ri-loader-4-line animate-spin"></i>
                      </div>
                      Importando...
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 flex items-center justify-center mr-1">
                        <i className="ri-upload-line"></i>
                      </div>
                      Importar
                    </>
                  )}
                </Button>
                <button
                  onClick={() => setImportFile(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-close-line"></i>
                  </div>
                </button>
              </div>
            </div>
          )}

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Importante:</strong> La importación sobrescribirá los datos existentes. 
              Se recomienda hacer un backup antes de importar.
            </p>
          </div>
        </div>
      </Card>

      {/* Backup History */}
      <Card title="Historial de Backups" icon="ri-history-line">
        <div className="space-y-3">
          {backupHistory.map((backup) => (
            <div key={backup.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center">
                <div className="w-5 h-5 flex items-center justify-center mr-3">
                  <i className={getStatusIcon(backup.status)}></i>
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(backup.date).toLocaleDateString()}
                    </span>
                    <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                      {backup.type === 'manual' ? 'Manual' : 'Programado'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(backup.date).toLocaleTimeString()} • {backup.size}
                  </div>
                </div>
              </div>
              {backup.status === 'completed' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadBackup(backup.id)}
                >
                  <div className="w-4 h-4 flex items-center justify-center mr-1">
                    <i className="ri-download-line"></i>
                  </div>
                  Descargar
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}