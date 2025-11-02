
import { useState } from 'react';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';

export default function CompanySettings() {
  const [formData, setFormData] = useState({
    businessName: 'Empresa Demo SRL',
    cuit: '20-12345678-9',
    taxCondition: 'responsable_inscripto',
    fiscalAddress: 'Av. Corrientes 1234, CABA',
    timezone: 'America/Argentina/Buenos_Aires',
    currency: 'ARS',
    senderEmail: 'ventas@empresa.com',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Información de la Empresa</h2>
        <p className="text-gray-600 dark:text-gray-400">Configura los datos principales de tu empresa</p>
      </div>

      <Card>
        <div className="space-y-6">
          {/* Basic Company Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Razón Social *
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                placeholder="Ingresa la razón social"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CUIT *
              </label>
              <input
                type="text"
                value={formData.cuit}
                onChange={(e) => handleInputChange('cuit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                placeholder="20-12345678-9"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Condición IVA *
              </label>
              <select
                value={formData.taxCondition}
                onChange={(e) => handleInputChange('taxCondition', e.target.value)}
                className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
              >
                <option value="responsable_inscripto">Responsable Inscripto</option>
                <option value="monotributo">Monotributo</option>
                <option value="exento">Exento</option>
                <option value="consumidor_final">Consumidor Final</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Zona Horaria
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
              >
                <option value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</option>
                <option value="America/Argentina/Cordoba">Córdoba (GMT-3)</option>
                <option value="America/Argentina/Mendoza">Mendoza (GMT-3)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Domicilio Fiscal *
            </label>
            <textarea
              value={formData.fiscalAddress}
              onChange={(e) => handleInputChange('fiscalAddress', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent resize-none"
              placeholder="Dirección fiscal completa"
            />
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Logo de la Empresa
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border border-gray-300 dark:border-gray-600">
                {logoFile ? (
                  <img
                    src={URL.createObjectURL(logoFile)}
                    alt="Logo"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-6 h-6 flex items-center justify-center">
                    <i className="ri-image-line text-gray-400 text-xl"></i>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <div className="w-4 h-4 flex items-center justify-center mr-2">
                    <i className="ri-upload-line"></i>
                  </div>
                  Subir Logo
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  PNG, JPG hasta 2MB. Recomendado: 200x200px
                </p>
              </div>
            </div>
          </div>

          {/* Financial Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Moneda
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
              >
                <option value="ARS">Peso Argentino (ARS)</option>
                <option value="USD">Dólar Estadounidense (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Remitente
                <span className="inline-flex items-center ml-2 cursor-help" title="Email que aparecerá como remitente en las comunicaciones automáticas">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-question-line text-gray-400 text-sm"></i>
                  </div>
                </span>
              </label>
              <input
                type="email"
                value={formData.senderEmail}
                onChange={(e) => handleInputChange('senderEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                placeholder="ventas@empresa.com"
              />
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

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="min-w-32"
        >
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
