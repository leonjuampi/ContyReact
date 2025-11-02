import { useState } from 'react';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';

interface SMTPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  security: 'none' | 'tls' | 'ssl';
  from_name: string;
  from_email: string;
}

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  enabled: boolean;
}

interface APIConfig {
  key: string;
  created_at: string;
  last_used: string;
  permissions: string[];
}

export default function IntegrationSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  
  const [smtpConfig, setSMTPConfig] = useState<SMTPConfig>({
    host: 'smtp.gmail.com',
    port: 587,
    username: '',
    password: '',
    security: 'tls',
    from_name: 'Conty Sistema',
    from_email: ''
  });

  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    {
      id: '1',
      name: 'Sistema de Inventario',
      url: 'https://api.inventory.com/webhook',
      events: ['venta_creada', 'stock_bajo'],
      secret: 'wh_secret_abc123',
      enabled: true
    },
    {
      id: '2',
      name: 'CRM Integration',
      url: 'https://hooks.zapier.com/hooks/catch/...',
      events: ['presupuesto_aceptado'],
      secret: 'wh_secret_xyz789',
      enabled: false
    }
  ]);

  const [apiConfig, setApiConfig] = useState<APIConfig>({
    key: 'ck_live_abcd1234efgh5678ijkl9012mnop3456',
    created_at: '2024-01-15T10:30:00Z',
    last_used: '2024-01-20T14:22:00Z',
    permissions: ['read', 'write']
  });

  const updateSMTPConfig = (field: keyof SMTPConfig, value: string | number) => {
    setSMTPConfig(prev => ({ ...prev, [field]: value }));
  };

  const testEmailConnection = async () => {
    setTestingEmail(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTestingEmail(false);
    alert('Email de prueba enviado exitosamente a ' + smtpConfig.from_email);
  };

  const generateNewApiKey = () => {
    const newKey = 'ck_live_' + Math.random().toString(36).substring(2, 34);
    setApiConfig(prev => ({
      ...prev,
      key: newKey,
      created_at: new Date().toISOString(),
      last_used: 'Nunca'
    }));
  };

  const toggleWebhook = (id: string) => {
    setWebhooks(prev => prev.map(wh => 
      wh.id === id ? { ...wh, enabled: !wh.enabled } : wh
    ));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Integraciones</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Conecta Conty con servicios externos</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="whitespace-nowrap"
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
              Guardar cambios
            </>
          )}
        </Button>
      </div>

      {/* SMTP/Email Configuration */}
      <Card title="Configuración de Email (SMTP)" icon="ri-mail-send-line">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Servidor SMTP
              </label>
              <input
                type="text"
                value={smtpConfig.host}
                onChange={(e) => updateSMTPConfig('host', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="smtp.gmail.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Puerto
                </label>
                <input
                  type="number"
                  value={smtpConfig.port}
                  onChange={(e) => updateSMTPConfig('port', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Seguridad
                </label>
                <select
                  value={smtpConfig.security}
                  onChange={(e) => updateSMTPConfig('security', e.target.value as 'none' | 'tls' | 'ssl')}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="none">Ninguna</option>
                  <option value="tls">TLS</option>
                  <option value="ssl">SSL</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Usuario
              </label>
              <input
                type="email"
                value={smtpConfig.username}
                onChange={(e) => updateSMTPConfig('username', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="tu-email@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={smtpConfig.password}
                onChange={(e) => updateSMTPConfig('password', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del remitente
              </label>
              <input
                type="text"
                value={smtpConfig.from_name}
                onChange={(e) => updateSMTPConfig('from_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Conty Sistema"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email del remitente
              </label>
              <input
                type="email"
                value={smtpConfig.from_email}
                onChange={(e) => updateSMTPConfig('from_email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="noreply@tuempresa.com"
              />
            </div>

            <div className="pt-4">
              <Button
                variant="outline"
                onClick={testEmailConnection}
                disabled={testingEmail || !smtpConfig.from_email}
                className="w-full"
              >
                {testingEmail ? (
                  <>
                    <div className="w-4 h-4 flex items-center justify-center mr-2">
                      <i className="ri-loader-4-line animate-spin"></i>
                    </div>
                    Enviando prueba...
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 flex items-center justify-center mr-2">
                      <i className="ri-send-plane-line"></i>
                    </div>
                    Probar envío
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Webhooks */}
      <Card title="Webhooks" icon="ri-webhook-line">
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <div key={webhook.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <button
                    onClick={() => toggleWebhook(webhook.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                      webhook.enabled ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-black transition-transform duration-200 ${
                        webhook.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <h4 className="ml-3 font-medium text-gray-900 dark:text-white">{webhook.name}</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{webhook.url}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Eventos:</span>
                  {webhook.events.map((event) => (
                    <span
                      key={event}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full"
                    >
                      {event}
                    </span>
                  ))}
                </div>
              </div>
              <Button variant="outline" size="sm">
                <div className="w-4 h-4 flex items-center justify-center mr-1">
                  <i className="ri-edit-line"></i>
                </div>
                Editar
              </Button>
            </div>
          ))}
          
          <Button variant="outline" className="w-full">
            <div className="w-4 h-4 flex items-center justify-center mr-2">
              <i className="ri-add-line"></i>
            </div>
            Agregar nuevo webhook
          </Button>
        </div>
      </Card>

      {/* API Configuration */}
      <Card title="API REST" icon="ri-code-s-slash-line">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Key
            </label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiConfig.key}
                  readOnly
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white cursor-default"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={`ri-${showApiKey ? 'eye-off' : 'eye'}-line`}></i>
                  </div>
                </button>
              </div>
              <Button variant="outline" onClick={generateNewApiKey}>
                <div className="w-4 h-4 flex items-center justify-center mr-2">
                  <i className="ri-refresh-line"></i>
                </div>
                Regenerar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Creada:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {new Date(apiConfig.created_at).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Último uso:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {apiConfig.last_used === 'Nunca' ? 'Nunca' : new Date(apiConfig.last_used).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">Permisos:</span>
            <div className="flex gap-2">
              {apiConfig.permissions.map((permission) => (
                <span
                  key={permission}
                  className="px-2 py-1 text-xs bg-black dark:bg-white text-white dark:text-black rounded-full"
                >
                  {permission === 'read' ? 'Lectura' : 'Escritura'}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Endpoint base:</strong> https://api.conty.app/v1
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              <strong>Documentación:</strong> https://docs.conty.app/api
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}