import { useState } from 'react';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';

interface SecuritySettings {
  require2FA: boolean;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  sessionTimeout: number; // in minutes
  trustedIPs: string[];
}

interface ActiveSession {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActivity: string;
  current: boolean;
}

export default function SecuritySettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [newTrustedIP, setNewTrustedIP] = useState('');
  
  const [settings, setSettings] = useState<SecuritySettings>({
    require2FA: false,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: false
    },
    sessionTimeout: 480, // 8 hours
    trustedIPs: ['192.168.1.0/24', '10.0.0.0/8']
  });

  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([
    {
      id: '1',
      device: 'Chrome en Windows',
      location: 'Buenos Aires, Argentina',
      ip: '192.168.1.100',
      lastActivity: '2024-01-20T16:30:00Z',
      current: true
    },
    {
      id: '2',
      device: 'Safari en iPhone',
      location: 'Buenos Aires, Argentina',
      ip: '192.168.1.105',
      lastActivity: '2024-01-20T14:15:00Z',
      current: false
    },
    {
      id: '3',
      device: 'Firefox en Ubuntu',
      location: 'Córdoba, Argentina',
      ip: '181.45.123.89',
      lastActivity: '2024-01-19T09:22:00Z',
      current: false
    }
  ]);

  const updateSettings = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setSettings(prev => ({ ...prev, [field]: value }));
    }
  };

  const addTrustedIP = () => {
    if (newTrustedIP && !settings.trustedIPs.includes(newTrustedIP)) {
      setSettings(prev => ({
        ...prev,
        trustedIPs: [...prev.trustedIPs, newTrustedIP]
      }));
      setNewTrustedIP('');
    }
  };

  const removeTrustedIP = (ip: string) => {
    setSettings(prev => ({
      ...prev,
      trustedIPs: prev.trustedIPs.filter(i => i !== ip)
    }));
  };

  const revokeSession = (sessionId: string) => {
    setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const getPasswordStrength = () => {
    let strength = 0;
    if (settings.passwordPolicy.minLength >= 8) strength++;
    if (settings.passwordPolicy.requireUppercase) strength++;
    if (settings.passwordPolicy.requireNumbers) strength++;
    if (settings.passwordPolicy.requireSpecialChars) strength++;
    
    return strength;
  };

  const passwordStrengthLabel = () => {
    const strength = getPasswordStrength();
    if (strength <= 1) return { label: 'Débil', color: 'text-red-600 dark:text-red-400' };
    if (strength <= 2) return { label: 'Media', color: 'text-yellow-600 dark:text-yellow-400' };
    if (strength <= 3) return { label: 'Fuerte', color: 'text-green-600 dark:text-green-400' };
    return { label: 'Muy fuerte', color: 'text-green-700 dark:text-green-300' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Seguridad</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Configuración de seguridad y acceso</p>
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

      {/* Two-Factor Authentication */}
      <Card title="Autenticación de Dos Factores" icon="ri-shield-check-line">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Requerir 2FA para todos los usuarios</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Los usuarios deberán configurar 2FA antes de acceder al sistema
              </p>
            </div>
            <button
              onClick={() => updateSettings('require2FA', !settings.require2FA)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                settings.require2FA ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-black transition-transform duration-200 ${
                  settings.require2FA ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Password Policy */}
      <Card title="Política de Contraseñas" icon="ri-lock-password-line">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Longitud mínima
            </label>
            <input
              type="number"
              min="6"
              max="32"
              value={settings.passwordPolicy.minLength}
              onChange={(e) => updateSettings('passwordPolicy.minLength', parseInt(e.target.value))}
              className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">caracteres</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requireUppercase"
                checked={settings.passwordPolicy.requireUppercase}
                onChange={(e) => updateSettings('passwordPolicy.requireUppercase', e.target.checked)}
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="requireUppercase" className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                Requerir mayúsculas (A-Z)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="requireNumbers"
                checked={settings.passwordPolicy.requireNumbers}
                onChange={(e) => updateSettings('passwordPolicy.requireNumbers', e.target.checked)}
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="requireNumbers" className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                Requerir números (0-9)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="requireSpecialChars"
                checked={settings.passwordPolicy.requireSpecialChars}
                onChange={(e) => updateSettings('passwordPolicy.requireSpecialChars', e.target.checked)}
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="requireSpecialChars" className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                Requerir caracteres especiales (!@#$%^&*)
              </label>
            </div>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Fortaleza de la política:</span>
              <span className={`text-sm font-medium ${passwordStrengthLabel().color}`}>
                {passwordStrengthLabel().label}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Session Management */}
      <Card title="Gestión de Sesiones" icon="ri-time-line">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tiempo de sesión inactiva (minutos)
            </label>
            <select
              value={settings.sessionTimeout}
              onChange={(e) => updateSettings('sessionTimeout', parseInt(e.target.value))}
              className="px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value={30}>30 minutos</option>
              <option value={60}>1 hora</option>
              <option value={120}>2 horas</option>
              <option value={240}>4 horas</option>
              <option value={480}>8 horas</option>
              <option value={720}>12 horas</option>
              <option value={1440}>24 horas</option>
            </select>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Sesiones activas</h4>
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="w-4 h-4 flex items-center justify-center mr-2">
                        <i className="ri-computer-line text-gray-500 dark:text-gray-400"></i>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{session.device}</span>
                      {session.current && (
                        <span className="ml-2 px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                          Actual
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {session.location} • {session.ip}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      Última actividad: {new Date(session.lastActivity).toLocaleString()}
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => revokeSession(session.id)}
                    >
                      <div className="w-4 h-4 flex items-center justify-center mr-1">
                        <i className="ri-logout-circle-line"></i>
                      </div>
                      Revocar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Trusted IPs */}
      <Card title="IPs Confiables" icon="ri-global-line">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Las IPs en esta lista pueden acceder sin restricciones adicionales.
          </p>
          
          <div className="flex gap-3">
            <input
              type="text"
              value={newTrustedIP}
              onChange={(e) => setNewTrustedIP(e.target.value)}
              placeholder="192.168.1.0/24 o 203.0.113.1"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <Button onClick={addTrustedIP} disabled={!newTrustedIP}>
              <div className="w-4 h-4 flex items-center justify-center mr-1">
                <i className="ri-add-line"></i>
              </div>
              Agregar
            </Button>
          </div>

          <div className="space-y-2">
            {settings.trustedIPs.map((ip, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <span className="font-mono text-sm text-gray-900 dark:text-white">{ip}</span>
                <button
                  onClick={() => removeTrustedIP(ip)}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 cursor-pointer"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-delete-bin-line"></i>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}