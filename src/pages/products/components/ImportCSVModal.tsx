// src/pages/products/components/ImportCSVModal.tsx
// (Este es el código SIMPLIFICADO, basado en el de customers)
import { useState, useRef } from 'react';
import Button from '../../../components/base/Button';
import Card from '../../../components/base/Card';

interface ImportCSVModalProps {
  onClose: () => void;
  onImport: (file: File) => void; 
  onDownloadTemplate: () => void;
}

export default function ImportCSVModal({ onClose, onImport, onDownloadTemplate }: ImportCSVModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setSelectedFile(file);
    } else {
      alert('Por favor selecciona un archivo CSV válido');
      setSelectedFile(null);
    }
  };

  const handleImportClick = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      // onImport es la función de page.tsx que llama a la API
      await onImport(selectedFile);
    } catch (error) {
      // El toast de error se maneja en la página principal
      console.error(error);
    } finally {
      setIsProcessing(false);
      // No cerramos el modal, esperamos a que la página lo cierre
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-black dark:text-white">Importar Productos desde CSV</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Sube un archivo CSV para crear productos y variantes
          </p>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          <Card>
            <div className="text-center py-8">
              <i className="ri-file-upload-line text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
              <h3 className="text-lg font-medium text-black dark:text-white mb-2">
                {selectedFile ? selectedFile.name : 'Selecciona tu archivo CSV'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {selectedFile 
                  ? `(${(selectedFile.size / 1024).toFixed(1)} KB) - ¿Listo para importar?`
                  : 'Arrastra y suelta tu archivo aquí o haz clic para seleccionar'}
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {!selectedFile ? (
                <Button
                  variant="primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <i className="ri-folder-open-line mr-2"></i>
                  Seleccionar archivo CSV
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleImportClick}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Procesando...' : 'Iniciar Importación'}
                </Button>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-medium text-black dark:text-white mb-4">
              Instrucciones
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              El archivo CSV debe coincidir con el formato de la plantilla. Cada fila representa una **variante** de producto.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Si un `product_sku` se repite en varias filas, se crearán múltiples variantes (ej. talles/colores) bajo ese mismo producto.
            </p>
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-black dark:text-white">¿No tienes un archivo CSV?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Descarga nuestra plantilla para ver el formato requerido.
                  </p>
                </div>
                <Button variant="outline" onClick={onDownloadTemplate}>
                  <i className="ri-download-line mr-2"></i>
                  Descargar plantilla
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}