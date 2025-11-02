import { useState, useRef } from 'react';
import Button from '../../../components/base/Button';
import Card from '../../../components/base/Card';

interface ImportCSVModalProps {
  onClose: () => void;
  onImport: (data: any[]) => void;
}

interface ImportStep {
  id: number;
  title: string;
  description: string;
}

const importSteps: ImportStep[] = [
  {
    id: 1,
    title: 'Seleccionar archivo',
    description: 'Elige el archivo CSV con los productos a importar'
  },
  {
    id: 2,
    title: 'Mapear columnas',
    description: 'Asigna las columnas del CSV a los campos del producto'
  },
  {
    id: 3,
    title: 'Validar datos',
    description: 'Revisa los datos antes de importar'
  },
  {
    id: 4,
    title: 'Importar',
    description: 'Procesa e importa los productos'
  }
];

const requiredFields = [
  { key: 'sku', label: 'SKU', required: true },
  { key: 'name', label: 'Nombre', required: true },
  { key: 'category', label: 'Categoría', required: true },
  { key: 'price', label: 'Precio', required: true },
  { key: 'cost', label: 'Costo', required: false },
  { key: 'stock', label: 'Stock', required: false },
  { key: 'description', label: 'Descripción', required: false },
  { key: 'barcode', label: 'Código de barras', required: false },
  { key: 'supplier', label: 'Proveedor', required: false }
];

const sampleData = `SKU,Nombre,Categoría,Precio,Costo,Stock,Descripción
CAM001,Camisa Manga Larga Blanca,Camisas,5500,3200,25,Camisa elegante de manga larga
PAN002,Pantalón Jean Azul Classic,Pantalones,8900,4800,8,Pantalón jean clásico azul
ZAP003,Zapatillas Deportivas Negras,Calzado,12400,7200,15,Zapatillas deportivas cómodas
BUZ004,Buzo Canguro Gris,Buzos,7200,4100,2,Buzo con capucha y bolsillo canguro
ACC005,Cinturón Cuero Marrón,Accesorios,3800,2200,18,Cinturón de cuero genuino`;

export default function ImportCSVModal({ onClose, onImport }: ImportCSVModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<{ [key: string]: string }>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: number;
    warnings: string[];
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      parseCSV(file);
    } else {
      alert('Por favor selecciona un archivo CSV válido');
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const data = lines.map(line => line.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));
      
      if (data.length > 0) {
        setHeaders(data[0]);
        setCsvData(data.slice(1));
        setCurrentStep(2);
      }
    };
    reader.readAsText(file);
  };

  const handleColumnMapping = (field: string, column: string) => {
    setColumnMapping(prev => ({ ...prev, [field]: column }));
  };

  const validateData = () => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Verificar que los campos requeridos estén mapeados
    const requiredMapped = requiredFields.filter(field => field.required);
    for (const field of requiredMapped) {
      if (!columnMapping[field.key]) {
        errors.push(`El campo "${field.label}" es obligatorio y debe estar mapeado`);
      }
    }

    // Validar datos de muestra
    if (csvData.length > 0 && Object.keys(columnMapping).length > 0) {
      const sampleRows = csvData.slice(0, 5);
      
      sampleRows.forEach((row, index) => {
        // Validar SKU único
        const skuIndex = headers.indexOf(columnMapping.sku);
        if (skuIndex >= 0 && !row[skuIndex]) {
          errors.push(`Fila ${index + 2}: SKU vacío`);
        }

        // Validar precio
        const priceIndex = headers.indexOf(columnMapping.price);
        if (priceIndex >= 0) {
          const price = parseFloat(row[priceIndex]);
          if (isNaN(price) || price <= 0) {
            errors.push(`Fila ${index + 2}: Precio inválido`);
          }
        }

        // Validar stock
        const stockIndex = headers.indexOf(columnMapping.stock);
        if (stockIndex >= 0 && row[stockIndex]) {
          const stock = parseInt(row[stockIndex]);
          if (isNaN(stock) || stock < 0) {
            warnings.push(`Fila ${index + 2}: Stock inválido, se asignará 0`);
          }
        }
      });
    }

    setValidationErrors(errors);
    setImportResults({ success: 0, errors: errors.length, warnings });
    
    if (errors.length === 0) {
      setCurrentStep(4);
    } else {
      setCurrentStep(3);
    }
  };

  const processImport = async () => {
    setIsProcessing(true);
    
    try {
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const importedProducts = csvData.map((row, index) => {
        const product: any = { id: Date.now() + index };
        
        Object.entries(columnMapping).forEach(([field, column]) => {
          const columnIndex = headers.indexOf(column);
          if (columnIndex >= 0) {
            let value = row[columnIndex];
            
            // Convertir tipos de datos
            if (field === 'price' || field === 'cost') {
              value = parseFloat(value) || 0;
            } else if (field === 'stock') {
              value = parseInt(value) || 0;
            }
            
            product[field] = value;
          }
        });

        // Valores por defecto
        product.status = 'active';
        product.margin = product.price && product.cost 
          ? ((product.price - product.cost) / product.cost) * 100 
          : 0;
        product.lowStock = product.stock <= 10;

        return product;
      });

      setImportResults({
        success: importedProducts.length,
        errors: 0,
        warnings: []
      });

      onImport(importedProducts);
      
    } catch (error) {
      console.error('Error al importar:', error);
      setImportResults({
        success: 0,
        errors: csvData.length,
        warnings: ['Error durante la importación']
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSample = () => {
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'productos_ejemplo.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setCurrentStep(1);
    setSelectedFile(null);
    setCsvData([]);
    setHeaders([]);
    setColumnMapping({});
    setValidationErrors([]);
    setImportResults(null);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-black dark:text-white">Importar productos desde CSV</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Importa múltiples productos desde un archivo CSV
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {importSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep >= step.id
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {currentStep > step.id ? (
                    <i className="ri-check-line"></i>
                  ) : (
                    step.id
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
                </div>
                {index < importSteps.length - 1 && (
                  <div className={`flex-1 h-px mx-4 ${
                    currentStep > step.id ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6">
            {/* Paso 1: Seleccionar archivo */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <Card>
                  <div className="text-center py-8">
                    <i className="ri-file-upload-line text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
                    <h3 className="text-lg font-medium text-black dark:text-white mb-2">
                      Selecciona tu archivo CSV
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Arrastra y suelta tu archivo aquí o haz clic para seleccionar
                    </p>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    <Button
                      variant="primary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <i className="ri-folder-open-line mr-2"></i>
                      Seleccionar archivo CSV
                    </Button>
                  </div>
                </Card>

                <Card>
                  <h3 className="text-lg font-medium text-black dark:text-white mb-4">
                    Formato requerido
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-black dark:text-white mb-3">Campos obligatorios:</h4>
                      <ul className="space-y-2">
                        {requiredFields.filter(f => f.required).map(field => (
                          <li key={field.key} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <i className="ri-check-line text-green-600 dark:text-green-400 mr-2"></i>
                            {field.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-black dark:text-white mb-3">Campos opcionales:</h4>
                      <ul className="space-y-2">
                        {requiredFields.filter(f => !f.required).map(field => (
                          <li key={field.key} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <i className="ri-subtract-line text-gray-400 mr-2"></i>
                            {field.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-black dark:text-white">¿No tienes un archivo CSV?</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Descarga nuestro archivo de ejemplo para comenzar
                        </p>
                      </div>
                      <Button variant="outline" onClick={downloadSample}>
                        <i className="ri-download-line mr-2"></i>
                        Descargar ejemplo
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Paso 2: Mapear columnas */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <Card>
                  <h3 className="text-lg font-medium text-black dark:text-white mb-4">
                    Mapear columnas del CSV
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Asigna cada columna de tu CSV a los campos correspondientes del producto
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requiredFields.map(field => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-black dark:text-white mb-2">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <select
                          value={columnMapping[field.key] || ''}
                          onChange={(e) => handleColumnMapping(field.key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white pr-8"
                        >
                          <option value="">Seleccionar columna</option>
                          {headers.map(header => (
                            <option key={header} value={header}>{header}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </Card>

                {csvData.length > 0 && (
                  <Card>
                    <h3 className="text-lg font-medium text-black dark:text-white mb-4">
                      Vista previa de datos
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            {headers.map(header => (
                              <th key={header} className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvData.slice(0, 3).map((row, index) => (
                            <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                              {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="py-2 px-3 text-black dark:text-white">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Mostrando las primeras 3 filas de {csvData.length} productos
                    </p>
                  </Card>
                )}
              </div>
            )}

            {/* Paso 3: Validar datos */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <Card>
                  <h3 className="text-lg font-medium text-black dark:text-white mb-4">
                    Validación de datos
                  </h3>

                  {validationErrors.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                      <div className="flex items-center mb-2">
                        <i className="ri-error-warning-line text-red-600 dark:text-red-400 mr-2"></i>
                        <h4 className="font-medium text-red-800 dark:text-red-400">
                          Se encontraron errores que deben corregirse:
                        </h4>
                      </div>
                      <ul className="space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index} className="text-sm text-red-700 dark:text-red-300">
                            • {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {importResults?.warnings && importResults.warnings.length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                      <div className="flex items-center mb-2">
                        <i className="ri-alert-line text-yellow-600 dark:text-yellow-400 mr-2"></i>
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-400">
                          Advertencias:
                        </h4>
                      </div>
                      <ul className="space-y-1">
                        {importResults.warnings.map((warning, index) => (
                          <li key={index} className="text-sm text-yellow-700 dark:text-yellow-300">
                            • {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-black dark:text-white">
                        {csvData.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Productos a importar
                      </div>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {validationErrors.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Errores encontrados
                      </div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {importResults?.warnings?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Advertencias
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Paso 4: Importar */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <Card>
                  <div className="text-center py-8">
                    {isProcessing ? (
                      <>
                        <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-black dark:border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                        <h3 className="text-lg font-medium text-black dark:text-white mb-2">
                          Importando productos...
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Por favor espera mientras procesamos los datos
                        </p>
                      </>
                    ) : importResults && importResults.success > 0 ? (
                      <>
                        <i className="ri-check-double-line text-4xl text-green-600 dark:text-green-400 mb-4"></i>
                        <h3 className="text-lg font-medium text-black dark:text-white mb-2">
                          ¡Importación completada!
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Se importaron {importResults.success} productos exitosamente
                        </p>
                        
                        <div className="flex gap-3 justify-center">
                          <Button variant="outline" onClick={resetImport}>
                            <i className="ri-refresh-line mr-2"></i>
                            Importar más productos
                          </Button>
                          <Button variant="primary" onClick={onClose}>
                            <i className="ri-check-line mr-2"></i>
                            Finalizar
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <i className="ri-upload-cloud-line text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
                        <h3 className="text-lg font-medium text-black dark:text-white mb-2">
                          Listo para importar
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Se importarán {csvData.length} productos
                        </p>
                        
                        <Button variant="primary" onClick={processImport}>
                          <i className="ri-upload-line mr-2"></i>
                          Iniciar importación
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {selectedFile && `Archivo: ${selectedFile.name}`}
          </div>
          
          <div className="flex gap-3">
            {currentStep > 1 && currentStep < 4 && !isProcessing && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                <i className="ri-arrow-left-line mr-2"></i>
                Anterior
              </Button>
            )}
            
            {currentStep === 2 && (
              <Button
                variant="primary"
                onClick={validateData}
                disabled={Object.keys(columnMapping).length === 0}
              >
                Validar datos
                <i className="ri-arrow-right-line ml-2"></i>
              </Button>
            )}
            
            {currentStep === 3 && validationErrors.length === 0 && (
              <Button
                variant="primary"
                onClick={() => setCurrentStep(4)}
              >
                Continuar
                <i className="ri-arrow-right-line ml-2"></i>
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