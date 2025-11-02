
import { useState } from 'react';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';

export default function TaxSettings() {
  const [settings, setSettings] = useState({
    defaultVat: '21',
    perceptions: true,
    rounding: 'nearest_cent',
    showPricesWithTax: true,
    showTaxBreakdown: true,
  });

  const [perceptionRates, setPerceptionRates] = useState([
    { id: '1', name: 'IIBB Buenos Aires', rate: 3.5, applicable: 'all' },
    { id: '2', name: 'IVA Percepción', rate: 10.5, applicable: 'exempt' },
    { id: '3', name: 'Ganancias', rate: 2.0, applicable: 'all' },
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Configuración de Impuestos</h2>
        <p className="text-gray-600 dark:text-gray-400">Configura IVA, percepciones y tratamiento de impuestos</p>
      </div>

      {/* IVA Configuration */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">IVA y Configuración Básica</h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                IVA por Defecto
              </label>
              <select
                value={settings.defaultVat}
                onChange={(e) => handleSettingChange('defaultVat', e.target.value)}
                className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
              >
                <option value="0">0% - Exento</option>
                <option value="10.5">10.5% - Reducido</option>
                <option value="21">21% - General</option>
                <option value="27">27% - Especial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Redondeo
              </label>
              <select
                value={settings.rounding}
                onChange={(e) => handleSettingChange('rounding', e.target.value)}
                className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
              >
                <option value="nearest_cent">Al centavo más cercano</option>
                <option value="up">Siempre hacia arriba</option>
                <option value="down">Siempre hacia abajo</option>
                <option value="none">Sin redondeo</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Mostrar precios con impuestos</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Los precios mostrados incluyen IVA</p>
              </div>
              <button
                onClick={() => handleSettingChange('showPricesWithTax', !settings.showPricesWithTax)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${
                  settings.showPricesWithTax
                    ? 'bg-black dark:bg-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-black transition-transform ${
                    settings.showPricesWithTax ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Mostrar desglose de impuestos</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mostrar detalle de IVA en facturas</p>
              </div>
              <button
                onClick={() => handleSettingChange('showTaxBreakdown', !settings.showTaxBreakdown)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${
                  settings.showTaxBreakdown
                    ? 'bg-black dark:bg-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-black transition-transform ${
                    settings.showTaxBreakdown ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Perceptions */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Percepciones</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Configura las percepciones aplicables</p>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-700 dark:text-gray-300 mr-3">Activar percepciones</span>
            <button
              onClick={() => handleSettingChange('perceptions', !settings.perceptions)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${
                settings.perceptions
                  ? 'bg-black dark:bg-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-black transition-transform ${
                  settings.perceptions ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {settings.perceptions && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Percepción</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Alícuota %</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Aplicable a</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Estado</th>
                </tr>
              </thead>
              <tbody>
                {perceptionRates.map((perception) => (
                  <tr key={perception.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                      {perception.name}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {perception.rate}%
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {perception.applicable === 'all' ? 'Todos' : 'Exentos'}
                    </td>
                    <td className="py-3 px-4">
                      <button className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 cursor-pointer">
                        <div className="w-3 h-3 flex items-center justify-center mr-1">
                          <i className="ri-checkbox-circle-line"></i>
                        </div>
                        Activa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Price Preview */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vista Previa de Precios</h3>
        
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Precio base:</span>
              <span className="font-medium text-gray-900 dark:text-white">$1,000.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">IVA ({settings.defaultVat}%):</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ${(1000 * (parseFloat(settings.defaultVat) / 100)).toFixed(2)}
              </span>
            </div>
            {settings.perceptions && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Percepciones:</span>
                <span className="font-medium text-gray-900 dark:text-white">$35.00</span>
              </div>
            )}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between">
              <span className="font-semibold text-gray-900 dark:text-white">Precio final:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                ${(1000 + (1000 * (parseFloat(settings.defaultVat) / 100)) + (settings.perceptions ? 35 : 0)).toFixed(2)}
              </span>
            </div>
          </div>
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

        <Button onClick={handleSave} disabled={isSaving}>
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
    </div>
  );
}
