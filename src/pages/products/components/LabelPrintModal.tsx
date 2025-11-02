
import { useState, useEffect } from 'react';
import Button from '../../../components/base/Button';
import Card from '../../../components/base/Card';

interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  category: string;
  image?: string;
}

interface LabelPrintModalProps {
  selectedProducts: Product[];
  onClose: () => void;
  onPrint: (config: LabelConfig) => void;
}

interface LabelConfig {
  template: string;
  size: string;
  copies: number;
  includePrice: boolean;
  includeSKU: boolean;
  includeBarcode: boolean;
  includeQR: boolean;
  includeCategory: boolean;
  fontSize: string;
  layout: string;
  paperSize: string;
  orientation: string;
}

const labelTemplates = [
  { id: 'basic', name: 'Básica', description: 'Nombre y precio simple' },
  { id: 'detailed', name: 'Detallada', description: 'Nombre, SKU, precio y código de barras' },
  { id: 'minimal', name: 'Minimalista', description: 'Solo nombre y precio' },
  { id: 'premium', name: 'Premium', description: 'Diseño elegante con todos los datos' },
  { id: 'barcode', name: 'Código de Barras', description: 'Enfoque en código de barras' },
  { id: 'qr', name: 'Código QR', description: 'Con código QR para información digital' }
];

const labelSizes = [
  { id: '30x20', name: '30x20mm', description: 'Etiqueta pequeña' },
  { id: '40x30', name: '40x30mm', description: 'Etiqueta mediana' },
  { id: '50x30', name: '50x30mm', description: 'Etiqueta estándar' },
  { id: '60x40', name: '60x40mm', description: 'Etiqueta grande' },
  { id: '70x50', name: '70x50mm', description: 'Etiqueta extra grande' },
  { id: 'custom', name: 'Personalizado', description: 'Tamaño personalizado' }
];

const paperSizes = [
  { id: 'a4', name: 'A4 (210x297mm)' },
  { id: 'letter', name: 'Carta (216x279mm)' },
  { id: 'roll', name: 'Rollo continuo' }
];

const fontSizes = [
  { id: 'xs', name: 'Extra Pequeño (8pt)' },
  { id: 'sm', name: 'Pequeño (10pt)' },
  { id: 'md', name: 'Mediano (12pt)' },
  { id: 'lg', name: 'Grande (14pt)' },
  { id: 'xl', name: 'Extra Grande (16pt)' }
];

export default function LabelPrintModal({ selectedProducts, onClose, onPrint }: LabelPrintModalProps) {
  const [config, setConfig] = useState<LabelConfig>({
    template: 'detailed',
    size: '50x30',
    copies: 1,
    includePrice: true,
    includeSKU: true,
    includeBarcode: true,
    includeQR: false,
    includeCategory: false,
    fontSize: 'md',
    layout: 'grid',
    paperSize: 'a4',
    orientation: 'portrait'
  });

  const [step, setStep] = useState(1);
  const [customSize, setCustomSize] = useState({ width: 50, height: 30 });
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && e.ctrlKey) {
        handlePrint();
      } else if (e.key === 'p' || e.key === 'P') {
        if (!e.ctrlKey && !e.altKey) {
          e.preventDefault();
          setPreviewMode(!previewMode);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [previewMode]);

  const handlePrint = () => {
    onPrint(config);
  };

  const handleDownloadTemplate = () => {
    // Simular descarga de plantilla
    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,Plantilla de etiquetas - Configuración guardada';
    link.download = `plantilla-etiquetas-${config.template}.txt`;
    link.click();
  };

  const getTotalLabels = () => {
    return selectedProducts.length * config.copies;
  };

  const getLabelsPerPage = () => {
    if (config.paperSize === 'roll') return 'Continuo';
    
    const sizeMap: { [key: string]: number } = {
      '30x20': 65,
      '40x30': 35,
      '50x30': 24,
      '60x40': 15,
      '70x50': 12,
      'custom': Math.floor((210 / customSize.width) * (297 / customSize.height))
    };
    
    return sizeMap[config.size] || 24;
  };

  const renderLabelPreview = (product: Product) => {
    const template = labelTemplates.find(t => t.id === config.template);
    
    return (
      <div className="border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-800 text-center relative overflow-hidden"
           style={{ 
             width: config.size === 'custom' ? `${customSize.width * 2}px` : '100px',
             height: config.size === 'custom' ? `${customSize.height * 2}px` : '60px',
             fontSize: config.fontSize === 'xs' ? '6px' : 
                      config.fontSize === 'sm' ? '8px' :
                      config.fontSize === 'md' ? '10px' :
                      config.fontSize === 'lg' ? '12px' : '14px'
           }}>
        
        {config.template === 'basic' && (
          <div className="h-full flex flex-col justify-center">
            <div className="font-bold text-black dark:text-white truncate">{product.name}</div>
            {config.includePrice && (
              <div className="text-gray-600 dark:text-gray-400">${(product.price / 100).toFixed(2)}</div>
            )}
          </div>
        )}

        {config.template === 'detailed' && (
          <div className="h-full flex flex-col justify-between text-xs">
            <div className="font-bold text-black dark:text-white truncate">{product.name}</div>
            <div className="space-y-1">
              {config.includeSKU && <div className="font-mono text-gray-600 dark:text-gray-400">{product.sku}</div>}
              {config.includePrice && <div className="font-bold text-black dark:text-white">${(product.price / 100).toFixed(2)}</div>}
              {config.includeBarcode && <div className="text-xs text-gray-500">|||||||||||</div>}
            </div>
          </div>
        )}

        {config.template === 'minimal' && (
          <div className="h-full flex flex-col justify-center">
            <div className="text-black dark:text-white truncate">{product.name}</div>
            {config.includePrice && (
              <div className="font-bold text-black dark:text-white">${(product.price / 100).toFixed(2)}</div>
            )}
          </div>
        )}

        {config.template === 'premium' && (
          <div className="h-full flex flex-col justify-between text-xs bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-1 rounded">
            <div className="font-bold text-black dark:text-white truncate">{product.name}</div>
            <div className="space-y-1">
              {config.includeSKU && <div className="font-mono text-gray-600 dark:text-gray-400">{product.sku}</div>}
              {config.includeCategory && <div className="text-gray-500 dark:text-gray-400">{product.category}</div>}
              {config.includePrice && <div className="font-bold text-lg text-black dark:text-white">${(product.price / 100).toFixed(2)}</div>}
            </div>
          </div>
        )}

        {config.template === 'barcode' && (
          <div className="h-full flex flex-col justify-center items-center">
            <div className="text-xs text-black dark:text-white truncate mb-1">{product.name}</div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-xs font-mono">|||||||||||</div>
            </div>
            {config.includePrice && (
              <div className="text-xs font-bold text-black dark:text-white">${(product.price / 100).toFixed(2)}</div>
            )}
          </div>
        )}

        {config.template === 'qr' && (
          <div className="h-full flex items-center justify-between text-xs">
            <div className="flex-1">
              <div className="font-bold text-black dark:text-white truncate">{product.name}</div>
              {config.includePrice && <div className="text-black dark:text-white">${(product.price / 100).toFixed(2)}</div>}
              {config.includeSKU && <div className="font-mono text-gray-600 dark:text-gray-400">{product.sku}</div>}
            </div>
            {config.includeQR && (
              <div className="w-8 h-8 border border-gray-400 flex items-center justify-center">
                <div className="w-6 h-6 bg-black dark:bg-white" style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, currentColor 1px, currentColor 2px), repeating-linear-gradient(90deg, transparent, transparent 1px, currentColor 1px, currentColor 2px)'
                }}></div>
              </div>
            )}
          </div>
        )}

        {/* Indicador de copias */}
        {config.copies > 1 && (
          <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-1 rounded-bl">
            x{config.copies}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-xl font-semibold text-black dark:text-white">
              Imprimir Etiquetas de Productos
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {selectedProducts.length} producto{selectedProducts.length !== 1 ? 's' : ''} seleccionado{selectedProducts.length !== 1 ? 's' : ''} • {getTotalLabels()} etiqueta{getTotalLabels() !== 1 ? 's' : ''} total{getTotalLabels() !== 1 ? 'es' : ''}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <i className={`${previewMode ? 'ri-eye-off-line' : 'ri-eye-line'} mr-2`}></i>
              {previewMode ? 'Ocultar' : 'Vista Previa'} (P)
            </Button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Panel de configuración */}
          <div className="w-1/2 p-6 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="space-y-6">
              {/* Paso 1: Plantilla */}
              <Card>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-6 h-6 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <h4 className="text-lg font-semibold text-black dark:text-white">Seleccionar Plantilla</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {labelTemplates.map(template => (
                    <label
                      key={template.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        config.template === template.id
                          ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="template"
                        value={template.id}
                        checked={config.template === template.id}
                        onChange={(e) => setConfig({...config, template: e.target.value})}
                        className="sr-only"
                      />
                      <div className="font-medium text-black dark:text-white">{template.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{template.description}</div>
                    </label>
                  ))}
                </div>
              </Card>

              {/* Paso 2: Tamaño */}
              <Card>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-6 h-6 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <h4 className="text-lg font-semibold text-black dark:text-white">Tamaño de Etiqueta</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {labelSizes.map(size => (
                    <label
                      key={size.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        config.size === size.id
                          ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="size"
                        value={size.id}
                        checked={config.size === size.id}
                        onChange={(e) => setConfig({...config, size: e.target.value})}
                        className="sr-only"
                      />
                      <div className="font-medium text-black dark:text-white">{size.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{size.description}</div>
                    </label>
                  ))}
                </div>

                {config.size === 'custom' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ancho (mm)
                      </label>
                      <input
                        type="number"
                        value={customSize.width}
                        onChange={(e) => setCustomSize({...customSize, width: parseInt(e.target.value) || 50})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                        min="10"
                        max="200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Alto (mm)
                      </label>
                      <input
                        type="number"
                        value={customSize.height}
                        onChange={(e) => setCustomSize({...customSize, height: parseInt(e.target.value) || 30})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                        min="10"
                        max="200"
                      />
                    </div>
                  </div>
                )}
              </Card>

              {/* Paso 3: Contenido */}
              <Card>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-6 h-6 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <h4 className="text-lg font-semibold text-black dark:text-white">Contenido de Etiqueta</h4>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includePrice}
                      onChange={(e) => setConfig({...config, includePrice: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-black dark:text-white">Incluir precio</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeSKU}
                      onChange={(e) => setConfig({...config, includeSKU: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-black dark:text-white">Incluir SKU</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeBarcode}
                      onChange={(e) => setConfig({...config, includeBarcode: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-black dark:text-white">Incluir código de barras</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeQR}
                      onChange={(e) => setConfig({...config, includeQR: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-black dark:text-white">Incluir código QR</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeCategory}
                      onChange={(e) => setConfig({...config, includeCategory: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-black dark:text-white">Incluir categoría</span>
                  </label>
                </div>
              </Card>

              {/* Paso 4: Configuración avanzada */}
              <Card>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-6 h-6 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <h4 className="text-lg font-semibold text-black dark:text-white">Configuración de Impresión</h4>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Copias por producto
                    </label>
                    <input
                      type="number"
                      value={config.copies}
                      onChange={(e) => setConfig({...config, copies: Math.max(1, parseInt(e.target.value) || 1)})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                      min="1"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tamaño de fuente
                    </label>
                    <select
                      value={config.fontSize}
                      onChange={(e) => setConfig({...config, fontSize: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white pr-8"
                    >
                      {fontSizes.map(size => (
                        <option key={size.id} value={size.id}>{size.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tamaño de papel
                    </label>
                    <select
                      value={config.paperSize}
                      onChange={(e) => setConfig({...config, paperSize: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white pr-8"
                    >
                      {paperSizes.map(paper => (
                        <option key={paper.id} value={paper.id}>{paper.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Orientación
                    </label>
                    <div className="flex space-x-3">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="orientation"
                          value="portrait"
                          checked={config.orientation === 'portrait'}
                          onChange={(e) => setConfig({...config, orientation: e.target.value})}
                        />
                        <span className="text-black dark:text-white">Vertical</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="orientation"
                          value="landscape"
                          checked={config.orientation === 'landscape'}
                          onChange={(e) => setConfig({...config, orientation: e.target.value})}
                        />
                        <span className="text-black dark:text-white">Horizontal</span>
                      </label>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Información de impresión */}
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-3">
                  <i className="ri-information-line text-blue-600 dark:text-blue-400 mt-0.5"></i>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-2">Resumen de impresión:</p>
                    <ul className="space-y-1">
                      <li>• Total de etiquetas: {getTotalLabels()}</li>
                      <li>• Etiquetas por página: {getLabelsPerPage()}</li>
                      <li>• Plantilla: {labelTemplates.find(t => t.id === config.template)?.name}</li>
                      <li>• Tamaño: {config.size === 'custom' ? `${customSize.width}x${customSize.height}mm` : labelSizes.find(s => s.id === config.size)?.name}</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Panel de vista previa */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-black dark:text-white mb-2">Vista Previa</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Así se verán las etiquetas impresas
              </p>
            </div>

            {previewMode ? (
              <div className="space-y-6">
                {/* Vista previa de etiquetas */}
                <div className="grid grid-cols-3 gap-4">
                  {selectedProducts.slice(0, 9).map((product, index) => (
                    <div key={product.id} className="space-y-2">
                      {Array.from({ length: Math.min(config.copies, 3) }, (_, copyIndex) => (
                        <div key={copyIndex}>
                          {renderLabelPreview(product)}
                        </div>
                      ))}
                      {config.copies > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          +{config.copies - 3} más
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {selectedProducts.length > 9 && (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-4 border-t border-gray-200 dark:border-gray-700">
                    Y {selectedProducts.length - 9} producto{selectedProducts.length - 9 !== 1 ? 's' : ''} más...
                  </div>
                )}

                {/* Simulación de página */}
                <div className="mt-8 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <div className="text-center text-gray-500 dark:text-gray-400 mb-4">
                    <i className="ri-file-paper-line text-2xl mb-2"></i>
                    <p>Simulación de página {config.paperSize.toUpperCase()}</p>
                    <p className="text-sm">
                      {typeof getLabelsPerPage() === 'number' ? `${getLabelsPerPage()} etiquetas por página` : 'Rollo continuo'}
                    </p>
                  </div>
                  
                  {typeof getLabelsPerPage() === 'number' && (
                    <div className="grid gap-1" style={{
                      gridTemplateColumns: `repeat(${Math.floor(Math.sqrt(getLabelsPerPage() as number))}, 1fr)`
                    }}>
                      {Array.from({ length: Math.min(getLabelsPerPage() as number, 12) }, (_, i) => (
                        <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded p-1 text-xs text-center">
                          Etiqueta {i + 1}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <i className="ri-eye-line text-4xl mb-4"></i>
                  <p>Presiona "Vista Previa" para ver las etiquetas</p>
                  <p className="text-sm mt-2">O usa la tecla P</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer con botones */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
            >
              <i className="ri-download-line mr-2"></i>
              Descargar Plantilla
            </Button>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Atajos: <span className="font-mono">P Vista previa</span> • <span className="font-mono">Ctrl+Enter Imprimir</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handlePrint}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
            >
              <i className="ri-printer-line mr-2"></i>
              Imprimir Etiquetas (Ctrl+Enter)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
