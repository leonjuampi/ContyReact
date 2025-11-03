// src/pages/customers/components/ImportCSVModal.tsx
import { useState, useRef } from 'react';
import Button from '../../../components/base/Button';
import Card from '../../../components/base/Card';

interface ImportCSVModalProps {
  onClose: () => void;
  onImport: (file: File) => void; // <--- 1. Cambiado a onImport(file: File)
  onDownloadTemplate: () => void; // <--- 2. Añadido
}

// ... (const importSteps, requiredFields... no cambian)

export default function ImportCSVModal({ onClose, onImport, onDownloadTemplate }: ImportCSVModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setSelectedFile(file);
      setCurrentStep(2); // Avanzamos al paso de confirmación
    } else {
      alert('Por favor selecciona un archivo CSV válido');
      setSelectedFile(null);
      setCurrentStep(1);
    }
  };

  const handleImportClick = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      await onImport(selectedFile); // 3. Llamamos a la función onImport con el archivo
    } catch (error) {
      // El toast de error se maneja en la página principal
      console.error(error);
    } finally {
      setIsProcessing(false);
      // No cerramos el modal aquí, esperamos al toast de la página principal
    }
  };

  // ... (resetImport no cambia)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 ...">
      <div className="bg-white dark:bg-gray-900 rounded-lg ...">
        {/* ... (Header y Progress Steps no cambian) ... */}
        
        <div className="overflow-y-auto ...">
          <div className="p-6">
            
            {/* Paso 1: Seleccionar archivo */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <Card>{/* ... (Tu UI de "soltar archivo") ... */}</Card>
                <Card>
                  {/* ... (Tu UI de "Formato requerido") ... */}
                  <div className="mt-6 pt-6 border-t ...">
                    <div className="flex items-center justify-between">
                      {/* ... */}
                      <Button variant="outline" onClick={onDownloadTemplate}> {/* <--- 4. Conectado */}
                        <i className="ri-download-line mr-2"></i>
                        Descargar ejemplo
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Paso 2: Confirmar (Simplificado) */}
            {currentStep === 2 && (
              <Card>
                <h3 className="text-lg font-medium text-black dark:text-white mb-4">
                  Confirmar Importación
                </h3>
                {selectedFile ? (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Estás a punto de importar el archivo: <strong>{selectedFile.name}</strong> 
                      ({(selectedFile.size / 1024).toFixed(1)} KB).
                    </p>
                    <p className="text-sm text-yellow-600 dark:bg-yellow-50 p-3 rounded-lg mb-6">
                      <strong>Aviso:</strong> El archivo será procesado en el servidor.
                      Cualquier error en filas específicas será reportado al finalizar.
                    </p>
                    <Button variant="primary" onClick={handleImportClick} disabled={isProcessing}>
                      {isProcessing 
                        ? 'Procesando...' 
                        : 'Iniciar Importación'
                      }
                    </Button>
                  </div>
                ) : (
                   <p className="text-gray-600 dark:text-gray-400">
                     Vuelve al paso 1 y selecciona un archivo.
                   </p>
                )}
              </Card>
            )}

          </div>
        </div>

        {/* Footer (Simplificado) */}
        <div className="flex items-center justify-between p-6 ...">
          <div className="text-sm ...">
            {selectedFile && `Archivo: ${selectedFile.name}`}
          </div>
          <div className="flex gap-3">
            {currentStep > 1 && !isProcessing && (
              <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                <i className="ri-arrow-left-line mr-2"></i>
                Anterior
              </Button>
            )}
            {currentStep === 1 && (
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}